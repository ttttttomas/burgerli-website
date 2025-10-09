import ModalProducts from "@/app/components/ModalProducts";
import { pattaya } from "@/app/layout";
import { Burgers } from "@/types";

export default function FavoritePage() {

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
    <section className="w-full px-10 py-5">
        <h1 className={`${pattaya.className}font-bold text-2xl`}>Favoritos</h1>
        <p className="my-5">Volvé a pedir las que más te gustan</p>
        <ul className="flex flex-wrap justify-between w-full">
            <ModalProducts product={product}/>
        </ul>
    </section>
  )
}
