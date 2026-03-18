import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Role } from "../auth/Login";

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

interface GroupedOrder {
  order_id: string;
  status: string;
  items: {
    name: string;
    quantity: number;
  }[];
}

export const ConsumerStores = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const role: Role = localStorage.getItem("role") as Role;
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const name = user?.name;

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
  

  const groupedOrders: GroupedOrder[] = Object.values(
  orders.reduce<Record<string, GroupedOrder>>((acc, item) => {

    if (!acc[item.order_id]) {
      acc[item.order_id] = {
        order_id: item.order_id,
        status: item.status,
        items: [],
      };
    }

    acc[item.order_id].items.push({
      name: item.product_name,
      quantity: item.quantity,
    });

    return acc;

  }, {})
);

  useEffect(() => {
    getStores();
    getOrders();
    console.log("User:", role, user, name);
  }, []);




  return (
    <div>
      <h1>List of stores</h1>
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
      <h2>{name ? `${name}'s Orders` : "Your Orders"}</h2>

      {orders.length === 0 && <p>No orders yet</p>}

      <ul>
  {groupedOrders.map((order) => (

  <div key={order.order_id}>
    <h3>Order from {user?.name || "Unknown"}</h3>

    {order.items.map((item, i) => (
      <div key={i}>
        {item.name} x{item.quantity}
      </div>
    ))}

    <p>Status: {order.status}</p>

    <button onClick={() => deleteOrder(order.order_id)}>
      Cancel Order
    </button>
  </div>

))}
</ul>
    </div>
  );
};