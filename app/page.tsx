import Carrusel from './components/home/Carrusel';
import SectionProductos from './components/home/SectionProductos'
import Cart from './components/home/Cart'
import Sucursales from './components/home/Sucursales'
import Zonas from './components/home/Zonas';
import DeliveryZoneModal from './components/home/DeliveryZoneModal';

export default function Home() {

  return (
    <main className='w-full'>
      <DeliveryZoneModal />
      <section id="carrusel">
          <Carrusel />
      </section>
      <section 
      className='flex justify-between my-10 mx-5 gap-10 rounded-xl' 
      id="tienda"
      >
          <SectionProductos />
          <Cart />
          {/* <section className='xl:hidden fixed bottom-0 z-30 w-full pt-28 h-min cart text-white rounded-2xl bg-primary py-3 px-5'>
            <CartMobile />
          </section> */}
      </section>
      <section id="sucursales">
          <Sucursales />
      </section>
      <section id="zonas">
          <Zonas/>
      </section>
    </main>
  );
}
