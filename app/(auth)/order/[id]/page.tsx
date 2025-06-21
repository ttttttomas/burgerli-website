"use client";
import Aside from "@/app/components/Aside";
import { useState, useEffect } from "react";
import Order1 from "@/app/components/icons/Order-1";
import Order2 from "@/app/components/icons/Order-2";
import Order3 from "@/app/components/icons/Order-3";
import Order4 from "@/app/components/icons/Order-4";
import Ubicacion from "@/app/components/icons/Ubicacion";
import Moto from "@/app/components/icons/Moto";
import Link from "next/link";

export default function OrderIDPage() {
  const [currentStep, setCurrentStep] = useState(-1);
  const [steps, setSteps] = useState([
    {
      label: "Pedido confirmado",
      icon: <Order1 />,
      active: true,
    },
    {
      label: "Pedido en preparacion",
      icon: <Order2 />,
      active: false,
    },
    {
      label: "Pedido en camino",
      icon: <Order3 />,
      active: false,
    },
    {
      label: "Pedido entregado",
      icon: <Order4 />,
      active: false,
    },
  ]);
  const [order, setOrder] = useState(steps[0]);

  useEffect(() => {
    const handleChangeOrder = () => {
      setCurrentStep((prev) => prev + 1);
      setOrder(order);
    };
    handleChangeOrder();
  }, [order]);

  return (
    <main className="w-full h-screen flex bg-[#FCEDCC] antialiased">
      <aside className="min-w-60 h-full hidden xl:block bg-primary text-white">
        <ul className='flex flex-col gap-5 p-4'>
            <Link href="/myaccount/favorites">Mis favoritos</Link>
            <Link href="/myaccount/order-history">Historial de pedidos</Link>
            <Link href="/myaccount/personal-information">Información personal</Link>
            <Link className='bg-red-400 text-black text-center font-bold rounded-xl px-2 py-1' href="/">Cerrar sesión</Link>
        </ul>
    </aside>
      <section className="w-full flex flex-col items-center">
        <div className="relative flex justify-center gap-10 my-10 items-center">
          <img src="/order-1.png" alt="Order" className="w-32" />
          {/* CAMBIO DE ESTADO DE IMAGENES CUANDO EL PEDIDO ESTE ENTREGADO */}
          {/* <img src="/order-2.png" alt="Order" className="w-32" /> */}

          <div className="flex flex-col items-start justify-center">
            <h2 className="text-2xl font-semibold italic text-gray-800">
              Confirmado
            </h2>
            <p className="text-gray-600 text-start">29/03/2025</p>
          </div>
        </div>

        <div className="relative w-full flex justify-between items-center">
          {/* LINEA HORIZONTAL */}
          <div className="absolute top-6 left-0 right-0 h-1 bg-[#5B524B] opacity-70 z-0" />

          {steps.map((step, index) => (
            <div
              key={index}
              className={`relative z-10 flex flex-col items-center text-center w-1/4`}
            >
              <div
                className={`p-2 rounded-full flex items-center justify-center mb-2
                  ${
                    step.active
                      ? "bg-[#442915] w-12 h-12"
                      : "bg-[#5B524B] w-10 h-10"
                  }
                  ${index === currentStep && "current-step "}
                `}
              >
                <div>{step.icon}</div>
              </div>
              <span
                className={`${
                  step.active
                    ? "text-black text-xl font-semibold"
                    : "text-gray-500"
                }`}
              >
                {step.label}
              </span>
            </div>
          ))}
        </div>
        <section className="flex p-16 gap-20 justify-between w-full items-start">
          <div className="w-1/2">
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
              <li className="flex gap-5 w-full justify-between items-center">
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
              <li className="flex gap-5 w-full justify-between items-center">
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
              <li className="flex gap-5 w-full justify-between items-center">
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
          <div className="w-1/2 flex flex-col">
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
