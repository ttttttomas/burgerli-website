type CardProps = {
    onClick: () => void;
  };

export default function Card({onClick}: CardProps) {
    return (
            <li onClick={onClick} className="flex flex-col w-56 cursor-pointer bg-amber-50 rounded-xl">
                <img className="mx-auto" src="/logo.png" width="150px" alt="" />
                <div className="flex flex-col gap-2  bg-primary rounded-b-xl text-white py-2 px-2">
                <p className="font-bold">Cheeseburger</p>
                <small>Medallón de carne de 100 g con queso cheddar, acompañado de papas clásicas. (Bebida no incluida)
                </small>
                <span className="font-bold">$10.000</span>
                </div>
            </li>
        )
}
