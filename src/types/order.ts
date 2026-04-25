import { OrderStatus } from './auth';

export interface OrderItem {
  product_name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  status: string;
  store_name: string;
  consumer_name: string;
  created_at: string;
  destination_lat: number;
  destination_lng: number;
  delivery_id?: string;
}

export interface OrderDetail {
  id: string;
  store_name: string;
  consumer_name: string;
  status: OrderStatus;
  destination_lat: number;
  destination_lng: number;
  delivery_lat: number | null;
  delivery_lng: number | null;
  items: OrderItem[];
}

export interface OrderRow {
  order_id: string;
  status: string;
  product_name: string;
  quantity: number;
  destination_lat: number | null;
  destination_lng: number | null;
  delivery_lat: number | null;
  delivery_lng: number | null;
}

export interface GroupedOrder {
  order_id: string;
  status: string;
  items: { name: string; quantity: number }[];
  destination_lat: number | null;
  destination_lng: number | null;
  delivery_lat: number | null;
  delivery_lng: number | null;
}
