import { NextRequest, NextResponse } from "next/server";

// Map en memoria para guardar temporalmente payment_id -> order_id
// Se limpia automáticamente después de 10 minutos
const tempOrders = new Map<string, { order_id: string; timestamp: number }>();

// Limpiar entradas antiguas cada 5 minutos
setInterval(() => {
  const now = Date.now();
  const TTL = 10 * 60 * 1000; // 10 minutos
  
  for (const [paymentId, data] of tempOrders.entries()) {
    if (now - data.timestamp > TTL) {
      tempOrders.delete(paymentId);
      console.log(`🗑️ Orden temporal expirada: payment_id=${paymentId}`);
    }
  }
}, 5 * 60 * 1000);

// POST: Guardar relación payment_id -> order_id
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { payment_id, order_id } = body;

    if (!payment_id || !order_id) {
      return NextResponse.json(
        { error: "payment_id y order_id son requeridos" },
        { status: 400 }
      );
    }

    // Guardar en el Map con timestamp
    tempOrders.set(payment_id, {
      order_id: String(order_id),
      timestamp: Date.now(),
    });

    console.log(`✅ Orden temporal guardada: payment_id=${payment_id}, order_id=${order_id}`);

    return NextResponse.json({ 
      success: true, 
      payment_id, 
      order_id 
    });
  } catch (error) {
    console.error("❌ Error guardando orden temporal:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// GET: Recuperar order_id usando payment_id
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const payment_id = searchParams.get("payment_id");

    if (!payment_id) {
      return NextResponse.json(
        { error: "payment_id es requerido" },
        { status: 400 }
      );
    }

    const data = tempOrders.get(payment_id);

    if (!data) {
      console.log(`⏳ Orden temporal no encontrada aún: payment_id=${payment_id}`);
      return NextResponse.json({ 
        order_id: null,
        message: "Orden aún no procesada" 
      });
    }

    console.log(`✅ Orden temporal recuperada: payment_id=${payment_id}, order_id=${data.order_id}`);

    return NextResponse.json({ 
      order_id: data.order_id,
      timestamp: data.timestamp 
    });
  } catch (error) {
    console.error("❌ Error recuperando orden temporal:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// DELETE: Limpiar una orden temporal específica (opcional)
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const payment_id = searchParams.get("payment_id");

    if (!payment_id) {
      return NextResponse.json(
        { error: "payment_id es requerido" },
        { status: 400 }
      );
    }

    const deleted = tempOrders.delete(payment_id);

    if (deleted) {
      console.log(`🗑️ Orden temporal eliminada: payment_id=${payment_id}`);
    }

    return NextResponse.json({ 
      success: deleted,
      message: deleted ? "Orden eliminada" : "Orden no encontrada" 
    });
  } catch (error) {
    console.error("❌ Error eliminando orden temporal:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
