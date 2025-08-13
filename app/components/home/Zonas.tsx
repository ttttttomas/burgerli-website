import { pattaya } from "@/app/layout"

export default function Zonas() {
  return (
    <section className="flex mb-18 flex-col items-center">
        <h2 className={`${pattaya.className} text-center text-2xl my-10`}>Zonas de delivery</h2>
        <iframe className="w-full md:h-[700px] h-[450px] mx-0 md:mx-20" src="https://www.google.com/maps/d/u/1/embed?mid=1B3DlCQRAdnQ2ayvSqPXT2d4fnqpBfPg&ehbc=2E312F"></iframe>
    </section>
  )
}
