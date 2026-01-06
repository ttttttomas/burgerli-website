type CardProps = {
  onClick: () => void;
  product: Burgers;
};
import { Burgers } from "@/types";

const sizePrices: Record<string, number> = { 
  Simple: 0, 
  Doble: 1100, 
  Triple: 2000 
};

function getSmallestAvailableSize(sizeArray?: string | string[]): string | null {
  // Manejar si size viene como string o array
  let sizes: string[] = [];
  
  if (typeof sizeArray === 'string') {
    // Si es un string, intentar parsearlo como JSON
    try {
      sizes = JSON.parse(sizeArray);
    } catch {
      sizes = [sizeArray];
    }
  } else if (Array.isArray(sizeArray)) {
    sizes = sizeArray;
  }
  
  
  // Buscar el tamaño más pequeño disponible en el orden: Simple -> Doble -> Triple
  if (sizes.includes("Simple")) return "Simple";
  if (sizes.includes("Doble")) return "Doble";
  if (sizes.includes("Triple")) return "Triple";
  
  // fallback
  return null;
}

export default function Card({ product, onClick }: CardProps) {
  // Obtener el tamaño más pequeño disponible
  const smallestSize = getSmallestAvailableSize(product.size);
  
  // Calcular el precio: precio base + precio del tamaño más pequeño disponible
  const basePrice = Number(product.price) + (smallestSize ? (sizePrices[smallestSize] ?? 0) : 0);
    
  const isOutOfStock = product.stock === 0;

  return (
    <li
      onClick={isOutOfStock ? undefined : onClick}
      className={`flex flex-col
      transition-all
      relative
      group
      duration-200
    w-56
    ${isOutOfStock ? 'cursor-not-allowed opacity-60' : 'hover:-translate-y-1 cursor-pointer'}
    bg-amber-50
    rounded-xl
    overflow-hidden`}
    >
      {/* Banner "No stock" */}
      {isOutOfStock && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 bg-red-600 text-white font-bold px-6 py-3 rounded-lg shadow-lg transform -rotate-12">
          NO STOCK
        </div>
      )}
      {product.id_burger && (
        <>
          <img
            src={product.main_image}
            alt="Foto Burger"
            className={`h-48 w-full object-cover bg-[#FCEDCC] ${isOutOfStock ? 'grayscale' : ''}`}
          />
          <div
            className={`
flex flex-col
justify-between
flex-1
${isOutOfStock ? 'bg-gray-600' : 'bg-primary'}
text-white
p-3
`}
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
            className={`h-48 w-full object-cover bg-[#FCEDCC] ${isOutOfStock ? 'grayscale' : ''}`}
          />
          <div
            className={`
flex flex-col
justify-between
flex-1
${isOutOfStock ? 'bg-gray-600' : 'bg-primary'}
text-white
p-3
`}
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
                      ? product.description_list?.join(", ")
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
            className={`h-48 w-full object-cover bg-[#FCEDCC] ${isOutOfStock ? 'grayscale' : ''}`}
          />
          <div
            className={`
flex flex-col
justify-between
flex-1
${isOutOfStock ? 'bg-gray-600' : 'bg-primary'}
text-white
p-3
`}
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
           className={`h-48 w-full object-cover bg-[#FCEDCC] ${isOutOfStock ? 'grayscale' : ''}`}
         />
         <div
           className={`
flex flex-col
justify-between
flex-1
${isOutOfStock ? 'bg-gray-600' : 'bg-primary'}
text-white
p-3
`}
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
      {product.id_promos && (
         <>
         <img
           src={product.image}
           alt="Foto dip"
           className={`h-48 w-full object-cover bg-[#FCEDCC] ${isOutOfStock ? 'grayscale' : ''}`}
         />
         <div
           className={`
flex flex-col
justify-between
flex-1
${isOutOfStock ? 'bg-gray-600' : 'bg-primary'}
text-white
p-3
`}
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
