"use client";
import Link from "next/link";
import { useSession } from "../context/SessionContext";

export default function Aside() {
  const { session } = useSession();
  return (
    <aside className="min-w-60 hidden xl:block bg-primary text-white">
      <ul className="flex flex-col gap-5 p-4">
        {/* <Link href="/myaccount/favorites">Mis favoritos</Link> */}
        {/* <p className="text-gray-400">Mis favoritos</p> */}
        <Link className="underline" href="/myaccount/order-history">Historial de pedidos</Link>
        <Link className="underline"
          href={`/myaccount/personal-information/${session?.user_id_user_client}`}
        >
          Información personal
        </Link>
        <Link
          className="bg-red-400 text-black text-center font-bold rounded-xl px-2 py-1"
          href="/"
        >
          Cerrar sesión
        </Link>
      </ul>
    </aside>
  );
}
