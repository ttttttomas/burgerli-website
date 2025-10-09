export type Burgers = {
  id_burger: string;
  name: string;
  size: string;
  fries: string;
  price: number;
  stock: boolean;
  description: string;
  main_image: string;
  extras: string[];
  sin: string[];
  ingredients_list: string[];
  size_list: string[];
}

export type ProductType = {
  id: string;
  name: string;
  description: string;
  quantity: number;
  price: number;
  image: string;
  category: string; // category_id
  currency_id: string; // ES PARA MERCADO PAGO
}

export type SessionUser = {
  user_id: string;
  username: string;
}

// PRODUCTO DENTRO DEL CARRITO
export type CartProduct = {
  name: string;
  quantity: number;
  price: number;
  size: string;
  sin: string[];
  fries: string;
};

export type Products = {
  id: string;
  name: string;
  description: string;
  quantity: number;
  price: number;
  image: string;
  sin?: string[];
  fries?: string;
}


export type Orders = {
  id_order: string; // VIENEN CREADOS DESDE LA BASE DE DATOS
  // created_at: string; // VIENEN CREADOS DESDE LA BASE DE DATOS
  payment_method: string;
  delivery_mode: string;
  price: number;
  status: string;
  order_notes?: string;
  local: string;
  name: string;
  phone: number;
  email: string;
  address: string;
  coupon?: string;
  products: Products[];
}

export type Cart = {
  products: CartProduct[];
  cupon: string;
  delivery_mode: string;
  subtotal: number;
  sale: number;
  shipping: number;
  total: number;
  notes: string;
};

export type Address ={
  address: string;
  type: string;
}

export type UsersClient = {
    id: string;
    name: string;
    email: string;
    phone: string;
    password: string;
    locality: string;
    favorites: string[];
    piso_depto?: string;
    addresses: Address[];
}

export type Credentials = {
    id: string;
    username: string;
    password: string;
    local: string;
    role: string;
}
