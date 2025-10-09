"use client";
import Ubicacion from "@/app/components/icons/Ubicacion";
import { useSession } from "@/app/context/SessionContext";
import { Address, UsersClient } from "@/types";
import { Inter, Pattaya } from "next/font/google";
import { useEffect, useState } from "react";
import { use } from 'react'

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const pattaya = Pattaya({
  weight: ["400"],
  variable: "--font-pattaya",
  subsets: ["latin"],
});

export default function PersonalInformationPage({params}: {params: Promise<{ id: string }>
}){
  const { userById } = useSession();
  const { id } = use(params);
  const [user, setUser] = useState<UsersClient | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [addAddress, setAddAddress] = useState<boolean>(false);
  useEffect(() => {
    const getUser = async () => {
      const user = await userById(id);
      const u = Array.isArray(user) ? user[0] : user;
      setUser(u);
      setLoading(false);
    };
    getUser();
  }, []);

  if (loading)
    return (
      <div className="h-screen flex justify-center items-center mx-auto">
        Cargando...
      </div>
    );
  console.log("user", user);

  const addressSubmit = () => {
    setAddAddress(false);
    console.log("Agregar nueva direccion");
  };

  return (
    <section
      className={`w-full px-5 md:px-10 py-5 flex flex-col md:flex-row items-start justify-center gap-10 text-white ${inter.className}`}
    >
      <form className="bg-primary px-10 py-10 gap-5 flex rounded-b-3xl flex-col justify-between w-full h-full">
        <h1 className={`${pattaya.className} font-bold text-2xl text-center`}>
          Datos personales
        </h1>
        <div className="flex flex-col gap-10">
          <label htmlFor="name" className="font-bold text-gray-400">
            Nombre
          </label>
          <input
            type="text"
            id="name"
            defaultValue={user?.name ?? ""}
            placeholder="Nombre y apellido"
            className="border-b-2"
          />
          <label htmlFor="email" className="font-bold text-gray-400">
            Correo electrónico
          </label>
          <input
            type="email"
            id="email"
            defaultValue={user?.email ?? ""}
            placeholder="email@gmail.com"
            className="border-b-2"
          />
          <label htmlFor="phone" className="font-bold text-gray-400">
            Teléfono
          </label>
          <input
            type="tel"
            id="phone"
            defaultValue={user?.phone ?? ""}
            placeholder="123456789"
            className="border-b-2"
          />
        </div>
        <button className="bg-tertiary text-black py-2 rounded-xl font-bold text-lg px-5">
          Editar datos
        </button>
      </form>
      <div className="bg-primary flex rounded-b-3xl flex-col justify-start items-center w-full md:w-2/5">
        <h2
          className={`${pattaya.className} font-bold text-2xl pt-10 pb-10 text-center`}
        >
          Mis direcciones
        </h2>
        <ul className="flex flex-col gap-10 w-full px-10">
          {user?.addresses?.length === 0 ? (
            <p>No tenes direcciones guardadas aún.</p>
          ) : (
            user?.addresses?.map((address: Address) => (
              <li>
                <div className="flex justify-between pb-2 items-center">
                  <div className="flex gap-3">
                    <Ubicacion fill="white" />
                    <div className="flex flex-col justify-center">
                      <p>{address.address}</p>
                      <small>{address.type}</small>
                    </div>
                  </div>
                </div>
                <hr />
              </li>
            ))
          )}
          <button onClick={() => setAddAddress(!addAddress)} className="bg-tertiary cursor-pointer text-black font-bold px-3 py-1 my-3">
            {/* INPUT PARA AGREGAR NUEVA DIRECCION TEMPORARIA  */}
              {addAddress ? "Cancelar" : "Agregar nueva direccion"}
          </button>
        </ul>
        {addAddress && (
          <div className="flex justify-center flex-col items-center gap-5 w-full">
            <h2
              className={`${pattaya.className} font-bold text-2xl text-center`}
            >
              Agregar nueva direccion
            </h2>
            <input
              className="border py-1 px-2"
              placeholder="Direccion"
              type="text"
            />
            <input
              className="border py-1 px-2"
              placeholder="Tipo (casa, trabajo, etc.)"
              type="text"
            />
            <button
              onClick={addressSubmit}
              className="bg-tertiary text-black py-2 rounded-xl font-bold cursor-pointer text-lg px-5 mb-5"
            >
              Agregar
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
