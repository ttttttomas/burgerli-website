import { pattaya,inter } from '@/app/layout'
// import Cheddar from '../icons/Cheddar'
import Delivery from './Delivery'
import Link from 'next/link'
import Cupon from '../Cupon'

export default function Cart() {



  return (
    <section className={`${inter.className}`}>
          <h2 className={`${pattaya.className} text-2xl`}>Mi pdadedido</h2>
          <ul className='flex mt-6 flex-col gap-2'>
            <li className='flex justify-between items-start'>
                <div className='flex flex-col items-start gap-1'>
                    <p className='font-bold'>Hamburguesa triple queso</p>
                    <small>Extra:</small>
                    <small>Sin:</small>
                    <small>Papas:</small>
                    <button className='underline cursor-pointer text-sm'>Editar</button>
                </div>
                <div className='flex flex-col gap-3 items-center'>
                    <span className='font-bold'>$10.000</span>
                    <div className='flex gap-4 border rounded-xl justify-between px-2'>
                      <button className='cursor-pointer'> - </button>
                      <span className='text-tertiary font-bold'>1</span>
                      <button className='cursor-pointer'> + </button>
                    </div>
                </div>
            </li>
            <hr className='font-bold' />
            <li className='flex justify-between items-start'>
                <div className='flex flex-col items-start gap-1'>
                    <p className='font-bold'>Hamburguesa triple queso</p>
                    <small>Extra:</small>
                    <small>Sin:</small>
                    <small>Papas:</small>
                    <button className='underline cursor-pointer text-sm'>Editar</button>
                </div>
                <div className='flex flex-col gap-3 items-center'>
                    <span className='font-bold'>$10.000</span>
                    <div className='flex gap-4 border rounded-xl justify-between px-2'>
                      <button className='cursor-pointer'> - </button>
                      <span className='text-tertiary font-bold'>1</span>
                      <button className='cursor-pointer'> + </button>
                    </div>
                </div>
            </li>
            <hr className='font-bold' />
          </ul>
          <h3 className='mt-4 font-semibold'>Cupon de descuento</h3>
          <Cupon />
          <hr />
          {<Delivery />}
          <hr />
          <ul className='my-3 text-gray-500 w-full'>
            <li className='flex justify-between'>
              <p>Subtotal</p>
              <span>$20.000</span>
            </li>
            <li className='flex justify-between'>
            <p>Descuento</p>
            <span>-$5.000</span>
            </li>
            <li className='flex justify-between'>
            <p>Delivery</p>
            <span>$5.000</span>
            </li>
            <li className='flex justify-between mt-10 text-xl mb-5 font-bold text-tertiary'>
              <h4>Total</h4>
              <p>$20.000</p>
            </li>
            <h5 className='text-white text-lg font-semibold'>Instrucciones</h5>
            <hr />
            <textarea className='bg-white rounded-xl px-3 py-1 text-black font-semibold my-5 w-full h-52'></textarea>
            <Link href="/checkout">
              <button className='bg-tertiary w-full py-2 cursor-pointer rounded-xl text-black font-bold text-lg'>Continuar</button>
            </Link>
          </ul>
          
        </section>
  )
}
