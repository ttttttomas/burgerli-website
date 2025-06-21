import { pattaya } from "@/app/layout";
import "./Productos.css";
import ModalProducts from "../ModalProducts";

export default function Productos() {
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
        <ModalProducts />
        <ModalProducts />
        <ModalProducts />
        <ModalProducts />
        <ModalProducts />
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
        <ModalProducts />
        <ModalProducts />
        <ModalProducts />
        <ModalProducts />
        <ModalProducts />
        <ModalProducts />
        <ModalProducts />
      </ul>
      <div
        id="acompañamientos"
        className="relative rounded-xl bg_promos w-full h-26 md:h-24"
      >
        <div
          className={`${pattaya.className} absolute rounded-xl inset-0 text-3xl z-10 flex items-center justify-center text-yellow-400 font-bold`}
        >
          Acompaniamientos
        </div>
        <img
          src="./bg_papas.jpg"
          alt="Promociones"
          className="rounded-xl after w-full h-full object-cover bg-center absolute top-0 left-0"
        />
      </div>
      <ul className="text-black flex flex-wrap gap-5 justify-center xl:justify-between mt-10 mb-16">
        <ModalProducts />
        <ModalProducts />
        <ModalProducts />
        <ModalProducts />
        <ModalProducts />
        <ModalProducts />
        <ModalProducts />
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
        <ModalProducts />
        <ModalProducts />
        <ModalProducts />
        <ModalProducts />
        <ModalProducts />
        <ModalProducts />
      </ul>
    </section>
  );
}
