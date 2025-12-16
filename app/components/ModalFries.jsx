"use client";
import { useCart } from '../context/CartContext';
import { useEffect, useState } from "react";
import Card from "./Card";

const getDefaultSize = (size_list) => {
  const sizes = size_list ?? [];
  if (sizes.includes("Individuales")) return "Individuales";
  if (sizes.includes("Especiales")) return "Especiales";
  return "Individuales"; // fallback
};
const ModalFries = ({product}) => {
    const {addToCart} = useCart();
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [size, setSize] = useState(() => getDefaultSize(product?.size_list));
    const sizePrices = { Individuales: product?.price_list[1], Especiales: product?.price_list[0] };
    const [totalPrice, setTotalPrice] = useState(() => Number(product?.price ?? 0));
    
    useEffect(() => {
      setSize(getDefaultSize(product?.size_list));
      setTotalPrice(Number(product?.price ?? 0));
    }, [product]);
  
    const openModal = (product) => {
      setSelectedProduct(product);
    };
  
    const closeModal = () => {
      setSelectedProduct(null);
    }
  
    const sizeAddition = sizePrices[size] ?? 0;
    const finalPrice = totalPrice + sizeAddition; // + extrasAddition
    
  
    const handleAddToCart = () => {
      const productReady = {
        name: selectedProduct.name,
        quantity: 1,
        price: finalPrice,
        size: size,
      }
      addToCart(productReady);
      
      closeModal();
    };
  
    return (
      <section>
        <Card product={product} onClick={(e) => {
          e.stopPropagation();
          openModal(product);
        }} />
  
        {/* Modal */}
        {selectedProduct && (
          <section  className="fixed rounded-4xl inset-0 h-screen z-50 flex items-center justify-center p-4 modal-overlay">
            <div
              className="rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative bg-primary">
                <div>
                  <button
                    onClick={closeModal}
                    className="absolute top-4 cursor-pointer right-4 rounded-full text-black font-extrabold text-3xl transition-colors"
                  >
                    X
                  </button>
  
                  <div className="bg-gradient-to-t from-[#ffefdb] via-[#ffefdb] to-[#e4cb93] py-5 overflow">
                    <img
                    // src="/bg_burgers.jpg"
                      src={selectedProduct.main_image}
                      alt={selectedProduct.name}
                      className="h-96 mx-auto rounded-xl object-cover"
                    />
                  </div>
  
                  <div className="px-6 py-2 bg-[#ffefdb]">
                    <h2 className="text-2xl font-bold text-black mb-2">
                      {selectedProduct.name}
                    </h2>
                    <p className="text-black mb-6">
                      {selectedProduct.id_burger && selectedProduct.description}
                      {selectedProduct.id_fries && selectedProduct.description_list[0]}
                    </p>
                  </div>
  
                  {/* Tamaños */}
                  <div className="mb-6 px-6 flex flex-col gap-2">
                    <h3 className="text-lg mt-2 text-tertiary text-tert font-semibold">
                      Tamaño
                    </h3>
                    <hr className="border-tertiary border-[1px]" />
                    <div className="flex flex-col justify-between items-start mt-2 gap-2">
                      {selectedProduct.size_list.map((s) => 
                        (
                        <div key={s} className="flex justify-between text-white font-light items-center w-full gap-2">
                          <p>{s}</p>
                          <input
                            type="radio"
                            name="size"
                            value={s}
                            checked={size === s}
                            onChange={() => setSize(s)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
  
                  {/* Botón de agregar y total */}
                  <div onClick={handleAddToCart} className="bg-[#FCEDCC] px-5 py-3">
                    <div
                      // onClick={handleAddToCart()}
                      className="bg-tertiary text-xl cursor-pointer flex text-black font-bold p-3 rounded-2xl justify-between items-center"
                    >
                      <p className="">Agregar al pedido</p>
                      <p
                        className="rounded-lg font-bold"
                      >
                        Total: ${finalPrice.toLocaleString("es-AR")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </section>
    );
  };
  export default ModalFries;
