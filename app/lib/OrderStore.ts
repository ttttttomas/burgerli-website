export const ORDER_KEY = "burgerli_order_id";

export function saveOrderId(id?: string) {
  if (typeof window === "undefined") return;
  if (!id) {
    console.log("id_order no encontrado, limpiando");
    return;
  };
  console.log("guardando id_order:", id);
  localStorage.setItem(ORDER_KEY, id);
}

export function getOrderId() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ORDER_KEY);
}

export function clearOrderId() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ORDER_KEY);
}
