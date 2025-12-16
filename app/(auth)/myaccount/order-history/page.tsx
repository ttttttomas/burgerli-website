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

  const filteredData = (data: Orders[]) => {
    return data.filter((item) => item.status === "delivered");
  };

  useEffect(() => {
  const userId = session?.user_id_user_client
    if (userId) {
      try {
        fetch(`https://burgerli.com.ar/MdpuF8KsXiRArNIHtI6pXO2XyLSJMTQ8_Burgerli/api/getOrders`)
        .then((res) => res.json())
        .then((data) => {
          console.log("data", data);
          setOrders(filteredData(data));
          setLoading(false);
        });
      } catch (error) {
        console.error("Error obteniendo datos:", error);
      }
    }
  }, [session]);
  
  if (loading) {
    return <div className="mr-8 ml-80 flex flex-col justify-start gap-5 text-black">Loading...</div>;
  }

  console.log("🚀 Orders:", orders);
  

  return (
    <section className={`w-full h-[70vh] px-10 py-5 ${inter.className}`}>
        <div className="flex gap-5 flex-wrap justify-start">
        {orders?.map((order) => <OrderCard key={order.id_order} order={order} />)}
        </div>
    </section>

  )
}
