import { NextRequest, NextResponse } from "next/server";
import { getBranchTokenByLocal } from "../config";

// URL de la API externa - usar variable de entorno
// const EXTERNAL_API_URL = process.env.EXTERNAL_API_URL || "http://localhost:8000";

// Map para evitar procesar el mismo pago múltiples veces
// MercadoPago envía múltiples notificaciones (payment + merchant_order)
const processedPayments = new Map<string, number>();

// Limpiar pagos procesados cada 30 minutos
setInterval(() => {
  const now = Date.now();
  const TTL = 30 * 60 * 1000; // 30 minutos

  for (const [paymentId, timestamp] of processedPayments.entries()) {
    if (now - timestamp > TTL) {
      processedPayments.delete(paymentId);
      console.log(`🗑️ [Webhook] Pago procesado expirado: ${paymentId}`);
    }
  }
}, 10 * 60 * 1000); // Ejecutar cada 10 minutos

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { searchParams } = new URL(req.url);

    console.log("🔔 [Webhook] Notificación recibida de MercadoPago");
    console.log("🔔 [Webhook] Body:", JSON.stringify(body, null, 2));
    console.log("🔔 [Webhook] Query params:", Object.fromEntries(searchParams));

    // 🔹 Recuperamos el local desde el query del webhook
    const localParam = searchParams.get("local");
    console.log("🏪 [Webhook] Local detectado:", localParam);

    if (!localParam) {
      console.warn("⚠️ [Webhook] Webhook sin local en query");
      return NextResponse.json({ ok: true });
    }

    let MP_TOKEN;
    try {
      MP_TOKEN = getBranchTokenByLocal(localParam);
      console.log("🔑 [Webhook] Token obtenido para local:", localParam);
    } catch (error) {
      console.error("❌ [Webhook] Error obteniendo token:", error);
      return NextResponse.json({ ok: true });
    }

    // MP puede mandar dos formatos:
    // A) { type: "payment", data: { id } }
    // B) query ?topic=merchant_order&id=<id>
    let type = body?.type ?? searchParams.get("topic");
    let id = body?.data?.id ?? searchParams.get("id");

    // Acknowledge rápido para que MP no reintente:
    const response = NextResponse.json({ ok: true });

    // Normalizamos a string
    type = Array.isArray(type) ? type[0] : type;
    id = Array.isArray(id) ? id[0] : id;

    console.log("📋 [Webhook] Type:", type, "| ID:", id);

    if (!type || !id) {
      console.warn("⚠️ [Webhook] Webhook sin type/id", {
        body,
        searchParams: Object.fromEntries(searchParams),
      });
      return response;
    }

    if (type === "payment") {
      // Procesar en background
      console.log("💳 [Webhook] Procesando payment:", id);
      handlePayment(id as string, MP_TOKEN, localParam).catch((err) =>
        console.error("❌ [Webhook] Error procesando payment:", err)
      );
      return response;
    }

    if (type === "merchant_order") {
      // MercadoPago envía merchant_order después de payment
      // NO procesamos merchant_order para evitar duplicados
      // La orden ya se creó en handlePayment
      console.log(
        "📦 [Webhook] merchant_order recibido (ignorado para evitar duplicados):",
        id
      );
      return response;
    }

    console.log("⚠️ [Webhook] Webhook type no manejado:", type);
    return response;
  } catch (err) {
    console.error("❌ [Webhook] Error en webhook:", err);
    return NextResponse.json({ ok: true });
  }
}

