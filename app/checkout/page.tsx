"use client";
import { Pattaya } from "next/font/google";
import Ubicacion from "../components/icons/Ubicacion";
import { Orders } from "@/types";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  loadCheckoutDraft,

} from "@/app/lib/checkoutStorage";
import Moto from "../components/icons/Moto";
import { useSession } from "../context/SessionContext";
import { toast } from "sonner";

// const url = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

const pattaya = Pattaya({
  weight: ["400"],
  variable: "--font-pattaya",
  subsets: ["latin"],
});

export default function CheckoutPage() {
  const { session } = useSession();
  const ORDER_KEY = "burgerli_order_id";
  const id = crypto.randomUUID();
  const router = useRouter();
  const [draft, setDraft] = useState<any>(null);
  // const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<Orders>({
    id_order: id,
    payment_method: "",
    delivery_mode: "",
    price: 0,
    status: "Confirmado",
    order_notes: "",
    local: "",
    name:  "",
    phone: 0,
    email: "",
    address: "",
    coupon: "",
    products: [],
  });

  useEffect(() => {
    if (session) {
      setOrder((prev: any) => ({
        ...prev,
        name: session.username, //
        email: session.user_id, // ESTO HAY QUE CAMBIARLO POR DATOS DEL USUARIO || null (GETUSERBYID)
        phone: session.user_id, // 
      }));
      console.log("orden actualizada", session);
    }
  }, [session]);

  // useEffect para rellenar el estado order con los datos del draft cuando esté disponible
  useEffect(() => {
    console.log("guardando id_order:", id);
    localStorage.setItem(ORDER_KEY, id);
    console.log("id_order guardado en localStorage:", id);
    if (draft) {
      setOrder({
        id_order: id,
        payment_method: draft.payment_method || "efete",
        delivery_mode: draft.delivery_mode || null,
        price: draft.price || null,
        status: "Confirmado",
        order_notes: draft.order_notes || null,
        local: draft.local || null,
        name:  draft.name ||null,
        phone: draft.phone || null,
        email: draft.email || null,
        address: draft.address || null,
        coupon: draft.cupon || null,
        products: draft.products,
      });
    }
  }, [draft]);

  const handleChange = (e: any) => {
    setOrder({ ...order, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    const d = loadCheckoutDraft();
    if (!d) {
      router.replace("/");
      return;
    }
    setDraft(d);
    // setLoading(false);

    const onStorage = (e: StorageEvent) => {
      if (e.key === "checkoutDraft:v1") {
        const nd = loadCheckoutDraft();
        setDraft(nd);
        setOrder(nd);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [router]);

  console.log(order);
  

  if (!draft)
    return (
      <main className="h-[60vh] flex justify-center items-center">
        <p className="font-bold text-2xl">Cargando…</p>
      </main>
    );

  const handleClick = async () => {
    console.log("order a enviar:", order);
    if(order.name && order.email && order.phone){
      try {
        const res = await fetch("/api/mercadopago/createPreference", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            order: order,
            items: [
              {
                id: "burgerli-order",
                title: "Compra en Burgerli",
                quantity: 1,
                unit_price: draft.price,
                currency_id: "ARS",
                description: "Sin descripción",
              },
            ],
          }),
        });
        const data = await res.json();
        console.log(data);
        
        if (data.init_point) {
            router.push(data.init_point);
        }
      } catch (error) {
        console.error("Error al realizar el pedido:", error);
      }
    }else{
      toast.error("Por favor, rellene todos los campos obligatorios");
    }
  };

  return (
    <section className="w-full md:h-[60vh] px-10 py-5 flex md:flex-row flex-col gap-20 md:gap-64">
      <div className="md:w-1/2 w-full">
        <h2 className={`${pattaya.className} text-xl mt-6`}>
          Medio de entrega
        </h2>
        <ul className="flex flex-col mt-3 gap-5 font-semibold w-full">
          <li className="flex items-center gap-3">
            {draft.delivery_mode === "pickup" ? (
              <Ubicacion fill="black" />
            ) : (
              <Moto />
            )}
            {draft.delivery_mode === "pickup"
              ? "Retiro en el local"
              : <div className="flex flex-col justify-center">
                      <p>Delivery</p>
                      <small>Sucursal del pedido: {draft.local}</small>
                </div>}
          </li>
          <li>
            <div className="flex justify-between pb-2 items-center">
              <div className="flex gap-3">
                {draft.delivery_mode === "delivery" && (
                  <>
                    <Ubicacion fill="black" />
                    <div className="flex flex-col justify-center">
                      <p>{draft.address.label || draft.address}</p>
                      <small>{draft.address.street}</small>
                    </div>
                  </>
                )}
                {draft.delivery_mode === "pickup" && (
                  <p>Sucursal: {draft.local}</p>
                )}
              </div>
            </div>
            <hr />
          </li>
        </ul>
        <h3 className={`${pattaya.className} text-xl mt-6`}>
          Datos personales
        </h3>
        <div className="flex flex-col gap-5 mt-10">
          <label htmlFor="name" className="font-bold">
            Nombre<small className="text-orange-500 font-bold text-lg">*</small>
          </label>
          <input
            onChange={handleChange}
            name="name"
            type="text"
            id="name"
            value={order.name || ""}
            placeholder="Nombre y apellido"
            className="border-b-2 border-primary/30"
          />
          <label htmlFor="email" className="font-bold">
            Correo electrónico<small className="text-orange-500 font-bold text-lg">*</small>
          </label>
          <input
            onChange={handleChange}
            name="email"
            type="email"
            id="email"
              value={order.email || ""}
            placeholder="email@gmail.com"
            className="border-b-2 border-primary/30"
          />
          <label htmlFor="phone" className="font-bold">
            Teléfono<small className="text-orange-500 font-bold text-lg">*</small>
          </label>
          <input
            onChange={handleChange}
            name="phone"
            type="number"
            id="phone"
            value={order.phone || ""}
            placeholder="123456789"
            className="border-b-2 border-primary/30"
          />
        </div>
      </div>
      <div className="md:w-1/2 w-full">
        <h2 className={`${pattaya.className} text-xl mt-6`}>Mi pago</h2>
        <ul className="flex flex-col mt-3 gap-5 font-semibold w-full">
          <li className="flex items-center text-gray-500 justify-between gap-3">
            <p>Productos</p>
            <p>${draft.subTotal.toLocaleString("es-AR")}</p>
          </li>
          <li className="flex items-center text-gray-500 justify-between gap-3">
            <p>Delivery</p>
            <p>${draft.deliveryPrice.toLocaleString("es-AR")}</p>
          </li>{" "}
          <li className="flex items-center text-gray-500 justify-between gap-3">
            <p>Cupon de descuento</p>
            <p>{draft.cupon?.toLocaleString("es-AR") ?? "-"}</p>
          </li>
          <hr />
          <li className="flex items-center justify-between gap-3">
            <p>Total</p>
            <p>${draft.price.toLocaleString("es-AR")}</p>
          </li>
        </ul>
        <div className="flex flex-col gap-8 mt-10">
          <div onClick={handleClick} className="w-full mx-auto cursor-pointer">
            <svg
              width="100%"
              height="74"
              viewBox="0 0 572 74"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g filter="url(#filter0_d_1042_8859)">
                <rect width="560" height="60" rx="15" fill="#01BCFF" />
                <path
                  d="M159.297 10.073C173.413 9.167 194.665 16.6555 189.887 34.5844C184.46 54.952 140.075 55.1663 133.875 35.052C128.911 18.9384 146.11 10.9173 159.297 10.073Z"
                  fill="#00188E"
                />
                <path
                  d="M149.283 35.6784C149.438 35.8115 149.772 37.4158 150.97 38.0457C151.649 38.403 152.465 38.2114 152.896 38.4322C154.262 39.1401 155.337 39.6694 156.759 40.3514C157.416 40.6664 157.662 41.5757 158.772 41.9134C160.637 42.4784 161.291 41.186 162.382 41.2282C162.852 41.2477 163.474 41.7056 164.085 41.7738C165.374 41.9166 167.543 41.1762 168.829 40.7411C171.043 39.9909 170.567 38.9485 171.043 38.5751C171.15 38.4906 172.345 38.9258 173.595 38.049C174.76 37.2306 174.828 35.7531 174.938 35.6654C175.33 35.3374 178.001 36.198 178.412 33.4344C178.506 32.8142 178.131 32.2362 178.195 31.9212C178.396 30.9307 187.918 28.3295 189.472 28.1607C189.226 42.381 171.105 47.3365 159.511 46.6838C148.836 46.083 134.066 40.5235 134.111 27.8359C135.856 28.0113 145.731 30.6254 146.026 31.9244C146.21 32.733 145.404 33.2331 146.563 34.6685C147.722 36.1038 148.959 35.3991 149.283 35.6751V35.6784Z"
                  fill="#05B9FD"
                />
                <path
                  d="M154.505 19.7211C153.553 21.1889 149.93 23.5855 152.588 25.0501C156.988 27.4726 159.776 21.3286 163.085 21.3221C165.934 21.3188 173.892 30.1387 176.744 31.8241C177.913 33.2562 176.411 35.0001 174.896 34.526C173.847 34.198 170.094 29.7978 169.401 30.4343C169.741 32.1716 176.528 36.1757 172.322 37.4421C169.955 38.1533 168.825 34.5292 166.811 34.0064C165.992 34.9027 171.758 38.5755 168.845 39.462C166.364 40.2154 166.07 36.9907 163.897 36.929L166.16 40.4979C161.272 41.1507 163.797 38.9782 162.563 36.8024C161.861 35.5619 159.947 35.4872 159.743 35.2436C159.582 35.0521 159.682 34.2305 159.442 33.7661C158.261 31.4962 157.312 32.4574 155.7 31.993C154.981 31.7852 154.56 30.5512 153.006 30.444C151.989 30.3726 151.277 31.1 150.84 31.022C150.493 30.9603 150.102 30.4018 149.664 30.2524C148.042 29.7036 147.408 30.7525 146.628 30.6876C146.103 30.6453 142.788 28.8398 141.729 28.4728C139.362 27.6512 136.837 27.2128 134.431 26.5341C134.444 24.4558 138.452 18.2987 140.233 17.9156C140.641 17.8279 146.721 20.1043 148.233 20.3284C150.581 20.6791 152.268 20.5557 154.508 19.7211H154.505Z"
                  fill="#FEFEFE"
                />
                <path
                  d="M189.139 26.8495C185.092 27.7036 181.145 29.0512 177.334 30.6425C175.961 30.5613 167.097 20.7184 163.979 20.1079C159.867 19.3058 157.254 25.4109 153.424 24.2094C153.106 24.1087 152.812 23.8164 152.89 23.456C152.996 22.9656 157.04 19.0493 157.766 18.6011C164.283 14.5808 168.162 19.5851 174.083 20.0527C177.425 20.3157 180.87 19.8156 183.813 18.179C186.416 20.3937 188.886 23.2904 189.139 26.8462V26.8495Z"
                  fill="#FEFEFE"
                />
                <path
                  d="M141.554 17.1162C153.032 8.88401 171.147 9.26396 182.666 17.2818C182.699 18.0287 176.66 19.0906 175.725 19.0743C169.822 18.9704 165.743 14.239 159.271 16.5414C158.125 16.9505 157.027 17.9637 156.134 18.2657C155.24 18.5677 151.07 19.4283 150.134 19.4153C147.447 19.3763 144.193 17.6974 141.554 17.1129V17.1162Z"
                  fill="#05B9FD"
                />
                <path
                  d="M150.299 33.0318C150.805 33.5319 151.135 32.2134 151.659 31.9699C154.492 30.6612 154.376 33.3305 154.835 33.6812C155.146 33.9183 155.91 32.6616 157.335 33.2786C159.132 34.0547 158.122 36.3441 158.39 36.6071C158.588 36.7987 161.512 35.9999 161.903 38.1464C162.476 41.2996 157.406 42.0173 157.419 38.2308C155.826 39.624 153.693 38.8121 153.858 36.6071C151.876 38.1237 149.856 36.2889 150.296 34.0092C147.635 36.3506 145.799 31.8335 148.201 31.4016C150.478 30.9957 150.015 32.746 150.303 33.035L150.299 33.0318Z"
                  fill="#FDFEFE"
                />
              </g>
              <defs>
                <filter
                  id="filter0_d_1042_8859"
                  x="0"
                  y="0"
                  width="572"
                  height="74"
                  filterUnits="userSpaceOnUse"
                  colorInterpolationFilters="sRGB"
                >
                  <feFlood floodOpacity="0" result="BackgroundImageFix" />
                  <feColorMatrix
                    in="SourceAlpha"
                    type="matrix"
                    values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                    result="hardAlpha"
                  />
                  <feOffset dx="6" dy="8" />
                  <feGaussianBlur stdDeviation="3" />
                  <feComposite in2="hardAlpha" operator="out" />
                  <feColorMatrix
                    type="matrix"
                    values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
                  />
                  <feBlend
                    mode="normal"
                    in2="BackgroundImageFix"
                    result="effect1_dropShadow_1042_8859"
                  />
                  <feBlend
                    mode="normal"
                    in="SourceGraphic"
                    in2="effect1_dropShadow_1042_8859"
                    result="shape"
                  />
                </filter>
              </defs>
            </svg>
          </div>

        </div>
      </div>
    </section>
  );
}
