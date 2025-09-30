import { NextResponse } from "next/server";

// Simulación de almacenamiento temporal de órdenes
// En producción esto sería una consulta a base de datos
let lastOrder: any = null;

export async function GET() {
  try {
    // En un entorno real, esto sería:
    // const order = await db.orders.findFirst({ 
    //   orderBy: { createdAt: 'desc' },
    //   where: { userId: currentUserId }
    // });
    
    if (!lastOrder) {
      // Orden de ejemplo para testing
      lastOrder = {
        id: "ORD-DEMO-123",
        paymentId: "demo-payment",
        status: "confirmed",
        createdAt: new Date().toISOString(),
        customer: {
          name: "Cliente Demo",
          email: "demo@burgerli.com",
          phone: "+54 9 11 1234-5678",
        },
        delivery: {
          mode: "delivery",
          address: "Calle Falsa 123, Buenos Aires",
          sucursal: null,
          price: 500,
        },
        payment: {
          method: "credit_card",
          status: "approved",
          amount: 15500,
          currency: "ARS",
          transactionId: "demo-transaction",
        },
        totals: {
          subtotal: 15000,
          deliveryPrice: 500,
          total: 15500,
        },
        notes: "Sin cebolla, extra queso",
        sin: "cebolla",
        items: [
          {
            id: "item-1",
            name: "Cheeseburger Clásica",
            quantity: 2,
            price: 7500,
            image: "/bg_burgers.jpg"
          },
          {
            id: "item-2", 
            name: "Papas Burgerli",
            quantity: 1,
            price: 3000,
            image: "/bg_papas.jpg"
          }
        ]
      };
    }

    return NextResponse.json(lastOrder);
  } catch (error) {
    console.error("Error obteniendo última orden:", error);
    return NextResponse.json(
      { error: "Error obteniendo orden" },
      { status: 500 }
    );
  }
}

// Función para actualizar la última orden (llamada desde el webhook)
export async function POST(req: Request) {
  try {
    const order = await req.json();
    lastOrder = order;
    
    console.log("📝 Orden actualizada en endpoint:", order.id);
    
    return NextResponse.json({ success: true, orderId: order.id });
  } catch (error) {
    console.error("Error actualizando orden:", error);
    return NextResponse.json(
      { error: "Error actualizando orden" },
      { status: 500 }
    );
  }
}
