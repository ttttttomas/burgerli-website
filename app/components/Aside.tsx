import Link from 'next/link'

export default function Aside() {
  return (
    <aside className="min-w-60 h-screen hidden xl:block bg-primary text-white">
        <ul className='flex flex-col gap-5 p-4'>
            <Link href="/myaccount/favorites">Mis favoritos</Link>
            <Link href="/myaccount/order-history">Historial de pedidos</Link>
            <Link href="/myaccount/personal-information">Información personal</Link>
            <Link className='bg-red-400 text-black text-center font-bold rounded-xl px-2 py-1' href="/">Cerrar sesión</Link>
        </ul>
    </aside>
)
}
