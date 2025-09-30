'use client'
import Ubicacion from "@/app/components/icons/Ubicacion"
// import {inter,pattaya} from "@/app/layout"
import { Inter, Pattaya } from "next/font/google";
import { UsersClient } from "@/types"
import axios from "axios";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const pattaya = Pattaya({
  weight: ["400"],
  variable: "--font-pattaya",
  subsets: ["latin"],
});

export default function PersonalInformationPage({params}: {params: {id: string}}) {
  const id = params.id;
  console.log("id del personal information", id);

  
  return (
    <section className={`w-full px-10 py-5 flex items-center justify-center gap-10 text-white ${inter.className}`}>
        <form className="bg-primary px-10 pt-20 pb-10 flex rounded-b-3xl flex-col justify-between h-3/4 w-3/5">
            <h1 className={`${pattaya.className} font-bold text-2xl text-center`}>Datos personales</h1>
            <div className="flex flex-col gap-10">
            <label htmlFor="name" className="font-bold text-gray-400">Nombre</label>
            <input type="text" id="name" placeholder="Nombre y apellido" className="border-b-2" />
            <label htmlFor="email" className="font-bold text-gray-400">Correo electrónico</label>
            <input type="email" id="email" placeholder="email@gmail.com" className="border-b-2" />
            <label htmlFor="phone" className="font-bold text-gray-400">Teléfono</label>
            <input type="tel" id="phone" placeholder="123456789" className="border-b-2" />
            </div>
            <button className="bg-tertiary text-black py-2 rounded-xl font-bold text-lg px-5">Editar datos</button>
        </form>
        <div className="bg-primary h-3/4 flex rounded-b-3xl flex-col justify-start items-center w-2/5">
            <h2 className={`${pattaya.className} font-bold text-2xl pt-20 pb-10 text-center`}>Mis direcciones</h2>
            <ul className="flex flex-col gap-10 w-full px-20">
                <li>
                    <div className='flex justify-between pb-2 items-center'>
                      <div className='flex gap-3'>
                      <Ubicacion fill="white"/>
                      <div className='flex flex-col justify-center'>
                        {/* ACA VAN LAS DIRECCIONES GUARDADAS DEL USUARIO */}
                        <p>Direccion falsa 1234</p>
                        <small>Casa</small>
                      </div>
                      </div> 
                        <input className='rounded-xl' type="checkbox" name="" id="" />
                    </div>
                    <hr />
                    <div className='border-dashed border-2 px-3 py-1 my-3'>
            {/* INPUT PARA AGREGAR NUEVA DIRECCION TEMPORARIA  */}
                        <p>Agregar nueva direccion</p>
                    </div>
                </li>
            </ul>
        </div>
    </section>
  )
}
