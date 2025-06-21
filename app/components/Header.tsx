'use client'
import { useState } from 'react'
import Logo from './Logo'
import ArrowDown from './icons/ArrowDown'
import Link from 'next/link'
import { usePathname } from 'next/navigation'


export default function Header() {

    const [user] = useState(true)
    const [menu, setMenu] = useState(false)
    const pathname = usePathname()

    const handleClick = () => {setMenu(!menu)}
    const handleShow = () => {setMenu(false)}

  return (
        <header className="flex justify-between items-center text-md font-semibold bg-tertiary py-2 px-5">
            <Link href='/'>
            <Logo width={70}/>
            </Link>
            <section className="flex gap-10 items-center">
                {pathname === '/' && <ul className="flex gap-10">
                    <Link href="#hamburguesas" className='cursor-pointer'>Hamburguesas</Link>
                    <Link href="#acompañamientos" className='cursor-pointer'>Acompañamientos</Link>
                    <Link href="#bebidas" className='cursor-pointer'>Bebidas</Link>
                    <Link href="#sucursales" className='cursor-pointer'>Sucursales</Link>
                </ul>}

                {user ? 
                <section>
                    <div className="flex gap-5 items-center">
                        <Logo width={40}/>
                        <span>Perfil</span>
                        <div onClick={handleClick} className={menu ? 'rotate-180 cursor-pointer' : 'cursor-pointer'}>
                        <ArrowDown />
                        </div>
                    </div>
                </section>
                 : 
                <section>
                     <Link href='/login' className='bg-yellow-200 cursor-pointer px-6 py-[8px] shadow-gray-700 shadow-md rounded-xl font-semibold'>Iniciar sesion</Link>
                </section>}
            </section>
            {menu &&
            <div className='absolute right-0 rounded-bl-xl top-[86px] bg-red-500'>
                <ul className='flex gap-1 flex-col justify-between items-start py-2 pl-3 pr-5 bg-amber-950 text-white'>
                    <Link onClick={handleShow} href="/myaccount/favorites">Mis favoritos</Link>
                    <Link onClick={handleShow} href="/myaccount/order-history">Historial de compras</Link>
                    <Link onClick={handleShow} href="/myaccount/personal-information">Informacion personal</Link>
                </ul>
                <Link onClick={handleShow} href="/" className='text-center pl-3'>Cerrar sesion</Link>
            </div>}
        </header>
    )
}
