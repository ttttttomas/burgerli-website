"use client";
import Ubicacion from './icons/Ubicacion'

import Cupon from "./Cupon";
import { useEffect, useMemo, useState } from "react";
import { Inter, Pattaya } from "next/font/google";
import { useCart } from "@/app/context/CartContext";
import { CartProduct } from "@/types";
import { X } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { saveCheckoutDraft } from '@/app/lib/checkoutStorage';


const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const pattaya = Pattaya({
  weight: ["400"],
  variable: "--font-pattaya",
  subsets: ["latin"],
});
export default function CartResponsive({ closed }: { closed: () => void }) {
  const router = useRouter();
  // MODAL
  const [open, setOpen] = useState(false);
  // DELIVERY STATES
  const [addresses, setAddresses] = useState([
  { id: 'a1', label: 'Casa', street: 'Direccion falsa 1234' },
  { id: 'a2', label: 'Trabajo', street: 'Av. Siempre Viva 12' },
]);
  const [instructions, setInstructions] = useState('');
  const [isDeliveryChecked, setIsDeliveryChecked] = useState(false);
  const [sucursal, setSucursal] = useState<string>("Gerli");
  const [isTakeAwayChecked, setIsTakeAwayChecked] = useState(false);
  const [mode, setMode] = useState<"pickup" | "delivery">("pickup");
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [deliveryPricing, setDeliveryPricing] = useState(5000);
  // TOTAL STATES
  const [salePricing, setSalePricing] = useState(0);
  const [totalPricingCart, setTotalPricingCart] = useState<number | null>(null);
  const { cartProducts, removeFromCart, addQuantity, removeQuantity, resetCart, totalPricing } = useCart();
  
  useEffect(() => {
    if (mode === 'pickup') {
      setDeliveryPricing(0);
    } else {
      setDeliveryPricing(5000);
    }
  }, [mode, selectedAddressId]);

  const handleModeChange = (e: React.ChangeEvent<HTMLInputElement>) => {setMode(e.target.value as 'delivery' | 'pickup');};
//   const handleAddressChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
//   const id = e.target.value || null;
//   setSelectedAddressId(id);
// };

  const subTotal = totalPricing()

  const selectedAddress = useMemo(
  () => addresses.find(a => a.id === selectedAddressId) ?? null,
  [addresses, selectedAddressId]
);

  useEffect(() => {
    setTotalPricingCart(
      totalPricing() + salePricing + deliveryPricing - salePricing
    ); 
  }, [deliveryPricing, totalPricing, salePricing]);

    const handleContinue = async () => {
      const draft = {
      name: "Compra en Burgerli",
      products: cartProducts,
      delivery_mode: mode,
      address: selectedAddress || null,      
      price: totalPricingCart,
      deliveryPrice: deliveryPricing,
      salePricing,
      subTotal,
      sin: cartProducts.filter((p: any) => (p.sin?.length ?? 0) > 0).map((p: any) => p.sin).flat(),
      // extras: cartProducts.filter((p: any) => (p.extras?.length ?? 0) > 0).map((p: any) => p.extras).flat(),
      // cupon: cupon,
      sucursal: sucursal,
      order_notes: instructions
    };
  
     saveCheckoutDraft(draft);      // ← guarda todo en localStorage
      router.push("/checkout");
    }

  return (
    <section
      className={`${inter.className} md:hidden block fixed overflow-y-scroll w-full h-[90vh] right-0 z-50 pt-5 top-0 text-white rounded-2xl bg-primary py-3 px-5`}>
      <div>
        <h2 className={`${pattaya.className} text-2xl`}>Mi pedido</h2>
        <button
          onClick={closed}
          className="absolute cursor-pointer right-3 top-2 p-2 rounded-full bg-black/20"
          aria-label="Cerrar">
          <X className="w-6 h-6" />
        </button>
      </div>
      <ul className="flex mt-6 flex-col gap-2">
        {cartProducts.map((product: CartProduct) => (
            <li
              key={product.price}
              className="flex justify-between items-start">
              <div className="flex flex-col items-start gap-1">
                <p className="font-bold">{product.name}</p>
                <small>Sin: {product.sin.join(", ")}</small>
                <small>Tamaño: {product.size}</small>
                <small>Papas: {product.fries}</small>
                <button
                  onClick={() => removeFromCart(product)}
                  className="underline cursor-pointer text-sm">
                  Eliminar
                </button>
              </div>
              <div className="flex flex-col gap-3 items-center">
                <span className="font-bold">
                  ${product.price.toLocaleString("es-AR")}
                </span>
                <div className="flex gap-4 border rounded-xl justify-between px-2">
                  <button
                    onClick={() => removeQuantity(product)}
                    className="cursor-pointer">
                    {" "}
                    -{" "}
                  </button>
                  <span className="text-tertiary font-bold">
                    {product.quantity}
                  </span>
                  <button
                    onClick={() => addQuantity(product)}
                    className="cursor-pointer">
                    {" "}
                    +{" "}
                  </button>
                </div>
              </div>
            </li>
          ))}
        {cartProducts.length > 0 && <hr className="font-bold" />}
      </ul>
      <h3 className="mt-4 font-semibold">Cupon de descuento</h3>
      <Cupon />
      <hr />
      <ul className='flex my-3 justify-between items-center'>
                  <li>
                      <input 
                      name='pedido' 
                      type="radio"
                      value="delivery"
                      checked={mode === 'delivery'}
                      onChange={handleModeChange}
                      onClick={() => {
                        setIsTakeAwayChecked(false)
                        setIsDeliveryChecked(true)}
                      }
                      /> Delivery
                  </li>
                  <li>
                      <input 
                      name='pedido' 
                      type="radio"
                      value="pickup"
                      checked={mode === 'pickup'}
                      onChange={handleModeChange}
                      onClick={() => {
                        setIsDeliveryChecked(false)
                        setIsTakeAwayChecked(true)}}
                      /> Retiro en el local
                  </li>
              </ul>
             {mode === "delivery" && 
             <>
                <div className="flex flex-col gap-2">
                  {addresses.map((address) => (
                    <div key={address.id} className='flex justify-between items-center'>
                      <div className='flex gap-3'>
                      <Ubicacion fill={"white"}/>
                      <div className='flex flex-col justify-center'>
                        {/* ACA VAN LAS DIRECCIONES GUARDADAS DEL USUARIO */}
                        <p>{address.street}</p>
                        <small>{address.label}</small>
                      </div>
                      </div> 
                        <input
                        type="radio" 
                        name="address"
                        className='rounded-xl'
                        checked={selectedAddressId === address.id}
                        onChange={() => setSelectedAddressId(address.id)}
                        />
                  </div>
                  ))}
                </div>
                <div className='border-dashed border-2 px-3 py-1 my-3'>
                  {/* INPUT PARA AGREGAR NUEVA DIRECCION TEMPORARIA  */}
                  <p>Agregar nueva direccion</p>
                </div>
                </>}
                {mode === "pickup" &&
                <div>
                  <p className='text-start font-bold text-lg my-4'>Seleccioná la sucursal de retiro</p>
                  <select onChange={(e) => setSucursal(e.target.value)} className='w-full'>
                    <option disabled>Seleccione una sucursal</option>
                    <option className='text-black' value="Gerli">Gerli</option>
                    <option className='text-black' value="Wilde">Wilde</option>
                    <option className='text-black' value="Lanus">Lanus</option>
                  </select>
                </div>
                }    
              <hr />
              <ul className="my-3 text-gray-500 w-full">
                <li className="flex justify-between">
                  <p>Subtotal</p>
                  <span>${totalPricing().toLocaleString("es-AR")}</span>
                </li>
                <li className="flex justify-between">
                  <p>Descuento</p>
                  <span>${salePricing.toLocaleString("es-AR")}</span>
                </li>
                <li className="flex justify-between">
                  <p>Delivery</p>
                  <span>${deliveryPricing.toLocaleString("es-AR")}</span>
                </li>
                <li className="flex justify-between mt-10 text-xl mb-5 font-bold text-tertiary">
                  <h4>Total</h4>
                  {totalPricingCart === null ? <p>Calculando...</p> : <p>${totalPricingCart.toLocaleString("es-AR")}</p>}
                </li>
                <h5 className="text-white text-lg font-semibold">Instrucciones</h5>
                <hr />
                <textarea onChange={(e) => setInstructions(e.target.value)} className="bg-white rounded-xl px-3 py-1 text-black font-semibold my-5 w-full h-52"></textarea>
                  <button onClick={handleContinue} className="bg-tertiary w-full py-2 cursor-pointer rounded-xl text-black font-bold text-lg">
                    Continuar
                  </button>
              </ul>
            </section>
  );
}
