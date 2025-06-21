"use client";
import { useState } from "react";
import Card from "./Card";

const ModalProducts = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedExtras, setSelectedExtras] = useState([]);
  const [notes, setNotes] = useState("");

  const products = [
    {
      id: 1,
      name: "Hamburguesa Clásica",
      description:
        "Deliciosa hamburguesa con carne 100% res, lechuga, tomate y nuestra salsa especial",
      price: 8.99,
      image:
        "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
      sizes: [
        { id: "s", name: "Pequeña", price: 0 },
        { id: "m", name: "Mediana", price: 2.0 },
        { id: "l", name: "Grande", price: 3.5 },
      ],
      extras: [
        { id: "cheese", name: "Queso extra", price: 1.5 },
        { id: "bacon", name: "Tocino", price: 2.0 },
        { id: "avocado", name: "Aguacate", price: 1.75 },
        { id: "egg", name: "Huevo", price: 1.0 },
      ],
    },
    {
      id: 2,
      name: "Pizza Margarita",
      description:
        "Pizza tradicional con salsa de tomate, mozzarella fresca y albahaca",
      price: 12.99,
      image:
        "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
      sizes: [
        { id: "s", name: "Personal", price: 0 },
        { id: "m", name: "Mediana", price: 3.0 },
        { id: "l", name: "Familiar", price: 5.0 },
      ],
      extras: [
        { id: "pepperoni", name: "Pepperoni", price: 2.5 },
        { id: "mushrooms", name: "Champiñones", price: 1.75 },
        { id: "olives", name: "Aceitunas", price: 1.5 },
        { id: "extra_cheese", name: "Doble queso", price: 2.0 },
      ],
    },
    {
      id: 3,
      name: "Ensalada César",
      description:
        "Fresca ensalada con pollo, croutones, parmesano y aderezo césar",
      price: 9.5,
      image:
        "https://images.unsplash.com/photo-1546793665-c74683f339c1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
      sizes: [
        { id: "s", name: "Pequeña", price: 0 },
        { id: "m", name: "Mediana", price: 1.5 },
        { id: "l", name: "Grande", price: 2.5 },
      ],
      extras: [
        { id: "shrimp", name: "Camarones", price: 3.0 },
        { id: "avocado", name: "Aguacate", price: 1.75 },
        { id: "bacon", name: "Tocino", price: 2.0 },
        { id: "egg", name: "Huevo duro", price: 1.0 },
      ],
    },
  ];

  const openModal = (product) => {
    setSelectedProduct(product);
    setQuantity(1);
    setSelectedSize(product.sizes[0]);
    setSelectedExtras([]);
    setNotes("");
  };

  const closeModal = () => {
    setSelectedProduct(null);
  };

  const handleExtraToggle = (extra) => {
    if (selectedExtras.some((e) => e.id === extra.id)) {
      setSelectedExtras(selectedExtras.filter((e) => e.id !== extra.id));
    } else {
      setSelectedExtras([...selectedExtras, extra]);
    }
  };
  const handleSinToggle = (sin) => {
    if (selectedExtras.some((e) => e.id === sin.id)) {
      setSelectedExtras(selectedExtras.filter((e) => e.id !== sin.id));
    } else {
      setSelectedExtras([...selectedExtras, sin]);
    }
  };

  const calculateTotal = () => {
    if (!selectedProduct) return 0;

    const sizePrice = selectedSize ? selectedSize.price : 0;
    const extrasPrice = selectedExtras.reduce(
      (sum, extra) => sum + extra.price,
      0
    );

    return (selectedProduct.price + sizePrice + extrasPrice) * quantity;
  };

  const handleAddToCart = () => {
    const order = {
      product: selectedProduct,
      quantity,
      size: selectedSize,
      extras: selectedExtras,
      notes,
      total: calculateTotal(),
    };

    console.log(
      `Pedido agregado:\n${order.product.name} x${order.quantity}\nTamaño: ${
        order.size.name
      }\nExtras: ${
        order.extras.length > 0
          ? order.extras.map((e) => e.name).join(", ")
          : "Ninguno"
      }\nNotas: ${order.notes || "Ninguna"}\nTotal: $${order.total.toFixed(2)}`
    );
    closeModal();
  };

  return (
    <section>
      <Card onClick={() => openModal(products[0])} />

      {/* Modal */}
      {selectedProduct && (
        <section className="fixed rounded-4xl inset-0 h-screen z-50 flex items-center justify-center p-4 modal-overlay">
          <div
            className="rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative bg-primary">
              <div className="">
                <button
                  onClick={closeModal}
                  className="absolute top-4 cursor-pointer right-4 rounded-full text-black font-extrabold text-3xl transition-colors"
                >
                  X
                </button>

                <div className="bg-[#FCEDCC] py-5 overflow">
                  <img
                    src={selectedProduct.image}
                    alt={selectedProduct.name}
                    className="size-80 mx-auto rounded-xl object-cover"
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
                    {selectedProduct.sizes.map((size) => (
                      <div className="flex justify-between text-white font-light items-center w-full gap-2">
                        <p>{size.name}</p>
                        <input
                          onClick={() => setSelectedSize(size)}
                          type="radio"
                          name="radio"
                          id=""
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Extras */}
                {selectedProduct.extras.length > 0 && (
                  <div className="mb-6 px-6">
                    <h3 className="text-lg mt-2 text-tertiary text-tert font-semibold">
                      Extras
                    </h3>
                    <hr className="border-tertiary my-2 border-[1px]" />
                    <div className="flex flex-col justify-between text-white font-light items-center w-full gap-2">
                      {selectedProduct.extras.map((extra) => (
                        <div className="flex justify-between text-white font-light items-center w-full gap-2">
                          <p>{extra.name}</p>
                          <input
                            onClick={() => handleExtraToggle(extra)}
                            type="checkbox"
                            name="radio"
                            id=""
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sin */}
                {selectedProduct.extras.length > 0 && (
                  <div className="mb-6 px-6">
                    <h3 className="text-lg mt-2 text-tertiary text-tert font-semibold">
                      Sin
                    </h3>
                    <hr className="border-tertiary my-2 border-[1px]" />
                    <div className="flex flex-col justify-between text-white font-light items-center w-full gap-2">
                      {selectedProduct.extras.map((sin) => (
                        <div className="flex justify-between text-white font-light items-center w-full gap-2">
                          <p>{sin.name}</p>
                          <input
                            onClick={() => handleSinToggle(sin)}
                            type="checkbox"
                            name="radio"
                            id=""
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Botón de agregar y total */}
                <div className="bg-[#FCEDCC] px-5 py-3">
                  <div
                    onClick={handleAddToCart}
                    className="bg-tertiary text-xl cursor-pointer flex text-black font-bold p-3 rounded-2xl justify-between items-center"
                  >
                    <p className="">Agregar al pedido</p>
                    <p
                      onClick={handleAddToCart}
                      className="rounded-lg font-bold transition-colors shadow-md"
                    >
                      Total: ${calculateTotal().toFixed(2)}
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
