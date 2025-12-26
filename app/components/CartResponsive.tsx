"use client";
import Ubicacion from "./icons/Ubicacion";

import Cupon from "./Cupon";
import { useEffect, useState } from "react";
import { Inter, Pattaya } from "next/font/google";
import { useCart } from "@/app/context/CartContext";
import { CartProduct } from "@/types";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";

import { saveCheckoutDraft } from "@/app/lib/checkoutStorage";
import { toast } from "sonner";
import checkIsOpen from "../lib/CheckShopOpen";
import { useSession } from "../context/SessionContext";
import useProducts from "@/app/hooks/useProducts";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const pattaya = Pattaya({
  weight: ["400"],
  variable: "--font-pattaya",
  subsets: ["latin"],
});

interface Local {
  id_local: string;
  is_open: number;
  name: string;
  locals: string[];
}
export default function CartResponsive({ closed }: { closed: () => void }) {
  const { session, userById } = useSession();
  const router = useRouter();
  // MODAL
  const [open, setOpen] = useState(false);
  const { getLocals } = useProducts();
  // DELIVERY STATES
  const [addresses, setAddresses] = useState<[]>([]);
  const [addressInput, setAddressInput] = useState("");
  const [instructions, setInstructions] = useState("");
  const [isDeliveryChecked, setIsDeliveryChecked] = useState(false);
  const [sucursal, setSucursal] = useState<string>("Gerli");
  const [isTakeAwayChecked, setIsTakeAwayChecked] = useState(true);
  const [mode, setMode] = useState<"pickup" | "delivery">("pickup");
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [deliveryPricing, setDeliveryPricing] = useState(1000);
  const [locals, setLocals] = useState<Local[] | null>(null);

  // TOTAL STATES
  const [salePricing] = useState(0);
  const [totalPricingCart, setTotalPricingCart] = useState<number | null>(null);
  const {
    cartProducts,
    removeFromCart,
    addQuantity,
    removeQuantity,
    totalPricing,
  } = useCart();

  const handleAddressInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddressInput(e.target.value);
  };

  useEffect(() => {
    const getLocalsData = async () => {
      const data = await getLocals();
      const dataFiltered = data.locals.filter(
        (local: Local) => local.is_open === 1
      );
      setLocals(dataFiltered);
    };
    getLocalsData();
  }, []);

  useEffect(() => {
    const getUser = async () => {
      if (!session) return;
      console.log(session);

      const user = (await userById(session.user_id_user_client)) as any;
      console.log(user);

      setAddresses(user?.[0].addresses);
    };
    getUser();
  }, [userById, session]);

  useEffect(() => {
    if (mode === "pickup") {
      setDeliveryPricing(0);
    } else {
      setDeliveryPricing(1000);
    }
  }, [mode, selectedAddress]);

  useEffect(() => {
    setTotalPricingCart(
      totalPricing() + salePricing + deliveryPricing - salePricing
    );
  }, [deliveryPricing, totalPricing, salePricing]);

  const handleModeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMode(e.target.value as "delivery" | "pickup");
  };

  const subTotal = totalPricing();

  // const selectedAddressFind = useMemo(
  //   () => addresses.find((a) => a.address === selectedAddress) ?? null,
  //   [addresses, selectedAddress]
  // );

  const handleContinue = async () => {
    const draft = {
      takeaway: isTakeAwayChecked,
      products: cartProducts,
      delivery_mode: mode,
      fries: cartProducts
        .filter((p: any) => (p.fries?.length ?? 0) > 0)
        .map((p: any) => p.fries)
        .flat(),
      address: selectedAddress || addressInput || null,
      price: totalPricingCart,
      deliveryPrice: deliveryPricing,
      salePricing,
      subTotal,
      sin: cartProducts
        .filter((p: any) => (p.sin?.length ?? 0) > 0)
        .map((p: any) => p.sin)
        .flat(),
      // extras: cartProducts.filter((p: any) => (p.extras?.length ?? 0) > 0).map((p: any) => p.extras).flat(),
      // cupon: cupon,
      local: sucursal,
      order_notes: instructions,
    };

    if (!checkIsOpen()) {
      toast.error("El tiempo de apertura de la tienda no es válido");
      return;
    }

    if (cartProducts.length === 0) {
      toast.error("No hay productos en el carrito");
      return;
    }

    if (isTakeAwayChecked) {
      // TakeAway: no necesita dirección
      saveCheckoutDraft(draft);
      router.push("/checkout");
    } else if (isDeliveryChecked) {
      // Delivery: necesita dirección válida
      if (selectedAddress || addressInput) {
        saveCheckoutDraft(draft);
        router.push("/checkout");
      } else {
        toast.error("Por favor, indique una dirección de entrega");
      }
    } else {
      // Si no eligió ni delivery ni takeaway
      toast.error("Por favor, seleccione el modo de entrega");
    }
  };
  return (
    <section
      className={`${inter.className} md:hidden block fixed overflow-y-scroll w-full h-[90vh] right-0 z-50 pt-5 top-0 text-white rounded-2xl bg-primary py-3 px-5`}
    >
      <div>
        <h2 className={`${pattaya.className} text-2xl`}>Mi pedido</h2>
        <button
          onClick={closed}
          className="absolute cursor-pointer right-3 top-2 p-2 rounded-full bg-black/20"
          aria-label="Cerrar"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
      <ul className="flex mt-6 flex-col gap-2">
        {cartProducts.map((product: CartProduct) => (
          <li key={product.price} className="flex justify-between items-start">
            <div className="flex flex-col items-start gap-1">
              <p className="font-bold">{product.name}</p>
              {product.sin && <small>Sin: {product.sin.join(", ")}</small>}
              {product.size && <small>Tamaño: {product.size}</small>}
              {product.fries && <small>Papas: {product.fries}</small>}
              <button
                onClick={() => removeFromCart(product)}
                className="underline cursor-pointer text-sm"
              >
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
                  className="cursor-pointer"
                >
                  {" "}
                  -{" "}
                </button>
                <span className="text-tertiary font-bold">
                  {product.quantity}
                </span>
                <button
                  onClick={() => addQuantity(product)}
                  className="cursor-pointer"
                >
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
      <ul className="flex my-3 justify-between items-center">
        <li>
          <input
            name="pedido"
            type="radio"
            value="delivery"
            checked={mode === "delivery"}
            onChange={handleModeChange}
            onClick={() => {
              setIsTakeAwayChecked(false);
              setIsDeliveryChecked(true);
            }}
          />{" "}
          Delivery
        </li>
        <li>
          <input
            name="pedido"
            type="radio"
            value="pickup"
            checked={mode === "pickup"}
            onChange={handleModeChange}
            onClick={() => {
              setIsDeliveryChecked(false);
              setIsTakeAwayChecked(true);
            }}
          />{" "}
          Retiro en el local
        </li>
      </ul>
      {mode === "delivery" && (
        <>
          <p className="text-start font-bold text-lg">
            Seleccioná tu sucursal mas cercana <small>(Obligatorio)</small>
          </p>
          <select
            onChange={(e) => setSucursal(e.target.value)}
            className="w-full"
          >
            {locals && locals.length > 0 ? (
              locals.map((local: Local) => (
                <option
                  key={local.id_local}
                  className="text-black"
                  value={local.name}
                >
                  {local.name.charAt(0).toUpperCase() + local.name.slice(1)}
                </option>
              ))
            ) : (
              <option>No hay sucursales abiertas</option>
            )}
          </select>
          <div className="flex flex-col gap-5">
            {addresses?.length === 0 && session ? (
              <>
                <p className="my-3">No tienes direcciones guardadas en tu perfil.</p>
                <div>
                  {/* INPUT PARA AGREGAR NUEVA DIRECCION TEMPORARIA  */}
                  <input
                    value={addressInput}
                    onChange={handleAddressInput}
                    placeholder="Indique su direccion"
                    className="w-full rounded-xl py-1 px-2 text-black bg-white"
                    type="text"
                  />
                </div>
              </>
            ) : (
              addresses.map((address) => (
                <div
                  key={address}
                  className="flex py-8 justify-between items-center"
                >
                  <div className="flex gap-3">
                    <Ubicacion fill={"white"} />
                    <div className="flex flex-col justify-center">
                      <p>{address}</p>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="address"
                    className="rounded-xl"
                    checked={selectedAddress === address}
                    onChange={() => setSelectedAddress(address)}
                  />
                </div>
              ))
            )}
          </div>
          {!session && (
            <div className=" py-1 my-3">
              {/* INPUT PARA AGREGAR NUEVA DIRECCION TEMPORARIA  */}
              <input
                value={addressInput}
                onChange={handleAddressInput}
                placeholder="Indique su direccion"
                className="w-full rounded-xl py-1 px-2 text-black bg-white"
                type="text"
              />
            </div>
          )}
        </>
      )}
      {mode === "pickup" && (
        <div>
          <p className="text-start font-bold text-lg my-4">
            Seleccioná la sucursal de retiro
          </p>
          <select
              onChange={(e) => setSucursal(e.target.value)}
              className="w-full"
            >
              {locals && locals.length > 0 ?
              locals.map((local: Local) => (
                <option
                  key={local.id_local}
                  className="text-black"
                  value={local.name}
                > 
                  {local.name.charAt(0).toUpperCase() + local.name.slice(1)}
                </option>
              )) : <option>No hay sucursales abiertas</option>}
            </select>
        </div>
      )}
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
          {totalPricingCart === null ? (
            <p>Calculando...</p>
          ) : (
            <p>${totalPricingCart.toLocaleString("es-AR")}</p>
          )}
        </li>
        <h5 className="text-white text-lg font-semibold">Instrucciones</h5>
        <hr />
        <textarea
          onChange={(e) => setInstructions(e.target.value)}
          className="bg-white rounded-xl px-3 py-1 text-black font-semibold my-5 w-full h-52"
        ></textarea>
        <button
          onClick={handleContinue}
          className="bg-tertiary w-full py-2 cursor-pointer rounded-xl text-black font-bold text-lg"
        >
          Continuar
        </button>
      </ul>
    </section>
  );
}
