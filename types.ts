export type Burgers = {
    id_burger: string;
    name: string;
    description: string;
    price: number;
    stock: boolean;
    image: string;
    ingredients: string;
}

export type Orders = {
    id_order: string;
    combo?: string;
    user_client?: string;
    payment_method: string;
    delivery_mode: string;
    price: number;
    status: string;
    coupon?: string;
    order_notes?: string;
    local: string;
    burgers?: string;
    fries?: string;
    drinks?: string;
    sin: string;
    extras: string;
    promos?: string;
}

export type UsersClient = {
    id: string;
    username: string;
    password: string;
    local: string;
    email: string;
    phone: string;
    favorites: string;
    directions: string;
}

export type Credentials = {
    id: string;
    username: string;
    password: string;
    local: string;
    role: string;
}