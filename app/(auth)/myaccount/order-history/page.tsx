'use client'
import { Inter } from "next/font/google"
import OrderCard from "@/app/components/OrderCard"
import { useSession } from "@/app/context/SessionContext"
import { useEffect, useState } from "react"
import { Orders } from "@/types"

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
})

export default function OrderHistoryPage() {
  const {session} = useSession()
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState<Orders[]>([])

// item.status === "delivered" && 

  const filteredData = (data: Orders[]) => {
    return data.filter((item) => item.id_user_client === session?.user_id_user_client);
  };

  useEffect(() => {
  const userId = session?.user_id_user_client
    if (userId) {
      try {
        fetch(`https://burgerli.com.ar/MdpuF8KsXiRArNIHtI6pXO2XyLSJMTQ8_Burgerli/api/getOrders`)
        .then((res) => res.json())
        .then((data) => {
          setOrders(filteredData(data));
          setLoading(false);
        });
      } catch (error) {
        console.error("Error obteniendo datos:", error);
      }
    }
  }, [session]);
  
  if (loading) {
    return <div className="md:mr-8 md:ml-80 flex flex-col justify-start gap-5 text-black">Loading...</div>;
  }  

  return (
    <section className={`w-full h-[70vh] px-10 py-5 ${inter.className}`}>
        <div className="flex gap-5 flex-wrap justify-start">
        {orders.length === 0 ? (
          <p className="text-black">No se encontraron órdenes para este usuario.</p>
        ) : ( 
         orders?.map((order) => <OrderCard key={order.id_order} order={order} />)
        )}
        </div>
    </section>

  )
}
