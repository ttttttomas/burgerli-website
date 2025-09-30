import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";

const MP_TOKEN = process.env.MP_ACCESS_TOKEN!;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { searchParams } = new URL(req.url);
    
    // MP puede mandar dos formatos:
    // A) { type: "payment", data: { id } }
    // B) query ?topic=merchant_order&id=<id>
    let type = body?.type ?? searchParams.get("topic") ?? searchParams.get("type");
    let id = body?.data?.id ?? searchParams.get("id");

    // Acknowledge rápido para que MP no reintente:
    const response = NextResponse.json({ ok: true });

    // Normalizá a string
    type = Array.isArray(type) ? type[0] : type;
    id = Array.isArray(id) ? id[0] : id;

    if (!type || !id) {
      console.warn("[MP] Webhook sin type/id", { body, searchParams: Object.fromEntries(searchParams) });
      return response;
    }

    if (type === "payment") {
      // Procesar en background para no bloquear la respuesta
      handlePayment(id as string).catch(err => 
        console.error("[MP] Error procesando payment:", err)
      );
      return response;
    }

    if (type === "merchant_order") {
      // Para Checkout Pro suele llegar este tipo
      handleMerchantOrder(id as string).catch(err => 
        console.error("[MP] Error procesando merchant_order:", err)
      );
      return response;
    }

    console.log("[MP] Webhook type no manejado:", type);
    return response;
  } catch (err) {
    console.error("[MP] Error en webhook:", err);
    return NextResponse.json({ ok: true }); // Siempre responder 200 para evitar reintentos
  }
}

