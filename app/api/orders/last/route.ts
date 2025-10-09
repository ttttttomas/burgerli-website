import { NextResponse } from "next/server";

let lastOrder: any = null;

export async function GET() {
  try {
    if (!lastOrder) {
      return NextResponse.json({ error: "No hay orden" }, { status: 404 });
    }
    return NextResponse.json(lastOrder);
  } catch (e) {
    return NextResponse.json({ error: "Error obteniendo última orden" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Acepta string (orderId) o objeto (orden completa)
    const payload = typeof body === "string" ? { order_id: body } : body;

    // Normalizamos el ID
    const id =
      payload.id ??
      payload.id_order ??
      payload.order_id ??
      payload.data?.id ??
      null;

    if (!id) {
      return NextResponse.json({ error: "Falta order_id" }, { status: 400 });
    }

    // Guardamos TODO lo que venga + el id normalizado
    lastOrder = { ...payload, id_order: id };

    return NextResponse.json({ success: true, id_order: id });
  } catch (e) {
    return NextResponse.json({ error: "Error actualizando orden" }, { status: 500 });
  }
}
