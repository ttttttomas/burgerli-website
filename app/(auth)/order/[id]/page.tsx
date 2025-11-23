//@eslint-disable-next-line @next/next/no-img-element
"use client";
import { useState, useMemo, useEffect, use } from "react";
import Order1 from "@/app/components/icons/Order-1";
import Order2 from "@/app/components/icons/Order-2";
import Order3 from "@/app/components/icons/Order-3";
import Order4 from "@/app/components/icons/Order-4";
import Ubicacion from "@/app/components/icons/Ubicacion";
import Tarjeta from "@/app/components/icons/Tarjeta";
// import { type NextPage } from "next";
import Moto from "@/app/components/icons/Moto";
import { useSession } from "@/app/context/SessionContext";
import { useOrderWebSocket } from "@/app/hooks/useOrderWebSocket";
import { Orders } from "@/types";

type OrderStatus = "confirmed" | "in_preparation" | "on_the_way" | "delivered";

// Tipo para los productos
interface Product {
  id?: string;
  name?: string;
  description?: string;
  price?: number;
  quantity?: number;
  size: string;
}

// Componente cliente que recibe el id ya resuelto
function OrderContent({ id }: { id: string }) {
  const { OrderById } = useSession();
  const [products, setProducts] = useState<Product[]>([]);
  const [order, setOrder] = useState<Orders | null>(null);

  function parseBrokenJsonArray(arr: string[]) {
    // 1️⃣ Limpiar posibles llaves sobrantes al inicio o final de los fragmentos
    const cleaned = arr.map((str) =>
      str
        .replace(/^{/, "") // elimina { al inicio
        .replace(/}$/, "") // elimina } al final
        .trim()
    );

    // 2️⃣ Unir los fragmentos en una cadena JSON válida
    const jsonString = `{${cleaned.join(",")}}`;

    // 3️⃣ Intentar parsear el JSON a objeto
    try {
      return JSON.parse(jsonString);
    } catch (error) {
      console.log(error);
      console.error("❌ Error al convertir a JSON:");
      console.error("Cadena generada:", jsonString);
      return null;
    }
  }

  const {
    status: wsStatus,
    isConnected,
    error: wsError,
    local: wsLocal,
  } = useOrderWebSocket(id);

  const steps = useMemo(
    () => [
      {
        label: "Pedido confirmado",
        icon: <Order1 />,
      },
      {
        label: "Pedido en preparación",
        icon: <Order2 />,
      },
      {
        label: "Pedido en camino",
        icon: <Order3 />,
      },
      {
        label: "Pedido entregado",
        icon: <Order4 />,
      },
    ],
    []
  );

  const STEP_BY_STATUS: Record<OrderStatus, number> = useMemo(
    () => ({
      confirmed: 0,
      in_preparation: 1,
      on_the_way: 2,
      delivered: 3,
    }),
    []
  );

  // Usar useMemo para que se recalcule cuando cambie wsStatus o order
  const currentStep = useMemo(() => {
    const status = wsStatus || order?.status;
    const step = status ? STEP_BY_STATUS[status as OrderStatus] : 0;
    console.log("🎯 Recalculando currentStep:", {
      wsStatus,
      orderStatus: order?.status,
      step,
    });
    return step;
  }, [wsStatus, order?.status, STEP_BY_STATUS]);

  // Actualizar el estado de la orden cuando cambie el estado del WebSocket
  useEffect(() => {
    if (wsStatus) {
      console.log("🔄 WebSocket Status actualizado:", wsStatus);
      console.log("📊 Current Step que debería ser:", STEP_BY_STATUS[wsStatus]);

      // Actualizar el estado de la orden con el nuevo status
      setOrder((prevOrder) => {
        if (prevOrder) {
          return {
            ...prevOrder,
            status: wsStatus,
          };
        }
        return prevOrder;
      });
    }
  }, [wsStatus, STEP_BY_STATUS]);

  useEffect(() => {
    async function fetchOrder() {
      try {
        // Esperar un poco para que el webhook procese la orden
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const res: any = await OrderById(id);
        
        // Usar la función parseBrokenJsonArray para parsear los productos
        if (res?.products && Array.isArray(res.products)) {
          const parsedProducts = parseBrokenJsonArray(res.products);
          setProducts(parsedProducts ? [parsedProducts] : []);
        }
        
        // OrderById retorna los datos directamente
        if (res && res.status) {
          setOrder(res);
        }
      } catch (error) {
        console.error("Error obteniendo orden:", error);
      }
    }

    fetchOrder();
  }, [OrderById, id]);

  console.log("🚀 Order:", order);
  console.log("🚀 Productos:", products);
  return (
    <main className="w-full flex bg-[#FCEDCC] antialiased">
      <section className="w-full flex flex-col items-center">
        {/* Indicador de conexión WebSocket */}
        <div className="w-full bg-primary text-white shadow-sm py-2 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                isConnected ? "bg-green-500" : "bg-red-500"
              } animate-pulse`}
            ></div>
            <span className="text-sm">
              {isConnected
                ? "Seguimiento en tiempo real activo"
                : "Reconectando..."}
            </span>
          </div>
          {wsError && <span className="text-xs text-red-500">{wsError}</span>}
        </div>

        <div className="flex justify-center gap-4 md:gap-10 my-6 md:my-10 items-center px-4">
          <img src="/order-1.png" alt="Order" className="w-20 md:w-32" />
          {/* CAMBIO DE ESTADO DE IMAGENES CUANDO EL PEDIDO ESTE ENTREGADO */}
          {/* <img src="/order-2.png" alt="Order" className="w-20 md:w-32" /> */}

          <div className="flex flex-col items-start justify-center">
            <h2 className="text-xl md:text-2xl font-semibold italic -z-0 text-gray-800">
              {order?.status === "confirmed" && "Confirmado"}
              {order?.status === "in_preparation" && "En Preparación"}
              {order?.status === "on_the_way" && "En Camino"}
              {order?.status === "delivered" && "Entregado"}
            </h2>
            <p className="text-sm md:text-base text-gray-600 text-start -z-0">
              {new Date().toLocaleDateString()}
            </p>
            {wsLocal && (
              <p className="text-xs md:text-sm text-gray-500 mt-1">Local: {wsLocal}</p>
            )}
          </div>
        </div>

        <div className="relative w-full flex justify-between items-center px-4 md:px-8 mb-8">
          {/* LINEA HORIZONTAL */}
          <div className="absolute top-6 left-0 right-0 h-1 bg-[#5B524B] opacity-70 z-0" />
          {/* LINEA HORIZONTAL PROGRESIVA */}
          <div
            className="absolute top-6 left-0 h-1 bg-primary z-0 transition-all duration-700 ease-in-out"
            style={{
              width: `${(currentStep / (steps.length - 1)) * 100}%`,
            }}
          />
          {/* LINEA HORIZONTAL */}
          {steps.map((step, index) => {
            const isActive = index <= currentStep;
            const isCurrent = index === currentStep;
            return (
              <div
                key={step.label}
                className="flex flex-col items-center gap-2 z-10"
              >
                {/* Punto del timeline */}
                <span
                  className={[
                    "p-2 rounded-full flex items-center justify-center mb-1 transition-all duration-500 ease-in-out transform",
                    isActive
                      ? "bg-primary w-12 h-12 scale-100"
                      : "bg-[#5B524B] w-10 h-10 opacity-70 scale-90",
                    isCurrent ? "ring-4 ring-primary/30 animate-pulse" : "",
                  ].join(" ")}
                >
                  {step.icon}
                </span>

                {/* Label */}
                <span
                  className={[
                    "text-xs md:text-sm transition-all duration-300 text-center",
                    isActive ? "text-black font-semibold" : "text-gray-500",
                  ].join(" ")}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
        <section className="flex flex-col md:flex-row p-4 md:p-16 gap-8 md:gap-20 justify-between w-full items-start">
          <div className="w-full md:w-1/2">
            <h6 className="font-bold text-lg md:text-xl">Medio de entrega</h6>
            <ul className="my-3 md:my-5 flex flex-col gap-2 md:gap-3">
              <li className="flex items-center justify-between gap-2 md:gap-3">
                <div className="flex gap-2 md:gap-3 items-center">
                  <Moto />
                  <p className="text-sm md:text-base">Tipo de entrega</p>
                </div>
                <p className="text-sm md:text-base font-medium">
                  {order?.delivery_mode === "delivery" ? "Delivery" : "Pickup"}
                </p>
              </li>
              <li className="flex items-center justify-between gap-2 md:gap-3">
                <div className="flex ml-2 gap-2 md:gap-3 items-center">
                  <Ubicacion fill="black" />
                  <p className="text-sm md:text-base">Dirección</p>
                </div>
                <p className="text-sm md:text-base font-medium text-right">{order?.address || "Sin dirección."}</p>
              </li>
            </ul>
            <hr className="border-[1px] my-3 md:my-5" />
            <h6 className="font-bold text-lg md:text-xl">Mi pedido</h6>
            <ul className="flex flex-col gap-4 md:gap-3 py-3 md:py-5 justify-between items-center">
              {products && products.length > 0 ? (
                products.map((product, index) => (
                <li key={product?.id || index} className="flex flex-row gap-3 md:gap-5 w-full justify-between items-center border-b pb-3 md:border-none md:pb-0">
                <div className="flex gap-2 md:gap-3 items-center flex-1">
                  <img
                    className="w-20 h-20 md:w-40 md:h-30 rounded-xl object-cover flex-shrink-0"
                    src="/bg_burgers.jpg"
                    alt={product?.name || 'Producto'}
                  />
                  <div className="flex flex-col gap-1 md:gap-3 justify-between h-full flex-1 min-w-0">
                    <p className="font-bold text-sm md:text-xl truncate">{product?.name || 'Producto'}</p>
                    <p className="text-xs md:text-sm text-gray-600 line-clamp-2">{product?.size}</p>
                    <small className="text-xs md:text-sm text-gray-600 line-clamp-2">{product?.description || 'Sin descripción'}</small>
                    <b className="text-sm md:text-base">${product?.price?.toLocaleString() || '0'}</b>
                  </div>
                </div>
                <p className="font-bold text-lg md:text-2xl flex-shrink-0">X{product?.quantity || 1}</p>
              </li>
                ))
              ) : (
                <li className="text-gray-500 text-center py-4">
                  Cargando productos...
                </li>
              )}
            </ul>
            <hr className="border-[1px] my-3 md:my-5" />
          </div>
          <div className="w-full md:w-1/2 flex flex-col">
            <h6 className="font-bold text-lg md:text-xl">Medio de pago</h6>
            <ul className="my-3 md:my-5 flex flex-col gap-2 md:gap-3">
              <li className="flex items-center justify-between gap-2 md:gap-3">
                <div className="flex gap-2 md:gap-3 items-center">
                  <Tarjeta />
                  <p className="text-sm md:text-base">{order?.payment_method === "mercadopago" ? "Mercado Pago" : "Efectivo"}</p>
                </div>
                <p className="text-sm md:text-base font-medium">${order?.price.toLocaleString()}</p>
              </li>
            </ul>
            {/* <hr className="border-[1px] my-5" />
            <h6 className="font-bold text-xl">Mi pago</h6>
            <ul className="my-5 flex flex-col gap-3">
              <li className="flex items-center justify-between gap-3">
                <div className="flex gap-3 items-center">
                  <p>Productos</p>
                </div>
                <p>$30.000</p>
              </li>
              <li className="flex items-center justify-between gap-3">
                <div className="flex gap-3 items-center">
                  <p>Delivery</p>
                </div>
                <p>$5.000</p>
              </li>
              <li className="flex items-center justify-between gap-3">
                <div className="flex gap-3 items-center">
                  <p>Cupon de descuento</p>
                </div>
                <p>-$5.000</p>
              </li>
            </ul> */}
            <hr className="border-[1px] my-3 md:my-5" />
            <div className="flex w-full justify-between items-center">
              <b className="text-base md:text-lg">Total</b>
              <b className="text-base md:text-lg">${order?.price.toLocaleString()}</b>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}

// Componente wrapper que maneja la Promise de params
export default function OrderIDPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <OrderContent id={id} />;
}
