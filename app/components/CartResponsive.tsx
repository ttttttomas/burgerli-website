"use client";
import Ubicacion from "./icons/Ubicacion";
import Moto from "./icons/Moto";
import Shop from "./icons/Shop";

import Cupon from "./Cupon";
import { useEffect, useMemo, useState } from "react";
import { Inter, Pattaya } from "next/font/google";
import { useCart } from "@/app/context/CartContext";
import { CartProduct, Coupons } from "@/types";
import {
  X,
  Minus,
  Plus,
  Trash2,
  ChevronDown,
  MapPin,
  NotebookPen,
} from "lucide-react";
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
  const { getLocals, getCoupons } = useProducts();
  // DELIVERY STATES
  const [addresses, setAddresses] = useState<[]>([]);
  const [addressInput, setAddressInput] = useState("");
  const [instructions, setInstructions] = useState("");
  const [isDeliveryChecked, setIsDeliveryChecked] = useState(false);
  const [sucursal, setSucursal] = useState<string>("");
  const [isTakeAwayChecked, setIsTakeAwayChecked] = useState(false);
  const [mode, setMode] = useState<"pickup" | "delivery" | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [deliveryPricing, setDeliveryPricing] = useState(1000);
  const [locals, setLocals] = useState<Local[] | null>(null);
  const [coupons, setCoupons] = useState<Coupons[] | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupons | null>(null);

  // Animation state
  const [isVisible, setIsVisible] = useState(false);

  // TOTAL STATES
  const [totalPricingCart, setTotalPricingCart] = useState<number | null>(null);
  const {
    cartProducts,
    removeFromCart,
    addQuantity,
    removeQuantity,
    totalPricing,
  } = useCart();

  // Trigger entrance animation + lock body scroll
  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true));

    // Lock background scroll
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(closed, 300);
  };

  const handleAddressInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddressInput(e.target.value);
  };

  useEffect(() => {
    const getLocalsData = async () => {
      const data = await getLocals();
      const dataFiltered = data.locals.filter(
        (local: Local) => local.is_open === 1,
      );
      setLocals(dataFiltered);
    };
    getLocalsData();
  }, []);

  useEffect(() => {
    const getUser = async () => {
      if (!session) return;

      const user = (await userById(session.user_id_user_client)) as any;
      const couponsData = await getCoupons();
      setCoupons(couponsData);
      setAddresses(user?.[0].addresses);
    };
    getUser();
  }, [userById, session]);

  useEffect(() => {
    if (mode === "pickup" || mode === null) {
      setDeliveryPricing(0);
    } else {
      setDeliveryPricing(1000);
    }
  }, [mode, selectedAddress]);

  // Calcula el descuento segun el tipo de cupon
  const subTotal = totalPricing();
  const couponDiscount = useMemo(() => {
    if (!appliedCoupon || !appliedCoupon.amount) return 0;

    // type null o "amount" => descuento de monto fijo
    if (!appliedCoupon.type || appliedCoupon.type === "amount") {
      return appliedCoupon.amount;
    }

    // type "porcent" => descuento porcentual (con tope opcional)
    if (appliedCoupon.type === "porcent") {
      const discount = (subTotal * appliedCoupon.amount) / 100;
      if (appliedCoupon.tope && appliedCoupon.tope > 0) {
        return Math.min(discount, appliedCoupon.tope);
      }
      return discount;
    }

    return 0;
  }, [appliedCoupon, subTotal]);

  useEffect(() => {
    setTotalPricingCart(totalPricing() + deliveryPricing - couponDiscount);
  }, [deliveryPricing, totalPricing, couponDiscount]);

  const handleModeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMode(e.target.value as "delivery" | "pickup");
  };

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
      couponAmount: couponDiscount,
      subTotal,
      sin: cartProducts
        .filter((p: any) => (p.sin?.length ?? 0) > 0)
        .map((p: any) => p.sin)
        .flat(),
      coupon: appliedCoupon?.name ?? null,
      coupon_amount: couponDiscount ?? null,
      local: sucursal,
      order_notes: instructions,
    };

    if (!mode) {
      toast.error("Seleccione un modo de entrega");
      return;
    }

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
      {/* Backdrop overlay */}
      <div
        onClick={handleClose}
        className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        style={{
          opacity: isVisible ? 1 : 0,
          transition: "opacity 300ms ease-out",
        }}
      />

      {/* Cart panel */}
      <section
        className={`${inter.className} md:hidden block fixed w-full h-[95vh] right-0 z-50 bottom-0 text-white rounded-t-3xl`}
        style={{
          background:
            "linear-gradient(165deg, #4e3019 0%, #3a2010 40%, #2a1508 100%)",
          transform: isVisible ? "translateY(0)" : "translateY(100%)",
          transition: "transform 350ms cubic-bezier(0.32, 0.72, 0, 1)",
        }}>
        {/* Drag indicator */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-white/30" />
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto h-[calc(92vh-140px)] px-5 pb-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <h2
              className={`${pattaya.className} text-2xl bg-gradient-to-r from-[#EA951B] to-[#FFE936] bg-clip-text text-transparent`}>
              Mi pedido
            </h2>
            <button
              onClick={handleClose}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 active:bg-white/20 active:scale-95 transition-all cursor-pointer"
              aria-label="Cerrar">
              <X className="w-5 h-5 text-white/80" />
            </button>
          </div>

          {/* Products list */}
          <ul className="flex flex-col gap-3">
            {cartProducts.map((product: CartProduct, index: number) => (
              <li
                key={product.price}
                className="rounded-2xl p-4 flex justify-between items-start"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  backdropFilter: "blur(10px)",
                  animationDelay: `${index * 60}ms`,
                }}>
                <div className="flex flex-col items-start gap-1.5 flex-1 min-w-0 pr-3">
                  <p className="font-bold text-[15px] leading-snug">
                    {product.name}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {/* {product.sin && (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/20">
                        Sin: {product.sin.join(", ")}
                      </span>
                    )} */}
                    {product.size && (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-tertiary/20 text-tertiary border border-tertiary/20">
                        Tamaño: {product.size}
                      </span>
                    )}
                    {product.fries && (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-secondary/20 text-secondary border border-secondary/20">
                        Papas: {product.fries}
                      </span>
                    )}
                    {product.selectedOptions &&
                      product.selectedOptions.length > 0 && (
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/20">
                          Opcion: {product.selectedOptions.join(", ")}
                        </span>
                      )}
                  </div>
                  <button
                    onClick={() => removeFromCart(product)}
                    className="flex items-center gap-1 text-red-400/80 text-xs mt-1 active:text-red-300 transition-colors cursor-pointer">
                    <Trash2 className="w-3 h-3" />
                    Eliminar
                  </button>
                </div>
                <div className="flex flex-col gap-2.5 items-end shrink-0">
                  <span className="font-bold text-tertiary text-[15px]">
                    ${product.price.toLocaleString("es-AR")}
                  </span>
                  <div
                    className="flex items-center gap-0 rounded-xl overflow-hidden"
                    style={{
                      background: "rgba(255,255,255,0.1)",
                      border: "1px solid rgba(255,255,255,0.12)",
                    }}>
                    <button
                      onClick={() => removeQuantity(product)}
                      className="w-8 h-8 flex items-center justify-center active:bg-white/10 transition-colors cursor-pointer">
                      <Minus className="w-3.5 h-3.5 text-white/70" />
                    </button>
                    <span className="w-8 h-8 flex items-center justify-center text-tertiary font-bold text-sm bg-white/5">
                      {product.quantity}
                    </span>
                    <button
                      onClick={() => addQuantity(product)}
                      className="w-8 h-8 flex items-center justify-center active:bg-white/10 transition-colors cursor-pointer">
                      <Plus className="w-3.5 h-3.5 text-white/70" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {/* Coupon section */}
          <div className="mt-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm">🏷️</span>
              <h3 className="text-sm font-semibold text-white/80">
                Cupón de descuento
              </h3>
            </div>
            <Cupon
              coupons={coupons}
              setAppliedCoupon={setAppliedCoupon}
              products={cartProducts}
            />
          </div>

          {/* Divider */}
          <div className="my-5 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

          {/* Delivery mode selector */}
          <div className="flex flex-col gap-4">
            <p className="text-lg font-bold text-center text-white/90">
              ¿Cómo lo querés?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setMode("delivery");
                  setIsDeliveryChecked(true);
                  setIsTakeAwayChecked(false);
                }}
                className="flex-1 flex flex-col items-center justify-center gap-2 p-4 rounded-2xl transition-all duration-300 cursor-pointer active:scale-[0.97]"
                style={{
                  background:
                    mode === "delivery"
                      ? "linear-gradient(135deg, #EA951B 0%, #c77a1a 100%)"
                      : "rgba(255,255,255,0.06)",
                  border:
                    mode === "delivery"
                      ? "1.5px solid rgba(234,149,27,0.6)"
                      : "1.5px solid rgba(255,255,255,0.1)",
                  boxShadow:
                    mode === "delivery"
                      ? "0 8px 24px rgba(234,149,27,0.3), inset 0 1px 0 rgba(255,255,255,0.2)"
                      : "none",
                }}>
                <Moto
                  className={`w-7 h-7 transition-colors duration-300 ${mode === "delivery" ? "text-white" : "text-white/50"}`}
                />
                <span
                  className={`text-sm font-bold transition-colors duration-300 ${mode === "delivery" ? "text-white" : "text-white/60"}`}>
                  Delivery
                </span>
              </button>
              <button
                onClick={() => {
                  setMode("pickup");
                  setIsDeliveryChecked(false);
                  setIsTakeAwayChecked(true);
                }}
                className="flex-1 flex flex-col items-center justify-center gap-2 p-4 rounded-2xl transition-all duration-300 cursor-pointer active:scale-[0.97]"
                style={{
                  background:
                    mode === "pickup"
                      ? "linear-gradient(135deg, #EA951B 0%, #c77a1a 100%)"
                      : "rgba(255,255,255,0.06)",
                  border:
                    mode === "pickup"
                      ? "1.5px solid rgba(234,149,27,0.6)"
                      : "1.5px solid rgba(255,255,255,0.1)",
                  boxShadow:
                    mode === "pickup"
                      ? "0 8px 24px rgba(234,149,27,0.3), inset 0 1px 0 rgba(255,255,255,0.2)"
                      : "none",
                }}>
                <Shop
                  className={`w-7 h-7 transition-colors duration-300 ${mode === "pickup" ? "text-white" : "text-white/50"}`}
                />
                <span
                  className={`text-sm font-bold transition-colors duration-300 ${mode === "pickup" ? "text-white" : "text-white/60"}`}>
                  Retiro en local
                </span>
              </button>
            </div>
          </div>

          {/* Delivery details */}
          {mode === "delivery" && (
            <div
              className="mt-4 rounded-2xl p-4"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}>
              <p className="text-sm font-bold text-white/90 mb-2">
                Sucursal más cercana{" "}
                <span className="text-tertiary text-xs">(Obligatorio)</span>
              </p>
              <div className="relative">
                <select
                  value={sucursal}
                  onChange={(e) => setSucursal(e.target.value)}
                  className="w-full appearance-none rounded-xl py-2.5 px-3 pr-10 text-sm bg-white/10 border border-white/15 text-white focus:outline-none focus:border-tertiary/50 transition-colors">
                  <option value="" disabled className="text-black">
                    Seleccionar sucursal
                  </option>
                  {locals && locals.length > 0 ? (
                    locals.map((local: Local) => (
                      <option
                        key={local.id_local}
                        className="text-black"
                        value={local.name}>
                        {local.name.charAt(0).toUpperCase() +
                          local.name.slice(1)}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled className="text-black">
                      No hay sucursales abiertas
                    </option>
                  )}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
              </div>

              <div className="mt-4">
                <p className="text-sm font-bold text-white/90 mb-2">
                  Dirección de entrega
                </p>
                <div className="flex flex-col gap-2">
                  {!addresses?.length ? (
                    <>
                      <p className="text-xs text-white/50 mb-1">
                        No tenés direcciones guardadas.
                      </p>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                        <input
                          value={addressInput}
                          onChange={handleAddressInput}
                          placeholder="Ingresá tu dirección"
                          className="w-full rounded-xl py-2.5 pl-9 pr-3 text-sm bg-white/10 border border-white/15 text-white placeholder:text-white/30 focus:outline-none focus:border-tertiary/50 transition-colors"
                          type="text"
                        />
                      </div>
                    </>
                  ) : (
                    addresses.map((address) => (
                      <label
                        key={address}
                        className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                          selectedAddress === address
                            ? "bg-tertiary/15 border border-tertiary/30"
                            : "bg-white/5 border border-white/10"
                        }`}>
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                            selectedAddress === address
                              ? "border-tertiary bg-tertiary"
                              : "border-white/30"
                          }`}>
                          {selectedAddress === address && (
                            <div className="w-2 h-2 rounded-full bg-white" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 min-w-0">
                          <MapPin className="w-4 h-4 text-white/40 shrink-0" />
                          <p className="text-sm truncate">{address}</p>
                        </div>
                        <input
                          type="radio"
                          name="address"
                          className="sr-only"
                          checked={selectedAddress === address}
                          onChange={() => setSelectedAddress(address)}
                        />
                      </label>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Pickup details */}
          {mode === "pickup" && (
            <div
              className="mt-4 rounded-2xl p-4"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}>
              <p className="text-sm font-bold text-white/90 mb-2">
                Sucursal de retiro
              </p>
              <div className="relative">
                <select
                  value={sucursal}
                  onChange={(e) => setSucursal(e.target.value)}
                  className="w-full appearance-none rounded-xl py-2.5 px-3 pr-10 text-sm bg-white/10 border border-white/15 text-white focus:outline-none focus:border-tertiary/50 transition-colors">
                  <option value="" disabled className="text-black">
                    Seleccionar sucursal
                  </option>
                  {locals && locals.length > 0 ? (
                    locals.map((local: Local) => (
                      <option
                        key={local.id_local}
                        className="text-black"
                        value={local.name}>
                        {local.name.charAt(0).toUpperCase() +
                          local.name.slice(1)}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled className="text-black">
                      No hay sucursales abiertas
                    </option>
                  )}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
              </div>
            </div>
          )}

          {/* Divider */}
          <div className="my-5 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

          {/* Price breakdown */}
          <div
            className="rounded-2xl p-4"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}>
            <div className="flex flex-col gap-2.5 text-sm">
              <div className="flex justify-between text-white/50">
                <span>Subtotal</span>
                <span>${totalPricing().toLocaleString("es-AR")}</span>
              </div>
              <div className="flex justify-between text-white/50">
                <span>
                  Descuento
                  {appliedCoupon?.type === "porcent"
                    ? ` (${appliedCoupon.amount}%)`
                    : ""}
                </span>
                <span className={couponDiscount > 0 ? "text-green-400" : ""}>
                  {couponDiscount > 0 ? "-" : ""}$
                  {couponDiscount.toLocaleString("es-AR")}
                </span>
              </div>
              <div className="flex justify-between text-white/50">
                <span>Delivery</span>
                <span>${deliveryPricing.toLocaleString("es-AR")}</span>
              </div>
              <div className="h-px bg-white/10 my-1" />
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-white">Total</span>
                {totalPricingCart === null ? (
                  <span className="text-white/60">Calculando...</span>
                ) : (
                  <span className="text-xl font-bold bg-gradient-to-r from-[#EA951B] to-[#FFE936] bg-clip-text text-transparent">
                    ${totalPricingCart.toLocaleString("es-AR")}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-5 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <NotebookPen className="w-4 h-4 text-white/50" />
              <h5 className="text-sm font-semibold text-white/80">
                Instrucciones
              </h5>
            </div>
            <textarea
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Sin cebolla, extra ketchup, etc..."
              className="w-full h-28 rounded-xl px-3 py-2.5 text-sm bg-white/10 border border-white/15 text-white placeholder:text-white/30 focus:outline-none focus:border-tertiary/50 transition-colors resize-none"
            />
          </div>
        </div>

        {/* Fixed bottom CTA */}
        <div
          className="absolute bottom-0 left-0 right-0 px-5 pb-6 pt-4"
          style={{
            background: "linear-gradient(to top, #2a1508 60%, transparent)",
          }}>
          <button
            onClick={handleContinue}
            className="w-full py-3.5 rounded-2xl font-bold text-base cursor-pointer active:scale-[0.98] transition-all duration-200"
            style={{
              background: "linear-gradient(135deg, #EA951B 0%, #d4850f 100%)",
              boxShadow:
                "0 8px 30px rgba(234,149,27,0.4), inset 0 1px 0 rgba(255,255,255,0.25)",
              color: "#1a0e05",
            }}>
            Continuar al pago
          </button>
        </div>
      </section>
    </>
  );
}
