'use client'
import { useState } from 'react'
import Logo from './Logo'
import ArrowDown from './icons/ArrowDown'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import MenuMobile from './icons/MenuMobile'
import {useSession} from '@/app/context/SessionContext'


export default function Header() {
    const { session, loading, logoutUser } = useSession()
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
        router.push('/');
        // Forzar recarga para limpiar todo el estado
        setTimeout(() => {
            window.location.href = '/';
        }, 100);
    }
    
    // Obtener el nombre de usuario de forma segura
    const username = session?.username || 'Usuario';
    

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
                {/* Mostrar loading mientras verifica la sesión */}
                {loading && (
                    <div className='flex items-center justify-center gap-2'>
                        <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-black'></div>
                        <p className='text-sm hidden md:block'>Cargando...</p>
                    </div>
                )}
                
                {/* Mostrar menú de usuario si hay sesión */}
                {!loading && session && (
                    <section className="relative">
                        <div className="flex gap-3 md:gap-5 items-center">
                            <Logo width={40}/>
                            <span className="hidden md:block font-medium">{username}</span>
                            <span className="md:hidden font-medium text-sm truncate max-w-[100px]">{username}</span>
                            <button 
                                onClick={handleClick} 
                                className={`transition-transform duration-300 cursor-pointer ${menu ? 'rotate-180' : ''}`}
                                aria-label="Abrir menú de usuario"
                            >
                                <ArrowDown />
                            </button>
                        </div>
                    </section>
                )}
                
                {/* Mostrar botón de login si no hay sesión */}
                {!loading && !session && (
                    <section>
                        <Link 
                            href='/login' 
                            className='bg-yellow-200 cursor-pointer px-4 md:px-6 py-2 md:py-[8px] shadow-gray-700 shadow-md rounded-xl font-semibold text-sm md:text-base hover:bg-yellow-300 transition-colors'
                        >
                            Iniciar sesión
                        </Link>
                    </section>
                )}
                <div className='md:hidden cursor-pointer' onClick={handleMobile}>
                    <MenuMobile />
                </div>
            </section>
            {/* Menú desplegable de usuario */}
            {menu && session && (
                <div className='absolute right-5 md:right-10 rounded-lg z-30 top-[70px] md:top-[86px] shadow-xl overflow-hidden'>
                    <ul className='flex gap-1 flex-col justify-between items-start py-3 px-4 bg-amber-950 text-white min-w-[200px]'>
                        <li className="w-full block py-2 px-2  text-gray-400 rounded transition-colors">
                                Mis favoritos
                        </li>
                        <li className="w-full">
                            <Link 
                                onClick={handleShow} 
                                href="/myaccount/order-history"
                                className="block py-2 px-2 hover:bg-amber-900 rounded transition-colors"
                            >
                                Historial de compras
                            </Link>
                        </li>
                        <li className="w-full">
                            <Link 
                                onClick={handleShow} 
                                href={`/myaccount/personal-information/${session.user_id_user_client}`}
                                className="block py-2 px-2 hover:bg-amber-900 rounded transition-colors"
                            >
                                Información personal
                            </Link>
                        </li>
                        <li className="w-full border-t border-amber-800 mt-2 pt-2">
                            <button 
                                onClick={handleLogout} 
                                className='w-full text-left py-2 px-2 hover:bg-red-900 rounded transition-colors text-red-200 hover:text-white'
                            >
                                Cerrar sesión
                            </button>
                        </li>
                    </ul>
                </div>
            )}
        </header>
    )
}
