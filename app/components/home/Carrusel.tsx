export default function Carrusel() {
  return (
    <section>
      <picture>
        <source media="(max-width: 768px)" srcSet="/bannermobile.jpg" />
        <source media="(min-width: 769px)" srcSet="/banner.jpg" />
        <img src="/banner.jpg" className="w-full" alt="Carrusel" />
      </picture>
    </section>
  );
}
