import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface Store {
  id: string;
  name: string;
  is_open: boolean;
}

interface Order {
  order_id: string;
  product_name: string;
  quantity: number;
  status: string;
}

export const ConsumerStores = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const getStores = async () => {
    const res = await fetch(
      "https://rappibackend.vercel.app/stores",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();

    // solo mostrar tiendas abiertas
    const openStores = data.filter((s: Store) => s.is_open);

    setStores(openStores);
  };

  const getOrders = async () => {
    const res = await fetch(
      `https://rappibackend.vercel.app/orders/consumer/${user.id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();

    setOrders(data);
  };

  const deleteOrder = async (orderId: string) => {

  await fetch(
    `https://rappibackend.vercel.app/orders/${orderId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  getOrders();
};
  const logout = () => {
    localStorage.clear();
    navigate("/")
  };

  useEffect(() => {
    getStores();
    getOrders();
  }, []);

  return (
    <div>
      <h1>Stores</h1>
      <button onClick={logout}>Logout</button>

      {stores.map((store) => (
        <div key={store.id}>
          <p>{store.name}</p>

          <button
            onClick={() =>
              navigate(`/store-products/${store.id}`)
            }
          >
            View Products
          </button>
        </div>
      ))}
      <h2>{user?.name ? `${user.name}'s Orders` : "Your Orders"}</h2>

      {orders.length === 0 && <p>No orders yet</p>}

      <ul>
  {orders.map((order, index) => (

    <li key={index}>
      {order.product_name} x{order.quantity} — {order.status}

      <button
        onClick={() => deleteOrder(order.order_id)}
      >
        Delete
      </button>
    </li>

  ))}
</ul>
    </div>
  );
};