export type OrderStatus = "pending" | "accepted" | "delivered";

export interface Order {
  id: number;
  consumer_id: string;
  store_id: number;
  delivery_id?: string;
  status: OrderStatus;
}