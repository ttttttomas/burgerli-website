export default function OrderCard({order}) {
  const isoDate = order.created_at;

const date = new Date(isoDate);
console.log(date);


const formatted =
  `${date.getFullYear()}-` +
  `${String(date.getMonth() + 1).padStart(2, "0")}-` +
  `${String(date.getDate()).padStart(2, "0")} ` +
  ` --   ` +
  `${String(date.getHours()).padStart(2, "0")}:` +
  `${String(date.getMinutes()).padStart(2, "0")}:` +
  `${String(date.getSeconds()).padStart(2, "0")}`;

console.log(formatted);
  return (
    <div className="flex flex-col px-4 h-24 py-2 bg-primary rounded-xl shadow-lg shadow-black/60 text-white gap-2 w-full xl:w-[380px]">
            <small className="font-medium">{formatted}</small>
            <p className="text-green-400 text-sm font-bold">Estado: Entregado</p>
            <div className="flex justify-between items-center">
                <small className="font-medium">{order.price}</small>
                <small className="font-medium">{order.products.length} productos</small>
            </div>
        </div>
  )
}
