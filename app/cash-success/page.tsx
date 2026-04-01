"use client";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "../context/SessionContext";
import { Pattaya } from "next/font/google";
import useProducts from "@/app/hooks/useProducts";
import { Orders } from "@/types";
import { parseLineItemsFront, Product } from "@/app/lib/ProductToJson";

const pattaya = Pattaya({
  weight: ["400"],
  variable: "--font-pattaya",
  subsets: ["latin"],
});

export const dynamic = "force-dynamic";

export default function CashSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Content />
    </Suspense>
  );
}

function Content() {
  const { session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");
  const { getOrder } = useProducts();

  const [order, setOrder] = useState<Orders | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(!!orderId);

  useEffect(() => {
    if (!orderId) return;

    async function fetchOrder() {
      try {
        const res = await getOrder(orderId!);
        if (res) {
          setOrder(res);
          if (res.products && Array.isArray(res.products)) {
            const parsed = parseLineItemsFront(res.products);
            setProducts(parsed);
          }
        }
      } catch (error) {
        console.error("Error obteniendo orden:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [orderId]);

  console.log(order);

  if (loading) {
    return (
      <main className="min-h-[60vh] flex items-center justify-center flex-col gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="text-xl font-bold">Cargando tu orden...</p>
      </main>
    );
  }

  return (
    <main className="min-h-[60vh] flex items-center justify-center flex-col gap-6 p-8">
      <div className="text-green-500 text-6xl">✅</div>

      <h1
        className={`${pattaya.className} text-4xl font-bold text-green-600 text-center`}>
        ¡Orden Confirmada!
      </h1>

      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full text-center">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Tu pedido ha sido recibido
        </h2>

        {/* Info de la orden si hay datos */}
        {order && (
          <div className="text-left mb-6 space-y-4">
            {/* Método de pago */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-center mb-2">
                <span className="text-2xl mr-2">
                  {order.payment_method === "Efectivo" ? "💵" : "💳"}
                </span>
                <span className="font-bold text-green-700">
                  {order.payment_method === "Efectivo"
                    ? "Pago en Efectivo"
                    : order.payment_method === "account_money"
                      ? "Mercado Pago"
                      : order.payment_method}
                </span>
              </div>
              {order.payment_method === "Efectivo" && (
                <p className="text-sm text-green-600 text-center">
                  Pagarás al momento de recibir tu pedido
                </p>
              )}
            </div>

            {/* Datos del cliente */}
            <div className="border border-gray-200 rounded-lg p-3 space-y-2">
              <h3 className="font-semibold text-gray-700 text-sm">
                Datos del pedido
              </h3>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Nombre</span>
                <span className="text-gray-800 font-medium">{order.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Entrega</span>
                <span className="text-gray-800 font-medium">
                  {order.delivery_mode === "delivery"
                    ? "Delivery"
                    : "Retiro en local"}
                </span>
              </div>
              {order.address && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Dirección</span>
                  <span className="text-gray-800 font-medium text-right max-w-[60%]">
                    {order.address}
                  </span>
                </div>
              )}
              {order.local && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Sucursal</span>
                  <span className="text-gray-800 font-medium">
                    {order.local}
                  </span>
                </div>
              )}
            </div>

            {/* Productos */}
            {products.length > 0 && (
              <div className="border border-gray-200 rounded-lg p-3 space-y-2">
                <h3 className="font-semibold text-gray-700 text-sm">
                  Productos
                </h3>
                {products.map((product, index) => (
                  <div
                    key={index}
                    className="flex justify-between text-sm py-1 border-b border-gray-100 last:border-0">
                    <div className="flex-1">
                      <span className="text-gray-800 font-medium">
                        {product.name}
                      </span>
                      <span className="text-gray-400 ml-1">
                        x{product.quantity || 1}
                      </span>
                      {product.size && (
                        <p className="text-xs text-gray-500">{product.size}</p>
                      )}
                      {product.fries && (
                        <p className="text-xs text-gray-500">{product.fries}</p>
                      )}
                      {product.sin && product.sin.length > 0 && (
                        <p className="text-xs text-gray-400">
                          Sin: {product.sin.join(", ")}
                        </p>
                      )}
                    </div>
                    <span className="text-gray-800 font-medium flex-shrink-0">
                      ${product.price?.toLocaleString("es-AR") || "0"}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Total */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              {order.coupon && (
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500">Cupón</span>
                  <span className="text-green-600 font-medium">
                    {order.coupon}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-800">Total</span>
                <span className="font-bold text-lg text-gray-800">
                  ${order.price?.toLocaleString("es-AR")}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Fallback si no hay orden cargada */}
        {!order && !orderId && (
          <div className="mb-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center mb-2">
                <span className="text-2xl mr-2">💵</span>
                <span className="font-bold text-green-700">
                  Pago en Efectivo
                </span>
              </div>
              <p className="text-sm text-green-600">
                Pagarás al momento de recibir tu pedido
              </p>
            </div>

            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-center justify-center gap-2">
                <span className="text-lg">⏰</span>
                <p>Tu pedido será procesado en breve</p>
              </div>
              <div className="flex items-center justify-center gap-2">
                <span className="text-lg">📱</span>
                <p>Recibirás confirmación por WhatsApp</p>
              </div>
              <div className="flex items-center justify-center gap-2">
                <span className="text-lg">🚚</span>
                <p>Se entregará según el método seleccionado</p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {session ? (
            <>
              <button
                onClick={() => router.push("/orders")}
                className="w-full bg-primary text-white font-semibold py-3 px-4 rounded-lg hover:bg-primary/80 transition-colors duration-200">
                Ver mis órdenes
              </button>
              <button
                onClick={() => router.push("/")}
                className="w-full bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors duration-200">
                Seguir comprando
              </button>
            </>
          ) : (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-blue-700">
                  💡 <strong>¿Sabías que...</strong> puedes crear una cuenta
                  para hacer seguimiento de todos tus pedidos?
                </p>
              </div>

              <button
                onClick={() => router.push("/login")}
                className="w-full bg-primary text-white font-semibold cursor-pointer py-3 px-4 rounded-lg hover:bg-primary/80 transition-colors duration-200">
                Iniciar sesión / Registrarse
              </button>

              <button
                onClick={() => router.push("/")}
                className="w-full bg-gray-200 text-gray-800 font- cursor-pointer py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors duration-200">
                Continuar comprando
              </button>
            </>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            ¡Gracias por elegir Burgerli! 🍔
          </p>
          <p className="text-xs text-gray-500 text-center mt-1">
            En caso de consultas, contáctanos por WhatsApp
          </p>
        </div>
      </div>
    </main>
  );
}
