// /app/api/mercadopago/create-order/route.ts
import { NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";


const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN; 
const FRONT_URL = "https://imido-curliest-cole.ngrok-free.dev"

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const items = Array.isArray(body?.items) ? body.items : [];
    const order = body?.order;

    if (!items.length || items.some((it) => it?.unit_price == null)) {
      return NextResponse.json(
        { error: true, message: "unit_price needed" },
        { status: 400 }
      );
    }

    const client = new MercadoPagoConfig({ accessToken: MP_ACCESS_TOKEN });
    const preference = new Preference(client);

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
      metadata: {
        // Datos del cliente
        order_id: order.id_order,
        name: order.name ?? null,
        email: order.email ?? null,
        phone: order.phone ?? null,
        
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
        success: `${FRONT_URL}/success/?order_id=${order.id_order}`,
        failure: `${FRONT_URL}/failure`,
        pending: `${FRONT_URL}/pending`,
      },
      notification_url: "https://imido-curliest-cole.ngrok-free.dev/api/mercadopago/webhook",
    };


    const pref = await preference.create({ body: mpBody });

    return NextResponse.json(pref);
  } catch (error) {
    console.error("MP create preference error:", error);
    return NextResponse.json(
      { error: true, message: error?.message ?? "Error" },
      { status: 500 }
    );
  }
}
