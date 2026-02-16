"use client";
import { useState } from "react";
import { CartProduct, Coupons } from "@/types";
import { toast } from "sonner";
import useAuth from "../hooks/useAuth";
import { useSession } from "@/app/context/SessionContext";

export default function Cupon({
  coupons,
  setAppliedCoupon,
  products,
}: {
  coupons: Coupons[] | null;
  setAppliedCoupon: (coupon: Coupons | null) => void;
  products: CartProduct[];
}) {
  const { getUserById } = useAuth();
  const { session } = useSession();
  const [coupon, setCoupon] = useState("");

  const submitCoupon = async () => {
    const userFound = await getUserById(session?.user_id_user_client ?? "");

    if (products.length === 0) {
      toast.error("No hay productos en el carrito");
      return;
    }
    if (userFound?.data[0].used_coupons?.includes(coupon)) {
      toast.error("Ya usaste este cupon");
      return;
    }
    const couponFound = coupons?.find((c) => c.name === coupon);

    if (couponFound) {
      if (
        products.find(
          (p) =>
            p.name.toLowerCase().includes("promo") ||
            p.name.toLowerCase().includes("combo") ||
            (p.selectedOptions && p.selectedOptions.length > 0),
        )
      ) {
        toast.error("Los cupones no son validos para promociones");
        return;
      } else {
        toast.success("Cupon aplicado");
        setCoupon("");
        setAppliedCoupon(couponFound);
      }
    } else {
      toast.error("Cupon no encontrado");
      setCoupon("");
      setAppliedCoupon(null);
    }
  };
  return (
    <div className="flex bg-white rounded-xl py-1 my-2">
      <input
        value={coupon}
        onChange={(e) => setCoupon(e.target.value)}
        className="w-full px-2 text-black rounded-xl"
        type="text"
      />
      <button
        onClick={submitCoupon}
        className="text-black font-semibold px-2 cursor-pointer">
        Aplicar
      </button>
    </div>
  );
}
