'use client'
import { createContext, useContext, useState } from 'react'
import { toast } from 'sonner'

export const CartContext = createContext()

export const CartContextProvider = ({children}) => {
  // const [cart, setCart] = useState<Cart>([])
  const [cartProducts, setCartProducts] = useState([])

  const addToCart = (item) => {
    const productFound = cartProducts.findIndex((product) => product.price === item.price)
    
    if (productFound >= 0) {
      const newCart = structuredClone(cartProducts)
      newCart[productFound].quantity += 1
      console.log(newCart)
      setCartProducts(newCart)
    }
    setCartProducts(prevState => ([
      ...prevState,
      {
        ...item,
        quantity : 1
      }
    ]))
    toast.success("Producto agregado al carrito")
    };

  const removeFromCart = (item) => {
      setCartProducts(prevState => prevState.filter((product) => product.price !== item.price))
      toast.error("Producto eliminado del carrito")
  }
  const addQuantity = (item) => {
      const productFound = cartProducts.findIndex((product) => product.price === item.price)
      
      if (productFound >= 0) {
        const newCart = structuredClone(cartProducts)
        newCart[productFound].quantity += 1
        return setCartProducts(newCart)
      }
  }

    const removeQuantity = (item) => {
      const productIndex = cartProducts.findIndex((product) => product.price === item.price);

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
      setCartProducts([])
    }

    const totalPricing = () => {
      return cartProducts.reduce((total, product) => total + product.price * product.quantity, 0)
    }

  return (
    <CartContext.Provider value={
        {
         cartProducts, 
         setCartProducts,
         addToCart,
         removeFromCart,
         addQuantity,
         removeQuantity,
         resetCart,
         totalPricing
        }
      }>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)