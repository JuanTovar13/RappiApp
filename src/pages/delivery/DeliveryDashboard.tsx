import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Role } from "../auth/Login";

interface Order {
  id: string;
  status: string;
  store_name: string;
}

export const DeliveryDashboard = () => {

  const [availableOrders, setAvailableOrders] = useState<Order[]>([]);
  const [myOrders, setMyOrders] = useState<Order[]>([]);

  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const role: Role = localStorage.getItem("role") as Role;
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const name = localStorage.getItem("name");
  

  // 🔹 órdenes disponibles
  const getAvailableOrders = async () => {
    const res = await fetch(
      "https://rappibackend.vercel.app/delivery/orders/available",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();
    setAvailableOrders(data);
  };

  // 🔹 mis órdenes
  const getMyOrders = async () => {
    const res = await fetch(
      "https://rappibackend.vercel.app/delivery/orders/my",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();
    setMyOrders(data);
  };

  // ✅ aceptar orden
   const acceptOrder = async (orderId: string) => {

    await fetch(
      `https://rappibackend.vercel.app/delivery/orders/${orderId}/accept`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    getAvailableOrders();
    getMyOrders();
  };

  const declineOrder = async (orderId: string) => {

  await fetch(
    `https://rappibackend.vercel.app/delivery/orders/${orderId}/decline`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  getAvailableOrders();
  getMyOrders();
};

const logout = () => {
    localStorage.clear();
    navigate("/")
  };

  useEffect(() => {
    getAvailableOrders();
    getMyOrders();
    console.log("User:", role, user, name);
  }, []);

  

  return (
    <div>
      <h1>Delivery Dashboard</h1>
      <button onClick={logout}>Logout</button>

<h2>Accepted Orders</h2>

      {myOrders.map((order) => (
        <div key={order.id}>
          <p>Store: {order.store_name}</p>
          <p>Status: {order.status}</p>

          <button onClick={() => declineOrder(order.id)}>
          Decline
        </button>

          <button
            onClick={() => navigate(`/delivery/orders/${order.id}`)}
          >
            View details
          </button>
        </div>
      ))}
      <h2>Available Orders</h2>

{availableOrders.map((order) => (
  <div key={order.id}>
    <p>Store: {order.store_name}</p>
    <p>Status: {order.status}</p>

    <button onClick={() => acceptOrder(order.id)}>
      Accept
    </button>

    <button
      onClick={() => navigate(`/delivery/orders/${order.id}`)}
    >
      View details
    </button>
  </div>
))}

      
    </div>
  );
};