//@eslint-disable-next-line @next/next/no-img-element
"use client";
import { useState, useMemo, useEffect } from "react";
import Order1 from "@/app/components/icons/Order-1";
import Order2 from "@/app/components/icons/Order-2";
import Order3 from "@/app/components/icons/Order-3";
import Order4 from "@/app/components/icons/Order-4";
import Ubicacion from "@/app/components/icons/Ubicacion";
import Moto from "@/app/components/icons/Moto";
import { useCart } from "@/app/context/CartContext";
import { useSession } from "@/app/context/SessionContext";
import { useOrderWebSocket } from "@/app/hooks/useOrderWebSocket";
import { Orders } from "@/types";

type OrderStatus = "confirmed" | "in_preparation" | "on_the_way" | "delivered";

type PageProps = {
  params: {
    id: string;
  };
};

export default function OrderIDPage({ params }: PageProps) {
  const { id } = params;
  const { OrderById } = useSession();
  const [order, setOrder] = useState<Orders | null>(null);

  const {
    status: wsStatus,
    isConnected,
    error: wsError,
    local: wsLocal,
  } = useOrderWebSocket(id);

  const { cart } = useCart();
  console.log(cart);

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

        <div className="flex justify-center gap-10 my-10 items-center">
          <img src="/order-1.png" alt="Order" className="w-32" />
          {/* CAMBIO DE ESTADO DE IMAGENES CUANDO EL PEDIDO ESTE ENTREGADO */}
          {/* <img src="/order-2.png" alt="Order" className="w-32" /> */}

          <div className="flex flex-col items-start justify-center">
            <h2 className="text-2xl font-semibold italic -z-0 text-gray-800">
              {order?.status === "confirmed" && "Confirmado"}
              {order?.status === "in_preparation" && "En Preparación"}
              {order?.status === "on_the_way" && "En Camino"}
              {order?.status === "delivered" && "Entregado"}
            </h2>
            <p className="text-gray-600 text-start -z-0">
              {new Date().toLocaleDateString()}
            </p>
            {wsLocal && (
              <p className="text-sm text-gray-500 mt-1">Local: {wsLocal}</p>
            )}
          </div>
        </div>

        <div className="relative w-full flex justify-between items-center px-4">
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
                    "text-sm transition-all duration-300",
                    isActive ? "text-black font-semibold" : "text-gray-500",
                  ].join(" ")}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
        <section className="flex flex-col md:flex-row p-16 gap-20 justify-between w-full items-start">
          <div className="md:w-1/2">
            <h6 className="font-bold text-xl">Medio de entrega</h6>
            <ul className="my-5 flex flex-col gap-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex gap-3 items-center">
                  <Moto />
                  <p>Tipo de entrega</p>
                </div>
                <p>
                  {order?.delivery_mode === "delivery" ? "Delivery" : "Pickup"}
                </p>
              </div>
              <div className="flex items-center justify-between gap-3">
                <div className="flex ml-2 gap-3 items-center">
                  <Ubicacion fill="black" />
                  <p>Direccion</p>
                </div>
                <p>{order?.address || "Sin dirección."}</p>
              </div>
            </ul>
            <hr className="border-[1px] my-5" />
            <h6 className="font-bold text-xl">Mi pedido</h6>
            <ul className="flex flex-col gap-3 py-5 justify-between items-center">
              <li className="flex flex-col md:flex-row gap-5 md:w-full justify-between items-center">
                <div className="flex gap-3 items-center">
                  <img
                    className="w-40 rounded-xl h-30 object-cover"
                    src="/bg_burgers.jpg"
                    alt=""
                  />
                  <div className="flex flex-col gap-3 justify-between h-full">
                    <p className="font-bold texl-xl">Cheeseburger</p>
                    <small>Sin cheddar, extra panceta, papas burgerli</small>
                    <b>$10.000</b>
                  </div>
                </div>
                <p className="font-bold text-2xl">X1</p>
              </li>
              <li className="flex flex-col md:flex-row  gap-5 w-full justify-between items-center">
                <div className="flex gap-3 items-center">
                  <img
                    className="w-40 rounded-xl h-30 object-cover"
                    src="/bg_burgers.jpg"
                    alt=""
                  />
                  <div className="flex flex-col gap-3 justify-between h-full">
                    <p className="font-bold texl-xl">Cheeseburger</p>
                    <small>Sin cheddar, extra panceta, papas burgerli</small>
                    <b>$10.000</b>
                  </div>
                </div>
                <p className="font-bold text-2xl">X1</p>
              </li>
            </ul>
            <hr className="border-[1px] my-5" />
          </div>
          <div className="md:w-1/2 flex flex-col">
            <h6 className="font-bold text-xl">Medio de pago</h6>
            <ul className="my-5 flex flex-col gap-3">
              <li className="flex items-center justify-between gap-3">
                <div className="flex gap-3 items-center">
                  <Moto />
                  <p>{order?.payment_method}</p>
                </div>
                <p>${order?.price.toLocaleString()}</p>
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
            <hr className="border-[1px] my-5" />
            <div className="flex w-full justify-between items-center">
              <b>Total</b>
              <b>${order?.price.toLocaleString()}</b>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
