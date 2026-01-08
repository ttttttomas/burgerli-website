"use client";
import { Anton } from "next/font/google";
import "./Productos.css";
import ModalProducts from "../ModalProducts";
import ModalFries from "../ModalFries";
// import ModalDips from "../ModalDips";
import ModalDrinks from "../ModalDrinks";
import ModalPromos from "../ModalPromos";
import useProducts from "@/app/hooks/useProducts";
import { Burgers } from "@/types";
import { useEffect, useState } from "react";

const anton = Anton({
  weight: ["400"],
  variable: "--font-anton",
  subsets: ["latin"],
});

export default function Productos() {
  const [burgers, setBurgers] = useState<Burgers[]>([]);
  const [fries, setFries] = useState([]);
  const [drinks, setDrinks] = useState([]);
  const [loading, setLoading] = useState(false);
  // const [dips, setDips] = useState([]);
  const [promos, setPromos] = useState([]);
  const { getBurgers, getFries, getDrinks, getPromos } = useProducts();
  useEffect(() => {
    const getProducts = async () => {
      setLoading(true);
      const burgers = await getBurgers();
      setBurgers(burgers);
      const drinks = await getDrinks();
      setDrinks(drinks);
      const fries = await getFries();
      setFries(fries);
      // const dips = await getDips();
      // setDips(dips);
      const promos = await getPromos();
      setPromos(promos);
      setLoading(false);
    };
    getProducts();
  }, []);

  // const product: Burgers = {
  //   id_burger: "1",
  //   name: "Producto de prueba",
  //   price: 1,
  //   fries: "Normal",
  //   extras: ["Extra 1", "Extra 2"],
  //   sin: ["Sin 1", "Sin 2"],
  //   description: "Producto de prueba",
  //   main_image: "https://i.imgur.com/v7q9p5j.jpg",
  //   ingredients_list: ["Ingrediente 1", "Ingrediente 2"],
  //   ingredients: ["Ingrediente 1", "Ingrediente 2"],

  //   size: ["XL", "L", "M", "S"],
  //   stock: true,
  // };

  return (
    <section className="rounded-xl xl:w-3/4 w-full text-white">
      <div
        id="promociones"
        className="relative rounded-xl bg_promos w-full h-24"
      >
        <div
          className={`${anton.className} absolute rounded-xl inset-0 text-3xl z-10 flex items-center justify-center text-[#FCEDCC] font-bold`}
        >
          PROMOCIONES
        </div>
        <img
          src="./bg_promos.jpg"
          alt="Promociones"
          className="rounded-xl after w-full h-full object-cover bg-center absolute top-0 left-0"
        />
      </div>
      <ul className="text-black flex flex-wrap gap-10 my-10 justify-center xl:justify-start">
        {loading && <div className="text-center font-semibold text-2xl">Cargando...</div>}
        {promos.map((promo: Burgers) => (
          <ModalPromos key={promo.id_promos} product={promo} />
        ))}
        {/* <ModalProducts product={product} /> */}
      </ul>
      <div
        id="hamburguesas"
        className="relative rounded-xl bg_promos w-full h-24"
      >
        <div
          className={`${anton.className} absolute rounded-xl inset-0 text-3xl z-10 flex items-center justify-center text-[#FCEDCC] font-bold`}
        >
          HAMBURGUESAS
        </div>
        <img
          src="./bg_burgers.jpg"
          alt="Promociones"
          className="rounded-xl after w-full h-full object-cover bg-center absolute top-0 left-0"
        />
      </div>
      <ul className="text-black flex flex-col items-center md:grid grid-cols-2 xl:grid-cols-4 gap-10 justify-center xl:place-items-center mt-10 mb-16">
        {loading && <div className="text-center font-semibold text-2xl">Cargando...</div>}
        {burgers.map((burger: Burgers) => (
          <ModalProducts  key={burger.id_burger} product={burger} />
        ))}
      </ul>
      <div
        id="acompañamientos"
        className="relative rounded-xl bg_promos w-full h-26 md:h-24"
      >
        <div
          className={`${anton.className} absolute rounded-xl inset-0 text-3xl z-10 flex items-center justify-center text-[#FCEDCC] font-bold`}
        >
          ACOMPAÑAMIENTOS
        </div>
        <img
          src="./bg_papas.jpg"
          alt="Promociones"
          className="rounded-xl after w-full h-full object-cover bg-center absolute top-0 left-0"
        />
      </div>
      <ul className="text-black flex flex-wrap gap-10 justify-center xl:justify-start mt-10 mb-16">
        {loading && <div className="text-center font-semibold text-2xl">Cargando...</div>}
        {fries.map((fries: Burgers) => (
          <ModalFries key={fries.id_fries} product={fries} />
        ))}
        {/* {dips.map((dips: Burgers) => (
          <ModalDips key={dips.id_dips} product={dips} />
        ))} */}
      </ul>
      <div id="bebidas" className="relative rounded-xl bg_promos w-full h-24">
        <div
          className={`${anton.className} absolute rounded-xl inset-0 text-3xl z-10 flex items-center justify-center text-[#FCEDCC] font-bold`}
        >
          BEBIDAS
        </div>
        <img
          src="./bg_bebidas.jpg"
          alt="Promociones"
          className="rounded-xl after w-full h-full object-cover bg-center absolute top-0 left-0"
        />
      </div>
      <ul className="text-black flex flex-wrap gap-10 justify-center xl:justify-start mt-10 mb-16">
        {loading && <div className="text-center font-semibold text-2xl">Cargando...</div>}
        {drinks.map((drink: Burgers) => (
          <ModalDrinks key={drink.id_drinks} product={drink} />
        ))}
      </ul>
    </section>
  );
}
