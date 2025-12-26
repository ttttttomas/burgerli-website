"use client";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "../context/SessionContext";

export const dynamic = "force-dynamic"; // evita SSG

export default function SuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Content />
    </Suspense>
  );
}

function Content() {
  const { session, loading: sessionLoading } = useSession();
  const sp = useSearchParams();
  const router = useRouter();
  const paymentId = sp.get("payment_id");
  const status = sp.get("status");
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrderId() {
      if (!paymentId || status !== "approved") {
        setLoading(false);
        return;
      }

      // Esperar a que la verificación de sesión termine
      if (sessionLoading) {
        return;
      }

      try {
        // Esperar un poco para que el webhook procese la orden
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const response = await fetch(
          `/api/orders/temp?payment_id=${paymentId}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          },
        );

        const data = await response.json();

        if (data.order_id) {
          setOrderId(data.order_id);
          console.log("Order ID encontrado:", data.order_id);
            setTimeout(() => {
              router.push(`/order/${data.order_id}`);
            }, 3000);
        } else {
          console.log("Order ID no encontrado aún, reintentando...");
          // Reintentar después de 3 segundos si no se encuentra
          setTimeout(fetchOrderId, 2000);
        }
      } catch (error) {
        console.error("Error obteniendo order ID:", error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }

    fetchOrderId();
  }, [paymentId, status, router, session, sessionLoading]);

  // Efecto para redirigir automáticamente cuando se obtenga el orderId (solo si hay sesión)
  useEffect(() => {
    if (orderId && session) {
      const timer = setTimeout(() => {
        router.push(`/order/${orderId}`);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [orderId, router, session, sessionLoading]);

  if (loading || sessionLoading) {
    return (
      <main className="h-[60vh] flex items-center justify-center flex-col gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="text-xl font-bold">Procesando tu pago...</p>
        <p className="text-gray-600">Creando tu orden de compra</p>
        {orderId && (
          <p className="text-green-600 font-semibold">
            ¡Orden #{orderId} creada! Redirigiendo...
          </p>
        )}
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

      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full text-center">
        <h2 className="text-xl font-semibold mb-4">
          ¡Tu orden ha sido procesada!
        </h2>

        {orderId ? (
          <>
            <div className="space-y-2 text-sm mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Orden ID:</span>
                <span className="font-mono">#{orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment ID:</span>
                <span className="font-mono text-xs">{paymentId}</span>
              </div>
            </div>

            <div className="space-y-3">
              {session ? (
                <>
                  <button
                    onClick={() => router.push(`/order/${orderId}`)}
                    className="w-full bg-primary text-white font-semibold py-3 px-4 rounded-lg hover:bg-primary/80 transition-colors duration-200"
                  >
                    Ver detalles de mi orden
                  </button>
                  <p className="text-xs text-gray-500">
                    Serás redirigido automáticamente en unos segundos...
                  </p>
                </>
              ) : (
                <>
                  <p className="text-green-600 font-semibold mb-4">
                    ¡Tu pago ha sido procesado exitosamente!
                  </p>
                  <p className="text-gray-700 mb-4 text-sm">
                    Tu pedido será procesado y enviado según el método de
                    entrega seleccionado.
                  </p>
                  <div className="space-y-2">
                    <button
                      onClick={() => router.push("/login")}
                      className="w-full bg-primary text-white font-semibold py-3 px-4 rounded-lg hover:bg-primary/80 transition-colors duration-200"
                    >
                      Iniciar sesión para ver mi orden
                    </button>
                    <button
                      onClick={() => router.push("/")}
                      className="w-full bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors duration-200"
                    >
                      Continuar comprando
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-3">
                    💡 Crea una cuenta o inicia sesión para hacer seguimiento de
                    tus pedidos
                  </p>
                </>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="animate-pulse mb-4">
              <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
            </div>
            <p className="text-gray-600">Finalizando tu orden...</p>
          </>
        )}
      </div>
    </main>
  );
}
