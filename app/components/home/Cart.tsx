"use client";
import Ubicacion from "../icons/Ubicacion";

import { useRouter } from "next/navigation";
import Cupon from "../Cupon";
import { useEffect, useState } from "react";
import { Inter, Pattaya } from "next/font/google";
import CartResponsive from "../CartResponsive";
import { useCart } from "@/app/context/CartContext";
import { CartProduct } from "@/types";

import { saveCheckoutDraft } from "@/app/lib/checkoutStorage";
import checkIsOpen from "@/app/lib/CheckShopOpen";
import { useSession } from "@/app/context/SessionContext";
import { toast } from "sonner";
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

export default function Cart() {
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
  const [sucursal, setSucursal] = useState<string>("");
  const [isTakeAwayChecked, setIsTakeAwayChecked] = useState(true);
  const [mode, setMode] = useState<"pickup" | "delivery">("pickup");
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [deliveryPricing, setDeliveryPricing] = useState(500);
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

      const user = (await userById(session.user_id_user_client)) as any;

      setAddresses(user?.[0].addresses);
    };
    getUser();
  }, [userById, session]);

  useEffect(() => {
    if (mode === "pickup") {
      setDeliveryPricing(0);
    } else {
      setDeliveryPricing(500);
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

    if (!sucursal) {
      toast.error("Seleccione su sucursal CERCANA para poder continuar");
      return;
    }

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
    <>
      <div className="md:hidden fixed inset-x-0 bottom-0 z-40 px-4 pb-4 pointer-events-none">
        {cartProducts.length > 0 && (
          <div className="w-full">
            <button
              onClick={() => {
                setOpen(true);
              }}
              className="pointer-events-auto cursor-pointer w-full bg-[#c77a1a] text-black rounded-2xl shadow-2xl px-4 py-4 flex items-center justify-between text-base font-semibold"
            >
              <span className="flex items-center gap-3">
                Ver pedido ({cartProducts.length})
              </span>
              <span className="flex items-center gap-2">
                ${totalPricing().toLocaleString("es-AR")}
              </span>
            </button>
          </div>
        )}
      </div>
      {open && <CartResponsive closed={() => setOpen(false)} />}

      <section
        className={`${inter.className} w-[450px] md:block hidden pt-28 h-min cart text-white rounded-2xl bg-primary py-3 px-5`}
      >
        <h2 className={`${pattaya.className} text-2xl`}>Mi pedido</h2>
        <ul className="flex mt-6 flex-col gap-2">
          {cartProducts.length > 0 ? (
            cartProducts.map((product: CartProduct) => (
              <li
                key={product.price}
                className="flex justify-between items-start"
              >
                <div className="flex flex-col items-start gap-1">
                  <p className="font-bold">{product.name}</p>
                  {/* <small>Extras: {product.extras.join(", ")}</small> */}
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
            ))
          ) : (
            <p>No hay productos seleccionados aún.</p>
          )}
          {cartProducts.length > 0 && <hr className="font-bold" />}
        </ul>
        <h3 className="mt-4 font-semibold">Cupon de descuento</h3>
        <Cupon />
        <hr />
        <ul className="flex my-3 justify-between items-center">
          <li className="flex gap-2">
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
            <p className="text-lg">Delivery</p>
          </li>
          <li className="flex gap-2">
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
            <p className="text-lg">Retiro en el local</p>
          </li>
        </ul>
        {mode === "delivery" && (
          <>
            <p className="text-start font-bold text-lg">
              Seleccioná tu sucursal mas cercana <small>(Obligatorio)</small>
            </p>
            <select
              value={sucursal}
              onChange={(e) => setSucursal(e.target.value)}
              className="w-full border-2 my-2 p-2 border-tertiary rounded-xl"
            >
              <option value="" disabled>
                Seleccionar sucursal
              </option>
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
                <option value="" disabled>
                No hay sucursales abiertas
              </option>
              )}
            </select>
            <p className="text-start font-bold text-lg my-4">
              Indicá la dirección de entrega
            </p>
            <div className="flex flex-col gap-2">
              {!addresses?.length ? (
                <>
                  <p>No tienes direcciones guardadas en tu perfil.</p>
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
                </>
              ) : (
                addresses.map((address) => (
                  <div
                    key={address}
                    className="flex pb-5 justify-between items-center"
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
              value={sucursal}
              onChange={(e) => setSucursal(e.target.value)}
              className="w-full border-2 my-2 p-2 border-tertiary rounded-xl"
            >
              <option value="" disabled>
                Seleccionar sucursal
              </option>
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
                <option value="" disabled>
                No hay sucursales abiertas
              </option>
              )}
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
    </>
  );
}
