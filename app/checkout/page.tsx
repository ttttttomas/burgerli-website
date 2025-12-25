"use client";
import { Pattaya } from "next/font/google";
import Ubicacion from "../components/icons/Ubicacion";
import { Orders } from "@/types";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { loadCheckoutDraft } from "@/app/lib/checkoutStorage";
import Moto from "../components/icons/Moto";
import { useSession } from "../context/SessionContext";
import { toast } from "sonner";
import useProducts from "@/app/hooks/useProducts";

// const url = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

const pattaya = Pattaya({
  weight: ["400"],
  variable: "--font-pattaya",
  subsets: ["latin"],
});

export default function CheckoutPage() {
  const { createOrder } = useProducts();
  const { session } = useSession();
  const router = useRouter();
  const [draft, setDraft] = useState<Orders | any>(null);
  const [cashLoading, setCashLoading] = useState(false);
  // const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<Orders>({
    payment_method: "",
    id_user_client: session?.user_id_user_client || "",
    delivery_mode: "",
    price: 0,
    status: "Confirmado",
    order_notes: "",
    local: "",
    name: "",
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
        name: session.username || "",
        email: session.email || "",
        phone: session.phone || "",
        id_user_client: session.user_id_user_client || "",
      }));
      console.log("orden actualizada", session);
    }
  }, [session]);

  // useEffect para rellenar el estado order con los datos del draft cuando esté disponible
  useEffect(() => {
    if (draft) {
      setOrder({
        // id_order: id,
        id_user_client: session?.user_id_user_client || "",
        payment_method: draft.payment_method || "efete",
        delivery_mode: draft.delivery_mode,
        price: draft.price,
        status: "Confirmado",
        order_notes: draft.order_notes || null,
        local: draft.local,
        name: draft.name,
        phone: draft.phone,
        email: draft.email,
        address: draft.address || null,
        coupon: draft.coupon || null,
        products: draft.products,
      });
    }
  }, [draft, session]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    console.log("💳 [Checkout] Iniciando pago con MercadoPago");
    console.log("💳 [Checkout] Order data:", order);
    
    if (order.name && order.email && order.phone) {
      try {
        // Solo crear la preferencia de MercadoPago
        // La orden se creará en el webhook cuando el pago sea aprobado
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
                unit_price: Number(draft.price),
                currency_id: "ARS",
                description: "Sin descripción",
              },
            ],
          }),
        });
        const data = await res.json();
        console.log("✅ [Checkout] Preferencia creada:", data);

        if (data.init_point) {
          console.log("🔄 [Checkout] Redirigiendo a MercadoPago...");
          // Limpiar el draft antes de redirigir
          localStorage.removeItem("checkoutDraft:v1");
          router.push(data.init_point);
        } else {
          console.error("❌ [Checkout] No se recibió init_point");
          toast.error("Error al crear la preferencia de pago");
        }
      } catch (error) {
        console.error("❌ [Checkout] Error al crear preferencia:", error);
        toast.error("Error al procesar el pago. Intenta nuevamente.");
      }
    } else {
      toast.error("Por favor, rellene todos los campos obligatorios");
    }
  };

  const handleCashPayment = async () => {
    console.log("order a enviar:", order);

    // Validar que los campos obligatorios estén completos
    if (!order.name || !order.email || !order.phone) {
      toast.error("Por favor, rellene todos los campos obligatorios");
      return;
    }

    setCashLoading(true);

    try {
      const newOrder = {
        payment_method: "Efectivo",
        user_client_id: session?.user_id_user_client || null,
        delivery_mode: order.delivery_mode || draft.delivery_mode,
        price: order.price || draft.price,
        status: "Confirmado",
        order_notes: order.order_notes || draft.order_notes || "",
        local: order.local || draft.local,
        fries: draft.fries || "",
        drinks: draft.drinks || "",
        name: order.name,
        phone: Number(order.phone),
        email: order.email,
        address: order.address || draft.address || "",
        coupon: order.coupon || draft.coupon || null,
        products: (order.products || draft.products).map((p: any) =>
          JSON.stringify(p),
        ),
      };
      console.log(newOrder);
      

      const createdOrder = await createOrder(newOrder);
      // Limpiar el draft del localStorage
      localStorage.removeItem("checkoutDraft:v1");
      toast.success("¡Orden creada exitosamente!");
      // Obtener el ID de la orden creada
      const orderId = createdOrder?.id_order || createdOrder?.id || createdOrder?.order_id;
      // Si hay sesión y tenemos un ID de orden, redirigir a la página de orden
      if (session) {
        toast.success("Redirigiendo a seguimiento de envio...");
        setTimeout(() => {
          router.push(`/order/${orderId}`);
        }, 3000);
      } else {
        // Si no hay sesión, redirigir a la página de confirmación en efectivo
        router.push("/cash-success");
      }
    } catch (error) {
      console.error("Error al crear orden:", error);
      toast.error("Error al crear la orden. Intenta nuevamente.");
    } finally {
      setCashLoading(false);
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
            {draft.delivery_mode === "pickup" ? (
              "Retiro en el local"
            ) : (
              <div className="flex flex-col justify-center">
                <p>Delivery</p>
                <small>Sucursal del pedido: {draft.local}</small>
              </div>
            )}
          </li>
          <li>
            <div className="flex justify-between pb-2 items-center">
              <div className="flex gap-3">
                {draft.delivery_mode === "delivery" && (
                  <>
                    <Ubicacion fill="black" />
                    <div className="flex flex-col justify-center">
                      <p>{draft.address}</p>
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
            Correo electrónico
            <small className="text-orange-500 font-bold text-lg">*</small>
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
            Teléfono
            <small className="text-orange-500 font-bold text-lg">*</small>
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
      <div className="md:w-1/2 w-full flex flex-col items-start justify-center gap-8">
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
            <p>{draft.coupon?.toLocaleString("es-AR") ?? "-"}</p>
          </li>
          <hr />
          <li className="flex items-center justify-between gap-3">
            <p>Total</p>
            <p>${draft.price.toLocaleString("es-AR")}</p>
          </li>
        </ul>
        <div className="flex flex-col mx-auto items-center justify-center gap-8">
          <div onClick={handleClick}>
            <img
              src="mercadopago.png"
              className="mx-auto cursor-pointer"
              alt="Image Efectivo"
            />
          </div>
          <div onClick={handleCashPayment}>
            {cashLoading ? (
              <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
                <p className="text-sm text-gray-600">Procesando orden...</p>
              </div>
            ) : (
              <img
                src="efectivo.png"
                className="mx-auto cursor-pointer"
                alt="Image Efectivo"
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
