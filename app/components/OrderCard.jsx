import Link from "next/link";

export default function OrderCard({ order }) {
  const isoDate = order.created_at;

  const date = new Date(isoDate);
  
  const formatted =
    `${date.getFullYear()}-` +
    `${String(date.getMonth() + 1).padStart(2, "0")}-` +
    `${String(date.getDate()).padStart(2, "0")} ` +
    ` --   ` +
    `${String(date.getHours()).padStart(2, "0")}:` +
    `${String(date.getMinutes()).padStart(2, "0")}:` +
    `${String(date.getSeconds()).padStart(2, "0")}`;

  return (
    <Link href={`/order/${order.id_order}`} className="flex flex-col px-4 h-24 py-2 bg-primary rounded-xl shadow-lg shadow-black/60 text-white gap-2 w-full xl:w-[380px]">
      <small className="font-medium">{formatted}</small>
      {order.status === "confirmed" && <p className="text-tertiary text-sm font-bold">Estado: Confirmado</p>}
      {order.status === "in_preparation" && <p className="text-tertiary text-sm font-bold">Estado: En preparación</p>}
      {order.status === "on_the_way" && <p className="text-tertiary text-sm font-bold">Estado: En camino</p>}
      {order.status === "delivered" && <p className="text-green-400 text-sm font-bold">Estado: Entregado</p>}
      <div className="flex justify-between items-center">
        <small className="font-medium">{order.price}</small>
        <small className="font-medium">{order.products.length} productos</small>
      </div>
    </Link>
  );
}
