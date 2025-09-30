'use client'
import { Pattaya } from "next/font/google";
import "./Productos.css";
import ModalProducts from "../ModalProducts";
import useProducts from "@/app/hooks/useProducts";
import { Burgers } from "@/types";
import { useEffect, useState } from "react";

const pattaya = Pattaya({
  weight: ["400"],
  variable: "--font-pattaya",
  subsets: ["latin"],
});

export default function Productos() {
  const [burgers, setBurgers] = useState<Burgers[]>([]);
  const { getBurgers } = useProducts();
  useEffect(() => {
    const getProducts = async () => {
      const burgers = await getBurgers();
      setBurgers(burgers);
      console.log(burgers);
    };
    getProducts();
  }, []);

  const product: Burgers = {
    id_burger: "1",
    name: "Hamburguesa",
    price: 100,
    size: "XL",
    fries: "Normal",
    extras: ["Extra 1", "Extra 2"],
    sin: ["Sin 1", "Sin 2"],
    description: "Esta es una hamburguesa muy buena",
    main_image: "https://i.imgur.com/v7q9p5j.jpg",
    ingredients_list: ["Ingrediente 1", "Ingrediente 2"],
    size_list: ["XL", "L", "M", "S"],
    stock: true,
  }

  return (
    <section className="rounded-xl xl:w-3/4 w-full text-white">
      <div
        id="promociones"
        className="relative rounded-xl bg_promos w-full h-24"
      >
        <div
          className={`${pattaya.className} absolute rounded-xl inset-0 text-3xl z-10 flex items-center justify-center text-yellow-400 font-bold`}
        >
          Promociones
        </div>
        <img
          src="./bg_promos.jpg"
          alt="Promociones"
          className="rounded-xl after w-full h-full object-cover bg-center absolute top-0 left-0"
        />
      </div>
      <ul className="text-black flex flex-wrap gap-5 justify-center xl:justify-between mt-10 mb-16">
        {burgers.map((burger: Burgers) => (
          <ModalProducts key={burger.id_burger} product={burger} />
        ))}
        <ModalProducts product={product} />
      </ul>
      <div
        id="hamburguesas"
        className="relative rounded-xl bg_promos w-full h-24"
      >
        <div
          className={`${pattaya.className} absolute rounded-xl inset-0 text-3xl z-10 flex items-center justify-center text-yellow-400 font-bold`}
        >
          Hamburguesas
        </div>
        <img
          src="./bg_burgers.jpg"
          alt="Promociones"
          className="rounded-xl after w-full h-full object-cover bg-center absolute top-0 left-0"
        />
      </div>
      <ul className="text-black flex flex-wrap gap-5 justify-center xl:justify-between mt-10 mb-16">
        {/* <ModalProducts />
        <ModalProducts />
        <ModalProducts />
        <ModalProducts />
        <ModalProducts />
        <ModalProducts />
        <ModalProducts /> */}
      </ul>
      <div
        id="acompañamientos"
        className="relative rounded-xl bg_promos w-full h-26 md:h-24"
      >
        <div
          className={`${pattaya.className} absolute rounded-xl inset-0 text-3xl z-10 flex items-center justify-center text-yellow-400 font-bold`}
        >
          Acompañamientos
        </div>
        <img
          src="./bg_papas.jpg"
          alt="Promociones"
          className="rounded-xl after w-full h-full object-cover bg-center absolute top-0 left-0"
        />
      </div>
      <ul className="text-black flex flex-wrap gap-5 justify-center xl:justify-between mt-10 mb-16">
        {/* <ModalProducts />
        <ModalProducts />
        <ModalProducts />
        <ModalProducts />
        <ModalProducts />
        <ModalProducts />
        <ModalProducts /> */}
      </ul>
      <div id="bebidas" className="relative rounded-xl bg_promos w-full h-24">
        <div
          className={`${pattaya.className} absolute rounded-xl inset-0 text-3xl z-10 flex items-center justify-center text-yellow-400 font-bold`}
        >
          Bebidas
        </div>
        <img
          src="./bg_bebidas.jpg"
          alt="Promociones"
          className="rounded-xl after w-full h-full object-cover bg-center absolute top-0 left-0"
        />
      </div>
      <ul className="text-black flex flex-wrap gap-5 justify-center xl:justify-between mt-10 mb-16">
        {/* <ModalProducts />
        <ModalProducts />
        <ModalProducts />
        <ModalProducts />
        <ModalProducts />
        <ModalProducts /> */}
      </ul>
    </section>
  );
}
