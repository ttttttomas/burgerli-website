"use client";
import { useCart } from "../context/CartContext";
import { useEffect, useState } from "react";
import Card from "./Card";

const ModalPromos = ({ product }) => {
  const { addToCart } = useCart();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [selectOption, setSelectOption] = useState(null);

  // Bloquear scroll del body cuando el modal está abierto
  useEffect(() => {
    if (selectedProduct) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedProduct]);

  const closeModal = () => {
    setSelectedProduct(null);
    setSelectedOptions([]);
    setSelectOption(null);
  };

  const openModal = (product) => {
    setSelectedProduct(product);
    setSelectedOptions([]);
    setSelectOption(null);
  };

  const handleOptionToggle = (option, checked, maxSelectable) => {
    setSelectedOptions((prev) => {
      if (checked) {
        // Solo permitir agregar si no se ha alcanzado el máximo seleccionable
        if (prev.length < maxSelectable && !prev.includes(option)) {
          return [...prev, option];
        }
        return prev;
      } else {
        // Remover la opción
        return prev.filter((o) => o !== option);
      }
    });
  };

  const handleAddToCart = () => {
    if (!selectedProduct) return;

    // Validación dinámica basada en options
    if (
      selectedProduct.description_list &&
      selectedProduct.description_list.length > 0 &&
      selectedProduct.options
    ) {
      const maxSelectable = selectedProduct.options;

      if (maxSelectable === 1) {
        // Para radio buttons (una sola opción)
        if (selectOption === null) {
          alert("Por favor, selecciona una opción para esta promo");
          return;
        }
      } else if (maxSelectable > 1) {
        // Para checkboxes (múltiples opciones)
        if (selectedOptions.length !== maxSelectable) {
          alert(
            `Por favor, selecciona exactamente ${maxSelectable} opciones para esta promo`
          );
          return;
        }
      }
    }

    addToCart({
      name: selectedProduct.name,
      quantity: 1,
      price: selectedProduct.price,
      selectedOptions:
        selectedOptions.length > 0
          ? selectedOptions
          : selectOption
          ? [selectOption]
          : undefined,
    });

    closeModal();
  };

  return (
    <section>
      <Card
        product={product}
        onClick={(e) => {
          e.stopPropagation();
          openModal(product);
        }}
      />

      {/* Modal */}
      {selectedProduct && (
        <section
          className="fixed rounded-4xl inset-0 h-screen z-50 flex items-center justify-center p-4 modal-overlay"
          style={{ touchAction: "none" }}>
          <div
            className="rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            style={{
              overscrollBehavior: "contain",
              WebkitOverflowScrolling: "touch",
            }}>
            <div className="relative bg-primary">
              <div>
                <button
                  onClick={closeModal}
                  className="absolute top-4 cursor-pointer right-4 rounded-full text-black font-extrabold text-3xl transition-colors">
                  X
                </button>

                <div className="bg-gradient-to-t from-[#ffefdb] via-[#ffefdb] to-[#e4cb93] py-5 overflow">
                  <img
                    // src="/bg_burgers.jpg"
                    src={selectedProduct.image || selectedProduct.images[0]}
                    alt={selectedProduct.name}
                    className="h-96 mx-auto rounded-xl object-cover"
                  />
                </div>

                <div className="px-6 py-2 bg-[#ffefdb]">
                  <h2 className="text-2xl font-bold text-black mb-2">
                    {selectedProduct.name}
                  </h2>
                  <p className="text-black mb-6">
                    {selectedProduct.description}
                  </p>
                </div>

                {/* Opciones de la promo (description_list) - Dinámico según options */}
                {selectedProduct.description_list &&
                  selectedProduct.description_list.length > 0 &&
                  selectedProduct.options && (
                    <div className="mb-6 px-6 flex flex-col gap-2">
                      <h3 className="text-lg mt-2 text-tertiary text-tert font-semibold">
                        {selectedProduct.options === 1
                          ? "Elegí tu opción"
                          : `Elegí tus opciones (máximo ${selectedProduct.options})`}
                      </h3>
                      <hr className="border-tertiary border-[1px]" />
                      {selectedProduct.options > 1 && (
                        <p className="text-sm text-gray-300 mb-2">
                          Seleccionadas: {selectedOptions.length}/
                          {selectedProduct.options}
                        </p>
                      )}
                      <div className="flex flex-col justify-between items-start mt-2 gap-2">
                        {selectedProduct.description_list.map((option) => (
                          <div
                            key={option}
                            className="flex justify-between text-white font-light items-center w-full gap-2">
                            <p>{option}</p>
                            {selectedProduct.options === 1 ? (
                              // Radio buttons para una sola selección
                              <input
                                type="radio"
                                name="promo-option"
                                value={option}
                                onChange={() => setSelectOption(option)}
                                checked={selectOption === option}
                                className="cursor-pointer"
                              />
                            ) : (
                              // Checkboxes para múltiples selecciones
                              <input
                                type="checkbox"
                                checked={selectedOptions.includes(option)}
                                onChange={(e) =>
                                  handleOptionToggle(
                                    option,
                                    e.target.checked,
                                    selectedProduct.options
                                  )
                                }
                                disabled={
                                  selectedOptions.length >=
                                    selectedProduct.options &&
                                  !selectedOptions.includes(option)
                                }
                                className="cursor-pointer"
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Botón de agregar y total */}
                <div
                  onClick={handleAddToCart}
                  className="bg-[#FCEDCC] px-5 py-3">
                  <div className="bg-tertiary text-xl cursor-pointer flex text-black font-bold p-3 rounded-2xl justify-between items-center">
                    <p className="">Agregar al pedido</p>
                    <p className="rounded-lg font-bold">
                      Total: ${selectedProduct.price.toLocaleString("es-AR")}
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
export default ModalPromos;
