export interface Store {
  id: string;
  name: string;
  is_open: boolean;
}

export interface Product {
  id: string;
  name: string;
  price: number;
}

export interface CartItem {
  product_id: string;
  name: string;
  quantity: number;
}