async function handlePayment(paymentId: string, token: string, local: string) {
  try {
    // Verificar si ya procesamos este pago
    if (processedPayments.has(paymentId)) {
      console.log(
        "⚠️ [HandlePayment] Pago ya procesado anteriormente:",
        paymentId
      );
      return;
    }

    // Marcar como procesado inmediatamente
    processedPayments.set(paymentId, Date.now());
    console.log("💳 [HandlePayment] Consultando pago:", paymentId);

    const r = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      }
    );

    if (!r.ok) {
      console.error(
        "❌ [HandlePayment] Error consultando MercadoPago:",
        r.status,
        r.statusText
      );
      return;
    }

    const data = await r.json();
    console.log("💳 [HandlePayment] Estado del pago:", data.status);
    console.log("💳 [HandlePayment] Detalle:", data.status_detail);
    console.log("💳 [HandlePayment] Local:", local);

    if (data.status === "approved") {
      console.log("✅ [HandlePayment] Payment approved, procesando orden...");

      // PRIMERO: Intentar crear la orden en la API externa
      let orderId = null;
      try {
        console.log("📤 [HandlePayment] Creando orden en API externa...");
        const order = await createOrderFromPayment(data, local);

        orderId =
          order?.id ??
          order?.id_order ??
          order?.order_id ??
          order?.data?.id ??
          order?._id ??
          null;

        console.log("✅ [HandlePayment] Orden creada en API externa");
        console.log("🆔 [HandlePayment] Order ID detectado:", orderId);
        console.log(
          "📦 [HandlePayment] Orden completa:",
          JSON.stringify(order, null, 2)
        );
      } catch (error) {
        console.error(
          "❌ [HandlePayment] Error creando orden en API externa:",
          error
        );
        // Continuar para guardar orden temporal con payment_id aunque falle la API
        console.log(
          "⚠️ [HandlePayment] Continuando sin order_id de API externa"
        );
      }

      // SEGUNDO: Guardar orden temporal (incluso si no hay orderId de la API externa)
      try {
        const tempOrderData = {
          payment_id: paymentId,
          order_id: orderId || `pending_${paymentId}`, // Usar ID temporal si no hay orderId
          status: orderId ? "created" : "pending_external_api",
          timestamp: Date.now(),
        };

        console.log(
          "💾 [HandlePayment] Guardando orden temporal:",
          tempOrderData
        );

        const tempResponse = await fetch(
          `${
            process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
          }/api/orders/temp`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(tempOrderData),
          }
        );

        if (tempResponse.ok) {
          console.log(
            "✅ [HandlePayment] Orden temporal guardada exitosamente"
          );
          console.log(
            `📋 [HandlePayment] payment_id=${paymentId}, order_id=${tempOrderData.order_id}`
          );
        } else {
          const errorText = await tempResponse.text();
          console.error(
            "❌ [HandlePayment] Error guardando orden temporal:",
            tempResponse.status,
            errorText
          );
        }
      } catch (error) {
        console.error(
          "❌ [HandlePayment] Error crítico guardando orden temporal:",
          error
        );
      }

      // TERCERO: Enviar notificación por WhatsApp (opcional)
      // if (orderId) {
      //   await sendOrderToWhatsApp(order);
      // }
    } else if (data.status === "pending") {
      console.log("⏳ [HandlePayment] Payment pending");
    } else {
      console.log(
        "❌ [HandlePayment] Payment failed or cancelled:",
        data.status
      );
    }
  } catch (e) {
    console.error("❌ [HandlePayment] Error general:", e);
  }
}

// Función para crear orden desde el pago aprobado usando la API externa
async function createOrderFromPayment(
  paymentData: Record<string, unknown>,
  local: string
) {
  try {
    console.log("🏗️ [CreateOrder] Iniciando creación de orden");

    // Obtener metadata de la preferencia
    const metadata = (paymentData.metadata || {}) as Record<string, unknown>;
    const payer = (paymentData.payer || {}) as Record<string, unknown>;
    const payerPhone = (payer.phone || {}) as Record<string, unknown>;

    console.log(
      "📋 [CreateOrder] Metadata:",
      JSON.stringify(metadata, null, 2)
    );

    // Crear orden usando el formato de tu API externa
    const orderData = {
      payment_method: paymentData.payment_method_id ?? "mercadopago",
      delivery_mode: metadata.delivery_mode ?? "delivery",
      price: Number(metadata.price ?? paymentData.transaction_amount),
      status: "Confirmado",
      order_notes: metadata.order_notes ?? "",
      local: metadata.local ?? local,
      fries: metadata.fries ?? "",
      drinks: metadata.drinks ?? "",
      name: metadata.name ?? payer.first_name ?? "Cliente",
      phone: Number(metadata.phone ?? payerPhone.number ?? 0),
      email: metadata.email ?? payer.email ?? "",
      address: metadata.address ?? "Dirección no especificada",
      coupon: metadata.coupon ?? null,
      // 👇 Productos como strings JSON
      products: Array.isArray(metadata.products)
        ? metadata.products.map((p: unknown) => JSON.stringify(p))
        : [],
    };

    console.log(
      "📤 [CreateOrder] Datos a enviar:",
      JSON.stringify(orderData, null, 2)
    );
    console.log(
      "🌐 [CreateOrder] URL API externa:",
      `https://api-burgerli.iwebtecnology.com/api/createOrder`
    );

    // Llamar a la API externa para crear la orden
    const response = await fetch(
      `https://api-burgerli.iwebtecnology.com/api/createOrder`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      }
    );

    console.log(
      "📥 [CreateOrder] Respuesta de API externa:",
      response.status,
      response.statusText
    );

    if (!response.ok) {
      const err = await response.text();
      console.error("❌ [CreateOrder] Error de API externa:", err);
      throw new Error(
        `Error API externa: ${response.status} ${response.statusText} – ${err}`
      );
    }

    const createdOrder = await response.json();
    console.log("✅ [CreateOrder] Orden creada exitosamente en API externa");
    console.log(
      "📦 [CreateOrder] Respuesta:",
      JSON.stringify(createdOrder, null, 2)
    );

    // Agregar información adicional del pago
    const enrichedOrder = {
      ...createdOrder,
      paymentInfo: {
        transactionId: paymentData.id,
        method: paymentData.payment_method_id,
        status: paymentData.status,
        amount: paymentData.transaction_amount,
      },
      metadata: metadata,
    };

    return enrichedOrder;
  } catch (error) {
    console.error(
      "❌ [CreateOrder] Error creando orden en API externa:",
      error
    );
    throw error;
  }
}

