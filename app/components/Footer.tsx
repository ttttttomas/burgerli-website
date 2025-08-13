import Link from "next/link";
import { pattaya,roboto } from "../layout";
import Logo from "./Logo";
import Facebook from './icons/Facebook'
import Instagram from './icons/Instagram'


export default function Header() {
  return (
        <footer className={`${pattaya.className} bg-[#EA951B]`}>
            <img src="/bg-footer2.png" alt="Footer" className="w-full object-cover" />
            <ul className="flex flex-col md:flex-row justify-between md:items-end mb-5 px-10">
                <Link className="mx-auto md:mx-0" href='/'>
                    <Logo width="135px"/>
                </Link>
                <li className="flex flex-col items-center gap-5 md:gap-10">
                    <p className="text-2xl text-center">Seguinos en nuestras en redes</p>
                    <ul className="flex w-full justify-between mb-5 md:mb-5 md:justify-around">
                        <li>
                            <Facebook />
                        </li>
                        <li>
                            <Instagram />
                        </li>
                    </ul>
                </li>
                <li className="flex md:w-auto w-full items-center flex-col gap-6">
                        <p className="text-2xl">Horarios de atención</p>
                        <small className={`${roboto.className} font-semibold`}>• Lunes a viernes 10am a 11pm</small>
                        <small className={`${roboto.className} font-semibold`}>• Sabado y domingos 10am a 2am</small>
                </li>
            </ul>
            <div className="flex  flex-col md:flex-row justify-between items-center bg-[#222222] text-white md:px-10 py-1">
                <p className={roboto.className}>Todos los derechos reservados 2025 © Burgerli</p>
                <div className="flex items-center gap-2">
                <p className={roboto.className}>Desarrollado por:</p>
                <Link target="_blank" href='https://www.iwebtecnology.com'>
                    <img src="/iweb.png" alt="iWeb" />
                </Link>
                </div>
            </div>
        </footer>
    )
}