async function handlePayment(paymentId: string) {
  try {
    const r = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${MP_TOKEN}` },
      cache: "no-store",
    });
    const data = await r.json();

    console.log("[MP] payment", paymentId, data.status, data.status_detail);

    if (data.status === "approved") {
      console.log("💳 Payment approved, procesando orden...");
      
      try {
        // Crear orden en la API externa
        const order = await createOrderFromPayment(data);
        console.log("🎉 ORDEN CREADA EN API EXTERNA:", order.id || order._id);
        
        // Guardar copia local para /success (opcional)
        await saveOrderToLocalStorage(order);
        
        // Enviar orden por WhatsApp a los dueños de la tienda
        await sendOrderToWhatsApp(order);
        
      } catch (error) {
        console.error("❌ Error procesando orden aprobada:", error);
        // Continuar sin lanzar error para no afectar el webhook
      }
      
    } else if (data.status === "pending") {
      console.log("payment pending");
    } else {
      console.log("payment failed or cancelled:", data.status);
    }
  } catch (e) {
    console.error("[MP] handlePayment error:", e);
  }
}

// Función para crear orden desde el pago aprobado usando la API externa
async function createOrderFromPayment(paymentData: any) {
  try {
    // Obtener metadata de la preferencia
    const metadata = paymentData.metadata || {};
    console.log(paymentData);
    
    // Crear orden usando el formato de tu API externa
    const orderData = {
      id_order: randomUUID(),  
      created_at: new Date().toISOString(),
      payment_method: paymentData.order.type ?? "Efectivo",
      delivery_mode: metadata.delivery_mode ?? "delivery",
      price: Number(metadata.price ?? paymentData.transaction_amount),
      status: "Confirmado",
      order_notes: metadata.order_notes ?? "",
      local: metadata.local ?? "",
      fries: metadata.fries ?? "",
      drinks: metadata.drinks ?? "",
      name: metadata.name ?? paymentData.payer?.first_name ?? "Cliente",
      phone: Number(metadata.phone ?? paymentData.payer?.phone?.number ?? 0),
      email: metadata.email ?? paymentData.payer?.email ?? "",
      address: metadata.address ?? "Dirección no especificada",
      coupon: metadata.coupon ?? null,
      // 👇 Parche: productos como strings JSON
      products: Array.isArray(metadata.products)
        ? metadata.products.map((p: any) => JSON.stringify(p))
        : [],
    };

    console.log("📦 Creando orden en API externa:", orderData);

    // Llamar a la API externa para crear la orden
    const response = await fetch("https://api-burgerli.iwebtecnology.com/api/createOrder", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(orderData),  // <-- objeto, NO array
});

if (!response.ok) {
  const err = await response.text();
  throw new Error(`Error API externa: ${response.status} ${response.statusText} – ${err}`);
}

    const createdOrder = await response.json();
    console.log("✅ Orden creada exitosamente:", createdOrder);

    // Agregar información adicional del pago para el WhatsApp
    const enrichedOrder = {
      ...createdOrder,
      paymentInfo: {
        transactionId: paymentData.id,
        method: paymentData.payment_method_id,
        status: paymentData.status,
        amount: paymentData.transaction_amount,
      },
      metadata: metadata
    };

    return enrichedOrder;
  } catch (error) {
    console.error("❌ Error creando orden en API externa:", error);
    throw error;
  }
}

// Función para guardar la orden en el endpoint local (para /success)
async function saveOrderToLocalStorage(order: any) {
  try {
    console.log("💾 Guardando orden en storage local para /success:", order.id);
    
    // Guardar en nuestro endpoint temporal para que /success pueda acceder
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    await fetch(`${baseUrl}/api/orders/last`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(order),
    });
    
    return order;
  } catch (e) {
    console.error("Error guardando orden en storage local:", e);
    // No lanzar error aquí para no interrumpir el flujo principal
  }
}

// Función para enviar orden por WhatsApp
async function sendOrderToWhatsApp(order: any) {
  try {
    // Mapeo de sucursales a números de WhatsApp
    const WHATSAPP_NUMBERS = {
      "GERLI": "5491157395035",
      "LANUS": "5491171372910", 
      "WILDE": "5491160243691"
    };
    
    // Obtener el número según la sucursal, con fallback al primero
    const getSucursalNumber = (sucursal: string) => {
      if (!sucursal) return WHATSAPP_NUMBERS.GERLI; // Fallback por defecto
      
      const sucursalUpper = sucursal.toUpperCase();
      
      // Buscar coincidencias exactas o parciales
      if (sucursalUpper.includes("GERLI")) return WHATSAPP_NUMBERS.GERLI;
      if (sucursalUpper.includes("LANUS") || sucursalUpper.includes("LANÚS")) return WHATSAPP_NUMBERS.LANUS;
      if (sucursalUpper.includes("WILDE")) return WHATSAPP_NUMBERS.WILDE;
      
      // Fallback por defecto
      return WHATSAPP_NUMBERS.GERLI;
    };
    
    const WHATSAPP_NUMBER = getSucursalNumber(order.local || order.delivery?.sucursal || order.sucursal);
    
    // Debug: mostrar qué sucursal y número se está usando
    console.log("🏪 Sucursal detectada en webhook:", order.local || order.delivery?.sucursal || order.sucursal);
    console.log("📱 Número de WhatsApp seleccionado en webhook:", WHATSAPP_NUMBER);
    
    // Formatear la fecha
    const orderDate = new Date(order.createdAt).toLocaleString("es-AR", {
      timeZone: "America/Argentina/Buenos_Aires",
      year: "numeric",
      month: "2-digit", 
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    });
    
    // Crear mensaje de WhatsApp
    const message = `🍔 *NUEVA ORDEN - BURGERLI* 🍔

📋 *Orden ID:* ${order.id}
📅 *Fecha:* ${orderDate}
💰 *Total:* $${order.totals.total.toLocaleString("es-AR")}

👤 *CLIENTE:*
• Nombre: ${order.customer.name}
• Email: ${order.customer.email}
• Teléfono: ${order.customer.phone}

🚚 *ENTREGA:*
• Sucursal: ${order.local || "Principal"}
• Tipo: ${order.delivery_mode === "delivery" ? "🛵 Delivery" : "🏪 Retiro en local"}
${order.delivery_mode === "delivery" ? `• Dirección: ${order.address}` : `• Sucursal: ${order.local || "Principal"}`}

🛒 *PEDIDO:*
${order.products && order.products.length > 0 
  ? order.products.map((item: any) => `• ${item.name} x${item.quantity} - $${(item.price * item.quantity).toLocaleString("es-AR")}`).join("\n")
  : "• Pedido Burgerli"}

💳 *PAGO:*
• Método: ${order.paymentInfo?.method || order.payment_method}
• Estado: ✅ APROBADO
• ID Transacción: ${order.paymentInfo?.transactionId || "N/A"}

📝 *DETALLES:*
• Total: $${order.price?.toLocaleString("es-AR")}

${order.order_notes ? `📋 *Notas:* ${order.order_notes}` : ""}

⚡ *¡Pedido listo para preparar!*`;

    // Codificar el mensaje para URL
    const encodedMessage = encodeURIComponent(message);
    
    // Crear URL de WhatsApp
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER.replace("+", "")}&text=${encodedMessage}`;
    
    console.log("📱 Enviando orden por WhatsApp:", {
      orderId: order.id,
      phone: WHATSAPP_NUMBER,
      messageLength: message.length
    });
    
    // En un entorno real, aquí podrías usar una API de WhatsApp Business
    // Por ahora, simulamos el envío y logueamos la URL
    console.log("🔗 URL de WhatsApp generada:", whatsappUrl);
    
    // Opcional: Hacer una petición HTTP para abrir WhatsApp automáticamente
    // (esto requeriría un servicio adicional o integración con WhatsApp Business API)
    
    return {
      success: true,
      whatsappUrl,
      message: "Orden enviada por WhatsApp"
    };
    
  } catch (e) {
    console.error("❌ Error enviando orden por WhatsApp:", e);
    return {
      success: false,
      error: e instanceof Error ? e.message : "Error desconocido"
    };
  }
}

async function handleMerchantOrder(merchantOrderId: string) {
  try {
    const r = await fetch(`https://api.mercadopago.com/merchant_orders/${merchantOrderId}`, {
      headers: { Authorization: `Bearer ${MP_TOKEN}` },
      cache: "no-store",
    });
    const mo = await r.json();
    console.log("[MP] merchant_order", merchantOrderId, mo.order_status);

    // En merchant_order podés calcular total aprobado sumando payments
    const approvedTotal = (mo.payments || [])
      .filter((p: any) => p.status === "approved")
      .reduce((acc: number, p: any) => acc + (p.total_paid_amount || 0), 0);

    if (approvedTotal > 0) {
      // TODO: confirmar orden en tu DB
      console.log("Merchant order approved with total:", approvedTotal);
    }
  } catch (e) {
    console.error("[MP] handleMerchantOrder error:", e);
  }
}
