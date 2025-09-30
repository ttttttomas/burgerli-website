'use client'
import { useState } from 'react'
import Logo from './Logo'
import ArrowDown from './icons/ArrowDown'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import MenuMobile from './icons/MenuMobile'
import {useSession} from '@/app/context/SessionContext'


export default function Header() {
    const { session,loading, logoutUser } = useSession()
    const [mobile, setMobile] = useState(false)
    const [menu, setMenu] = useState(false)
    const pathname = usePathname()
    const router = useRouter()

    const handleMobile = () => {setMobile(!mobile)}
    const handleClick = () => {setMenu(!menu)}
    const handleShow = () => {setMenu(false)}
    
    const handleLogout = async () => {
        setMenu(false);
        await logoutUser();
        router.refresh();
        router.push('/');
    }
    

  return (
        <header className="flex justify-between items-center text-md font-semibold bg-tertiary py-2 px-5">
            {mobile &&
            <aside className='fixed right-0 top-0 w-full h-full z-30' onClick={() => setMobile(false)}>
                <div className='bg-black/50 w-full h-full absolute top-0 left-0 -z-20'></div>
                <nav className='fixed top-0 right-0 w-[250px] h-full bg-primary z-20 p-5'>
                    <ul className='flex flex-col text-white gap-5'>
                        <Link href="/" onClick={() => setMobile(false)}>Inicio</Link>
                        <Link href="#hamburguesas" onClick={() => setMobile(false)}>Hamburguesas</Link>
                        <Link href="#acompañamientos" onClick={() => setMobile(false)}>Acompañamientos</Link>
                        <Link href="#bebidas" onClick={() => setMobile(false)}>Bebidas</Link>
                        <Link href="#sucursales" onClick={() => setMobile(false)}>Sucursales</Link>
                    </ul>
                </nav>    
            </aside>}
            <Link href='/'>
            <Logo width={70}/>
            </Link>
            <section className="flex gap-10 items-center">
                {pathname === '/' && <ul className="flex gap-10">
                    <Link href="#hamburguesas" className='hidden md:block cursor-pointer'>Hamburguesas</Link>
                    <Link href="#acompañamientos" className='hidden md:block cursor-pointer'>Acompañamientos</Link>
                    <Link href="#bebidas" className='hidden md:block cursor-pointer'>Bebidas</Link>
                    <Link href="#sucursales" className='hidden md:block cursor-pointer'>Sucursales</Link>
                </ul>}
                {session && !loading && 
                <section>
                    <div className="flex gap-5 items-center">
                        <Logo width={40}/>
                        <span>{session.username || 'Perfil'}</span>
                        <button onClick={handleClick} className={menu ? 'rotate-180 cursor-pointer transition-all' : 'cursor-pointer transition-all'}>
                        <ArrowDown />
                        </button>
                    </div>
                </section>}
                {!session && !loading &&
                    <section>
                     <Link href='/login' className='bg-yellow-200 cursor-pointer px-6 py-[8px] shadow-gray-700 shadow-md rounded-xl font-semibold'>Iniciar sesion</Link>
                </section>}
                {loading  && !session && <div className='flex items-center justify-center gap-2'>
                    <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-black'></div>
                    <p className='text-sm'>Cargando...</p>
                </div>}
                <div className='md:hidden cursor-pointer' onClick={handleMobile}>
                    <MenuMobile />
                </div>
            </section>
            {menu && 
            <div className='absolute right-0 rounded-bl-xl z-20 top-[86px] bg-red-500'>
                <ul className='flex gap-1 flex-col justify-between items-start py-2 pl-3 pr-5 bg-amber-950 text-white'>
                    <Link onClick={handleShow} href="/my-account/favorites">Mis favoritos</Link>
                    <Link onClick={handleShow} href="/my-account/order-history">Historial de compras</Link>
                    <Link onClick={handleShow} href={`/myaccount/personal-information/${session?.user_id}`}>Informacion personal</Link>
                </ul>
                <button onClick={handleLogout} className='text-center pl-3 cursor-pointer text-white hover:text-gray-300 transition-colors'>
                    Cerrar sesion
                </button>
            </div>}
        </header>
    )
}
