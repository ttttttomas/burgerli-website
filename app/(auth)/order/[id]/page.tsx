"use client";
// import Aside from "@/app/components/Aside";
import { useState, useMemo, useRef, useEffect } from "react";
import Order1 from "@/app/components/icons/Order-1";
import Order2 from "@/app/components/icons/Order-2";
import Order3 from "@/app/components/icons/Order-3";
import Order4 from "@/app/components/icons/Order-4";
import Ubicacion from "@/app/components/icons/Ubicacion";
import Moto from "@/app/components/icons/Moto";
import { useCart } from "@/app/context/CartContext";
import { useSession } from "@/app/context/SessionContext";
// import { Orders } from "@/types";

type OrderStatus = "confirmed" | "preparing" | "on_route" | "delivered";


type PageProps = {
  params: {
    id: string;
  };
};


export default function OrderIDPage({params}: PageProps) {
  const {OrderById} = useSession();
  const {id}  = params;
  console.log(id);
  
  const {cart} = useCart();
  // const prevStatus = useRef<OrderStatus | null>(null);
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
const [order, setOrder] = useState<{ id: string; status: OrderStatus, }>({
  id: "demo",
  status: "confirmed",
});

const STEP_BY_STATUS: Record<OrderStatus, number> = {
  confirmed: 0,
  preparing: 1,
  on_route: 2,
  delivered: 3,
};
const STATUS_BY_STEP: OrderStatus[] = ["confirmed","preparing","on_route","delivered"];
const currentStep = STEP_BY_STATUS[order.status] ?? 0;
console.log(currentStep);

  useEffect(() => {
    async function fetchOrder() {
      try {
        // Esperar un poco para que el webhook procese la orden
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const res = await OrderById(id);

        if (!res) {
          return;
        }
        setOrder(res);
      } catch (error) {
        console.error("Error obteniendo orden:", error);
      }
    }

      fetchOrder();

    fetchOrder();
  }, []);


// useEffect(() => {
//     if (!order?.status) return;
//     // Sólo actualiza si realmente cambió el status
//     if (order.status !== prevStatus.current) {
//       const idx = STEP_BY_STATUS[order.status] ?? 0;
//       setCurrentStep(idx);
//       prevStatus.current = order.status;
//     }
//   }, [order?.status]);
// helpers para avanzar/retroceder o setear step
const setStep = (idx: number) => {
  const clamped = Math.max(0, Math.min(idx, STATUS_BY_STEP.length - 1));
  setOrder(o => ({ ...o, status: STATUS_BY_STEP[clamped] }));
};
// 

  return (
    <main className="w-full flex bg-[#FCEDCC] antialiased">
      <section className="w-full flex flex-col items-center">
        <div className="flex justify-center gap-10 my-10 items-center">
          <img src="/order-1.png" alt="Order" className="w-32" />
          {/* CAMBIO DE ESTADO DE IMAGENES CUANDO EL PEDIDO ESTE ENTREGADO */}
          {/* <img src="/order-2.png" alt="Order" className="w-32" /> */}

          <div className="flex flex-col items-start justify-center">
            <h2 className="text-2xl font-semibold italic -z-0 text-gray-800">
              Confirmado
            </h2>
            <p className="text-gray-600 text-start -z-0">29/03/2025</p>
          </div>
        </div>

        <div className="relative w-full flex justify-between items-center">
          {/* LINEA HORIZONTAL */}
          <div className="absolute top-6 left-0 right-0 h-1 bg-[#5B524B] opacity-70 z-0" />
          {/* LINEA HORIZONTAL */}
          {steps.map((step, index) => {
            const isActive = index <= currentStep;
            const isCurrent = index === currentStep;
             return (
              <div key={step.label} className="flex flex-col items-center gap-2">
                {/* Punto del timeline */}
                <span
                  className={[
                    "p-2 rounded-full flex items-center justify-center mb-1 transition-all",
                    isActive ? "bg-primary w-12 h-12" : "bg-[#5B524B] w-10 h-10 opacity-70",
                    isCurrent ? "ring-2 ring-black/20 current-step" : "",
                  ].join(" ")}
                >
                  {step.icon}
                </span>

                {/* Label */}
                <span
                  className={[
                    "text-sm",
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
                <p>Delivery</p>
              </div>
              <div className="flex items-center justify-between gap-3">
                <div className="flex ml-2 gap-3 items-center">
                  <Ubicacion fill="black" />
                  <p>Direccion</p>
                </div>
                <p>Calle falsa 123</p>
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
                  <p>Efectivo</p>
                </div>
                <p>$30.000</p>
              </li>
            </ul>
            <hr className="border-[1px] my-5" />
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
            </ul>
            <hr className="border-[1px] my-5" />
            <div className="flex w-full justify-between items-center">
            <b>Total</b>
            <b>$30.000</b>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
