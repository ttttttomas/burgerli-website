"use client";
import { createContext, useContext, useState } from "react";
import { toast } from "sonner";

export const CartContext = createContext();

export const CartContextProvider = ({ children }) => {
  // const [cart, setCart] = useState<Cart>([])
  const [cartProducts, setCartProducts] = useState([]);

  // Helper function to compare if two products are the same
  const isSameProduct = (product1, product2) => {
    return (
      product1.name === product2.name &&
      product1.price === product2.price &&
      product1.size === product2.size &&
      JSON.stringify(product1.sin?.sort()) ===
        JSON.stringify(product2.sin?.sort()) &&
      JSON.stringify(product1.selectedOptions?.sort()) ===
        JSON.stringify(product2.selectedOptions?.sort())
    );
  };

  const addToCart = (item) => {
    const productIndex = cartProducts.findIndex((product) =>
      isSameProduct(product, item),
    );

    // 🟢 Si existe → sumar cantidad
    if (productIndex >= 0) {
      const newCart = structuredClone(cartProducts);
      newCart[productIndex].quantity += 1;
      setCartProducts(newCart);
      return;
    }

    // 🟢 Si NO existe → agregar nuevo
    setCartProducts((prevState) => [
      ...prevState,
      {
        ...item,
        quantity: 1,
      },
    ]);

    toast.success("Producto agregado al carrito");
  };

  const removeFromCart = (item) => {
    setCartProducts((prevState) =>
      prevState.filter((product) => !isSameProduct(product, item)),
    );
    toast.error("Producto eliminado del carrito");
  };
  const addQuantity = (item) => {
    const productIndex = cartProducts.findIndex((product) =>
      isSameProduct(product, item),
    );

    if (productIndex >= 0) {
      const newCart = structuredClone(cartProducts);
      newCart[productIndex].quantity += 1;
      return setCartProducts(newCart);
    }
  };

  const removeQuantity = (item) => {
    const productIndex = cartProducts.findIndex((product) =>
      isSameProduct(product, item),
    );

    if (productIndex >= 0) {
      const product = cartProducts[productIndex];

      // 👇 si la cantidad es 0 o 1, no seguimos
      if (product.quantity <= 1) return;

      const newCart = structuredClone(cartProducts);
      newCart[productIndex].quantity -= 1;
      setCartProducts(newCart);
    }
  };

  const resetCart = () => {
    setCartProducts([]);
  };

  const totalPricing = () => {
    return cartProducts.reduce(
      (total, product) => total + product.price * product.quantity,
      0,
    );
  };

  return (
    <CartContext.Provider
      value={{
        cartProducts,
        setCartProducts,
        addToCart,
        removeFromCart,
        addQuantity,
        removeQuantity,
        resetCart,
        totalPricing,
      }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
