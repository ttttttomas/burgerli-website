type CardProps = {
  onClick: () => void;
  product: Burgers;
};
import { Burgers } from "@/types";

const sizePrices = { Simple: 0, Doble: 1100, Triple: 2000 } as const;

function getCardBaseSize(size_list?: string[]) {
  const sizes = size_list ?? [];

  if (sizes.includes("Simple")) return "Simple";
  if (sizes.includes("Doble")) return "Doble";
  if (sizes.includes("Triple")) return "Triple";

  // fallback si viene vacío o raro
  return null;
}

export default function Card({ product, onClick }: CardProps) {
  const baseSize = getCardBaseSize(product.size_list);
  const basePrice =
    Number(product.price) + (baseSize ? sizePrices[baseSize] ?? 0 : 0);

  return (
    <li
      onClick={onClick}
      className="flex flex-col
      transition-all
      relative
      group
      duration-200
    w-56
    hover:-translate-y-1
    cursor-pointer
    bg-amber-50
    rounded-xl
    overflow-hidden"
    >
      {product.id_burger && (
        <>
          <img
            src={product.main_image}
            alt="Foto Burger"
            className="h-48 w-full object-cover bg-[#FCEDCC]"
          />
          <div
            className="
flex flex-col
justify-between
flex-1
bg-primary
text-white
p-3
"
          >
            <div className="flex flex-col gap-3">
              <p className="font-bold">{product.name}</p>
              <small className="text-xs opacity-90 truncate">
                {product.description}
              </small>
              <span className="font-bold">
                ${basePrice.toLocaleString("es-AR")}
              </span>
              <div
                className="
        pointer-events-none
        absolute left-3 right-3 bottom-14
        rounded-lg
        bg-black/90
        px-3 py-2
        text-xs text-white
        opacity-0
        translate-y-2
        transition-all duration-300 ease-out
        group-hover:opacity-100
        group-hover:translate-y-0
      "
              >
                {product.description}
              </div>
            </div>
          </div>
        </>
      )}
      {product.id_fries && (
        <>
          <img
            src={product.main_image}
            alt="Foto Burger"
            className="h-48 w-full object-cover bg-[#FCEDCC]"
          />
          <div
            className="
flex flex-col
justify-between
flex-1
bg-primary
text-white
p-3
"
          >
            <div className="flex flex-col gap-3">
              <p className="font-bold">{product.name}</p>
              <small className="text-xs opacity-90 truncate">
                {product.description}
              </small>
              <span className="font-bold">
                ${product.price_list?.[0]
                  ? product.price_list[0].toLocaleString("es-AR")
                  : null}
              </span>
              {product.description ||
                (product.description_list && (
                  <div
                    className="
      pointer-events-none
      absolute left-3 right-3 bottom-14
      rounded-lg
      bg-black/90
      px-3 py-2
      text-xs text-white
      opacity-0
      translate-y-2
      transition-all duration-300 ease-out
      group-hover:opacity-100
      group-hover:translate-y-0
    "
                  >
                    {product.description_list?.[0]
                      ? product.description_list[0]
                      : null}
                  </div>
                ))}
            </div>
          </div>
        </>
      )}
      {product.id_drinks && (
        <>
          <img
            src={product.main_image}
            alt="Foto Burger"
            className="h-48 w-full object-cover bg-[#FCEDCC]"
          />
          <div
            className="
flex flex-col
justify-between
flex-1
bg-primary
text-white
p-3
"
          >
            <div className="flex flex-col gap-3">
              <p className="font-bold">{product.name}</p>
              <small className="text-xs opacity-90 truncate">
                {product.description}
              </small>
              <span className="font-bold">
                ${basePrice.toLocaleString("es-AR")}
              </span>
              <div
                className="
        pointer-events-none
        absolute left-3 right-3 bottom-14
        rounded-lg
        bg-black/90
        px-3 py-2
        text-xs text-white
        opacity-0
        translate-y-2
        transition-all duration-300 ease-out
        group-hover:opacity-100
        group-hover:translate-y-0
      "
              >
                {product.description_list?.[0]
                  ? product.description_list[0]
                  : null}
              </div>
            </div>
          </div>
        </>
      )}
      {product.id_dips && (
         <>
         <img
           src={product.images?.[0]}
           alt="Foto dip"
           className="h-48 w-full object-cover bg-[#FCEDCC]"
         />
         <div
           className="
flex flex-col
justify-between
flex-1
bg-primary
text-white
p-3
"
         >
           <div className="flex flex-col gap-3">
             <p className="font-bold">{product.name}</p>
             <small className="text-xs opacity-90 truncate">
               {product.description}
             </small>
             <span className="font-bold">
               ${basePrice.toLocaleString("es-AR")}
             </span>
             <div
               className="
       pointer-events-none
       absolute left-3 right-3 bottom-14
       rounded-lg
       bg-black/90
       px-3 py-2
       text-xs text-white
       opacity-0
       translate-y-2
       transition-all duration-300 ease-out
       group-hover:opacity-100
       group-hover:translate-y-0
     "
             >
               {product.description_list?.[0]
                 ? product.description_list[0]
                 : null}
             </div>
           </div>
         </div>
       </>
      )}
    </li>
  );
}
