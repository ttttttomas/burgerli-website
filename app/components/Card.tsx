type CardProps = {
    onClick: () => void;
    product: Burgers;
  };
  import { Burgers } from "@/types";

export default function Card({product, onClick}: CardProps ) {
    const price = Number(product.price);
    return (
            <li onClick={onClick} className="flex flex-col w-56 cursor-pointer bg-amber-50 rounded-xl">
                <img className="mx-auto"
                src="/bg_burgers.jpg"
                //  src={product.main_image}
                 width="100%"
                 alt="Foto Burger" />
                <div className="flex flex-col gap-2  bg-primary rounded-b-xl text-white py-2 px-2">
                <p className="font-bold">{product.name}</p>
                <small>{product.description}</small>
                <span className="font-bold">${(price.toLocaleString("es-AR"))}</span>
                </div>
            </li>
        )
}
