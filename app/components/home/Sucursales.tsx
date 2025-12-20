import { pattaya } from "@/app/layout"
import Link from "next/link"

export default function Sucursales() {
  return (
    <section className="w-full flex flex-col gap-5">
        <h2 className={`${pattaya.className} text-center text-2xl`}>Sucursales</h2>
        <p className="text-center px-10 text-sm md:px-0 md:text-medium">Estamos en Lanus, Gerli y Wilde te esperamos  para disfrutar de las mejores hamburguesas. Para Delivery podes hacer tu pedido en la web o encontranos en Pedidos Ya
        </p>
        <ul className="flex flex-col md:flex-row gap-y-10 justify-between items-center mx-20">
            <li className="flex flex-col items-center gap-2">
                <p className={`${pattaya.className} text-center text-xl`}>Lanus</p>
                <small className="underline font-semibold">• Sarmiento 1736</small>
                <Link target="_blank" href='https://maps.app.goo.gl/gxUb6pczLiUZGnDG7'>
                    <img src="/sarmiento.png" alt="Local 1" />
                </Link>
            </li>
            <li className="flex flex-col items-center gap-2">
            <p className={`${pattaya.className} text-center text-xl`}>Gerli</p>
                <small className="underline font-semibold">• Casacuberta 918</small>
                <Link target="_blank" href='https://maps.app.goo.gl/KdrzW82jAfJnS7yPA'>
                    <img src="/casacuberta.png" alt="Local 2" />
                </Link>
            </li>
            <li className="flex flex-col items-center gap-2">
            <p className={`${pattaya.className} text-center text-xl`}>Wilde</p>
                <small className="underline font-semibold">• Onsari 417</small>
                <Link target="_blank" href='https://maps.app.goo.gl/7fbvJMNv6N7nUhCB6'>
                    <img src="/onsari.png" alt="Local 3" />
                </Link>
            </li>
        </ul>
    </section>
  )
}
