'use client'

import { useEffect, useState } from 'react'
import { Pattaya } from 'next/font/google'
import Link from 'next/link'

const pattaya = Pattaya({
  weight: ["400"],
  variable: "--font-pattaya",
  subsets: ["latin"],
});

export default function DeliveryZoneModal() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Verificar si el usuario ya vio el modal
    const hasSeenModal = localStorage.getItem('deliveryZoneModalSeen')
    
    if (!hasSeenModal) {
      setIsOpen(true)
    }
  }, [])

  const handleClose = () => {
    localStorage.setItem('deliveryZoneModalSeen', 'true')
    setIsOpen(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Fondo atenuado */}
      <div 
        className="absolute inset-0 bg-black/80 bg-opacity-60"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative bg-[#FCEDCC] rounded-2xl shadow-2xl max-w-md w-full mx-4 p-8 border-4 border-primary">

        {/* Contenido */}
        <div className="flex flex-col items-center gap-6 text-center">
          {/* Icono de advertencia */}
          <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center">
            <svg 
              className="w-10 h-10 text-primary" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
              />
            </svg>
          </div>

          {/* Título */}
          <h2 className={`${pattaya.className} text-3xl text-primary`}>
            ¡Importante!
          </h2>

          {/* Mensaje */}
          <p className="text-primary text-lg leading-relaxed">
            Antes de hacer tu pedido, por favor verificá si tu dirección se encuentra dentro de nuestra zona de entrega.
          </p>
          <img src="/zonas.png" alt="Zonas de entrega" className="w-full h-auto object-cover" />
          {/* Botón */}
          <Link
            href="/#zonas"
            onClick={handleClose}
            className="w-full bg-primary hover:bg-tertiary text-white font-bold py-4 px-6 rounded-xl transition-colors duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Ver zona de entregas
          </Link>
        </div>
      </div>
    </div>
  )
}
