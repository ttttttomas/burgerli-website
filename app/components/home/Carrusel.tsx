export default function Carrusel() {
  return (
    <section>
      <picture>
        <source media="(max-width: 768px)" srcSet="/bannermobile.jpeg" />
        <source media="(min-width: 769px)" srcSet="/banner.jpeg" />
        <img src="/banner.jpeg" className="w-full" alt="Carrusel" />
      </picture>
    </section>
  );
}
