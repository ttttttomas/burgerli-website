"use client";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "../context/SessionContext";
import { Orders } from "@/types";

export const dynamic = "force-dynamic"; // evita SSG

export default function SuccessPage() {
  return <Suspense fallback={<div>Loading...</div>}>
    <Content />
  </Suspense>;
}

function Content() {
  // const { session } = useSession();
  const sp = useSearchParams();
  const router = useRouter();
  const id = sp.get("order_id");
  const paymentId = sp.get("payment_id");
  const status = sp.get("status");
  const { OrderById } = useSession();
  const [order, setOrder] = useState<Orders>();
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function fetchOrder() {
      try {
        // Esperar un poco para que el webhook procese la orden
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const res = await OrderById(id);

        if (!res) {
          setNotFound(true);
          return;
        }
        setOrder(res);
        setLoading(false);
      } catch (error) {
        console.error("Error obteniendo orden:", error);
        setLoading(false);
      }
    }

    if (paymentId && status === "approved") {
      fetchOrder();
    } else if (status) {
      setLoading(false);
    }
    fetchOrder();
  }, [router, paymentId, status]);

  // useEffect(() => {
  //   if (!order?.id_order) return;

  //   if (!session) return;

  //   const t = setTimeout(() => {
  //     router.replace(`/order/${order.id_order}`);
  //   }, 3000);
  //   return () => clearTimeout(t);
  // }, [order?.id_order]);

  // Función para notificar a la tienda por WhatsApp
  const notifyStore = (order: any) => {
    // Mapeo de sucursales a números de WhatsApp
    const WHATSAPP_NUMBERS = {
      GERLI: "+5491157395035",
      LANUS: "+5491171372910",
      WILDE: "+5491160243691",
    };

    // Obtener el número según la local, con fallback al primero
    const getSucursalNumber = (local: string) => {
      const sucursalUpper = local.toUpperCase();

      // Buscar coincidencias exactas o parciales
      if (sucursalUpper.includes("GERLI")) return WHATSAPP_NUMBERS.GERLI;
      if (sucursalUpper.includes("LANUS") || sucursalUpper.includes("LANÚS"))
        return WHATSAPP_NUMBERS.LANUS;
      if (sucursalUpper.includes("WILDE")) return WHATSAPP_NUMBERS.WILDE;

      // Fallback por defecto
      return WHATSAPP_NUMBERS.GERLI;
    };

    const WHATSAPP_NUMBER = getSucursalNumber(order.local);

    // Debug: mostrar qué sucursal y número se está usando
    console.log("🏪 Sucursal detectada:", order.local);
    console.log("📱 Número de WhatsApp seleccionado:", WHATSAPP_NUMBER);

    // Formatear la fecha
    const orderDate = new Date(order.createdAt).toLocaleString("es-AR", {
      timeZone: "America/Argentina/Buenos_Aires",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

    // Crear mensaje de WhatsApp
    const message = `🍔 *NUEVA ORDEN - BURGERLI* 🍔
  
  📋 *Orden ID:* ${order.id}
  📅 *Fecha:* ${orderDate}
  💰 *Total:* $${order.price.toLocaleString("es-AR")}
  
  👤 *CLIENTE:*
  • Nombre: ${order.name}
  • Email: ${order.email}
  • Teléfono: ${order.phone}
  • Tipo: ${
    order.delivery_mode === "delivery" ? "🛵 Delivery" : "🏪 Retiro en local"
  }
  ${
    order.delivery_mode === "delivery"
      ? `• Dirección: ${order.address}`
      : `• Sucursal: ${order.local}`
  }
  
  ${order.notes ? `📋 *Notas:* ${order.notes}` : ""}
  ${order.sin ? `🚫 *Sin:* ${order.sin}` : ""}
  
  ⚡ *¡Pedido listo para preparar!*`;

    // Codificar el mensaje para URL
    const encodedMessage = encodeURIComponent(message);

    // Crear URL de WhatsApp
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER.replace(
      "+",
      ""
    )}&text=${encodedMessage}`;

    // Abrir WhatsApp en una nueva ventana
    window.open(whatsappUrl, "_blank");
  };

  if (loading) {
    return (
      <main className="h-[60vh] flex items-center justify-center flex-col gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="text-xl font-bold">Procesando tu pago...</p>
        <p className="text-gray-600">Creando tu orden de compra</p>
      </main>
    );
  }
  if (notFound) {
    return (
      <main className="h-[60vh] flex items-center justify-center flex-col gap-4">
        <div className="text-red-500 text-6xl">❌</div>
        <h1 className="text-2xl font-bold text-red-600">
          No se encontró tu orden
        </h1>
        <p className="text-gray-600">Intenta nuevamente</p>
        <button
          onClick={() => router.push("/")}
          className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/80"
        >
          Volver al inicio
        </button>
      </main>
    );
  }

  if (status !== "approved") {
    return (
      <main className="h-[60vh] flex items-center justify-center flex-col gap-4">
        <div className="text-red-500 text-6xl">❌</div>
        <h1 className="text-2xl font-bold text-red-600">Pago no aprobado</h1>
        <p className="text-gray-600">Estado: {status}</p>
        <button
          onClick={() => router.push("/")}
          className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/80"
        >
          Volver al inicio
        </button>
      </main>
    );
  }

  return (
    <main className="h-[60vh] flex items-center justify-center flex-col gap-6 p-8">
      <div className="text-green-500 text-6xl">✅</div>
      <h1 className="text-3xl font-bold text-green-600">¡Pago exitoso!</h1>

      {order && (
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
          <h2 className="text-xl font-semibold mb-4">Resumen de tu orden</h2>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Orden ID:</span>
              <span className="font-mono">{order.id_order}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Cliente:</span>
              <span>{order.name}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Total:</span>
              <span className="font-bold">
                ${order.price.toLocaleString("es-AR")}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Entrega:</span>
              <span>
                {order.delivery_mode === "delivery" ? "Delivery" : "Retiro"}
              </span>
            </div>

            {order.address && (
              <div className="flex justify-between">
                <span className="text-gray-600">Dirección:</span>
                <span className="text-right text-xs">{order.address}</span>
              </div>
            )}
          </div>

          {/* <p>Haz click en el botón para notificar a la tienda sobre la orden</p> */}

          <div className="mt-6 space-y-3">
            <button
              onClick={() => notifyStore(order)}
              className="w-full bg-green-500 hover:bg-green-600 text-black cursor-pointer font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <span className="">📱</span>
              CLICK AQUÍ PARA ENVIAR TU PEDIDO
            </button>
            {/* {session && (
        <p className="text-xs text-gray-500 text-center">
          Serás redirigido a los detalles de tu orden en unos segundos...
        </p>
      )} */}
          </div>
        </div>
      )}
    </main>
  );
}
