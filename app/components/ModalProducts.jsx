"use client";
import { useState } from "react";
import Card from "./Card";
import { useCart } from "../context/CartContext";



const ModalProducts = ({product}) => {
  const {addToCart} = useCart();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [size, setSize] = useState("Simple");
  // const [extras, setExtras] = useState([]);
  const [without, setWithout] = useState([]);
  const [totalPrice] = useState(Number(product.price));
  const [fries, setFries] = useState("Cheddar");
  const friesList = ["Cheddar","Cheddar y Panceta","Papas Burgerli"];
  

  const sizePrices = { Simple: 0, Doble: 200, Triple: 300 };
  const extraPrice = 100; 


  const openModal = (product) => {
    setSelectedProduct(product);
  };

  const closeModal = () => {
    setSelectedProduct(null);
  }

  // const handleExtraToggle = (extra, checked) => {
  //   setExtras((prev) => {
  //     if (checked) {
  //       // agrega sólo si no está
  //       if (!prev.includes(extra)) return [...prev, extra];
  //       return prev;
  //     } else {
  //       // remover
  //       return prev.filter((e) => e !== extra);
  //     }
  //   });

  //   // si lo marcás como extra, no puede estar marcado en "sin"
  //   setWithout((prev) => prev.filter((i) => i !== extra));
  // };
  
  const handleSinToggle = (ingredient, checked) => {
    setWithout((prev) => {
      if (checked) {
        if (!prev.includes(ingredient)) return [...prev, ingredient];
        return prev;
      } else {
        return prev.filter((i) => i !== ingredient);
      }
    });

    // si lo marcás "sin", lo saca de extras
    // setExtras((prev) => prev.filter((e) => e !== ingredient));
  };
  const handleFriesToggle = (ingredient) => {
    setFries(() => ingredient);
    console.log(fries);
    
  };

  // const extrasAddition = extras.reduce((sum) => sum + extraPrice, 0);

  const sizeAddition = sizePrices[size] ?? 0;
  const finalPrice = totalPrice + sizeAddition // + extrasAddition;

  const handleAddToCart = () => {
    const productReady = {
      name: selectedProduct.name,
      quantity: 1,
      // extras: extras,
      sin: without,
      fries: fries,
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

                <div className="bg-[#FCEDCC] py-5 overflow">
                  <img
                    src={selectedProduct.main_image}
                    alt={selectedProduct.name}
                    className="h-96 mx-auto rounded-xl object-cover"
                  />
                </div>

                <div className="px-6 py-2 bg-[#FCEDCC]">
                  <h2 className="text-2xl font-bold text-black mb-2">
                    {selectedProduct.name}
                  </h2>
                  <p className="text-black mb-6">
                    {selectedProduct.description}
                  </p>
                </div>

                {/* Tamaños */}
                <div className="mb-6 px-6 flex flex-col gap-2">
                  <h3 className="text-lg mt-2 text-tertiary text-tert font-semibold">
                    Tamaño
                  </h3>
                  <hr className="border-tertiary border-[1px]" />
                  <div className="flex flex-col justify-between items-start mt-2 gap-2">
                    {selectedProduct.size_list.map((s) => (
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

                {/* Extras
                {selectedProduct.ingredients_list.length > 0 && (
                  <div className="mb-6 px-6">
                    <h3 className="text-lg mt-2 text-tertiary text-tert font-semibold">
                      Extras
                    </h3>
                    <hr className="border-tertiary my-2 border-[1px]" />
                    <div className="flex flex-col justify-between text-white font-light items-center w-full gap-2">
                      {selectedProduct.ingredients_list.map((extra) => (
                        <div key={extra} className="flex justify-between text-white font-light items-center w-full gap-2">
                          <p>{extra}</p>
                          <input
                            type="checkbox"
                            checked={extras.includes(extra)}
                            onChange={(e) => handleExtraToggle(extra, e.target.value)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )} */}

                {/* Sin */}
                {selectedProduct.ingredients_list.length > 0 && (
                  <div className="mb-6 px-6">
                    <h3 className="text-lg mt-2 text-tertiary text-tert font-semibold">
                      Sin
                    </h3>
                    <hr className="border-tertiary my-2 border-[1px]" />
                    <div className="flex flex-col justify-between text-white font-light items-center w-full gap-2">
                      {selectedProduct.ingredients_list.map((sin) => (
                        <div key={sin} className="flex justify-between text-white font-light items-center w-full gap-2">
                          <p>{sin}</p>
                          <input
                            type="checkbox"
                            checked={without.includes(sin)}
                            onChange={(e) => handleSinToggle(sin, e.target.checked)}

                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                 {/* PAPAS */}
                 {friesList.length > 0 && (
                  <div className="mb-6 px-6">
                    <h3 className="text-lg mt-2 text-tertiary text-tert font-semibold">
                      Papas fritas
                    </h3>
                    <hr className="border-tertiary my-2 border-[1px]" />
                    <div className="flex flex-col justify-between text-white font-light items-center w-full gap-2">
                      {friesList.map((f) => (
                        <div key={f} className="flex justify-between text-white font-light items-center w-full gap-2">
                          <p>{f}</p>
                          <input
                            name="fries"
                            value={f}
                            type="radio"
                            onChange={(e) => handleFriesToggle(e.target.value)}

                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

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
export default ModalProducts;
