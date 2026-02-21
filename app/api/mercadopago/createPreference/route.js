// /app/api/mercadopago/create-order/route.ts
import { NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";
import {getBranchTokenByLocal, getWebhookUrl} from "../config";

// const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;
const FRONT_URL = "https://burgerli.com.ar"; // CAMBIAR A DOMIINIO REAL
// const FRONT_URL = "https://imido-curliest-cole.ngrok-free.dev"
export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const items = Array.isArray(body?.items) ? body.items : [];
    const order = body?.order;

    console.log("🛒 [CreatePreference] Iniciando creación de preferencia");
    console.log("🛒 [CreatePreference] Local:", order?.local);
    console.log("🛒 [CreatePreference] Items:", items.length);

    if (!items.length || items.some((it) => it?.unit_price == null)) {
      console.error("❌ [CreatePreference] Error: items inválidos");
      return NextResponse.json(
        { error: true, message: "unit_price needed" },
        { status: 400 },
      );
    }

    // Acá definimos la sucursal / local
    const local = order?.local;
    
    if (!local) {
      console.error("❌ [CreatePreference] Error: local no especificado");
      return NextResponse.json(
        { error: true, message: "local es requerido" },
        { status: 400 },
      );
    }

    // token correcto según el local
    console.log("🔑 [CreatePreference] Obteniendo token para local:", local);
    const accessToken = getBranchTokenByLocal(local);

    const client = new MercadoPagoConfig({accessToken});
    const preference = new Preference(client);

    const webhookUrl = getWebhookUrl(FRONT_URL, local);
    console.log("🔔 [CreatePreference] Webhook URL:", webhookUrl);

    const mpBody = {
      items: items.map((it) => ({
        id: it.id ?? "sku-1",
        title: it.title ?? "Compra en Burgerli",
        description: it.description ?? "Sin descripción",
        quantity: Number(it.quantity ?? 1),
        unit_price: Number(it.unit_price),
        currency_id: it.currency_id ?? "ARS",
        picture_url: it.picture_url,
        category_id: it.category_id ?? "general",
      })),
      payment_methods: {
        excluded_payment_types: [
          { id: "ticket" }
        ]
      },
      metadata: {
        // Datos del cliente
        name: order.name ?? null,
        email: order.email ?? null,
        phone: order.phone ?? null,
        user_client_id: order.id_user_client ?? null,

        // Datos de entrega
        delivery_mode: order.delivery_mode ?? null,
        address: order.address ?? null,
        local: order.local ?? null,

        // Datos del pedido
        order_notes: order.order_notes ?? null,
        coupon: order.coupon ?? "",
        price: order.price ?? null,
        products: order.products ?? null,
      },
      auto_return: "approved",
      back_urls: {
        success: `${FRONT_URL}/success`,
        failure: `${FRONT_URL}`,
        pending: `${FRONT_URL}/pending`,
      },
      notification_url: webhookUrl,
    };

    console.log("📤 [CreatePreference] Creando preferencia en MercadoPago...");
    const pref = await preference.create({ body: mpBody });
    
    console.log("✅ [CreatePreference] Preferencia creada exitosamente");
    console.log("🆔 [CreatePreference] Preference ID:", pref.id);

    return NextResponse.json(pref);
  } catch (error) {
    console.error("❌ [CreatePreference] Error creando preferencia:", error);
    return NextResponse.json(
      { error: true, message: error?.message ?? "Error" },
      { status: 500 },
    );
  }
}
