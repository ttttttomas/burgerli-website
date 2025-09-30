'use client'
import { useState } from "react";

export default function Cupon() {
    const [cupon, setCupon] = useState('')
    const submitCupon = () => {
        setCupon('CUPON')
        // CONSULTA A LA BASE DE DATOS SI ESE CUPON EXISTE
        // SI EXISTE, APLICAR CUPON
        alert("Cupon aplicado")
        // SI NO EXISTE, NO APLICAR CUPON
        alert("Cupon no aplicado")
        // SI EXISTE PERO YA ESTA APLICADO POR EL USUARIO
        alert("Cupon ya utilizado")
    }
  return (
    <div className="flex bg-white rounded-xl py-1 my-2">
      <input value={cupon} onChange={(e) => setCupon(e.target.value)} className="w-full px-2 text-black rounded-xl" type="text" />
      <button onClick={submitCupon} className="text-black font-semibold px-2 cursor-pointer">
        Aplicar
      </button>
    </div>
  );
}
