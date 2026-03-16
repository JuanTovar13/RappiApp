import { useEffect, useState } from "react";

interface Order {
  id: number;
  status: string;
}

export  const DeliveryDashboard=()=> {
  const [orders, setOrders] = useState<Order[]>([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch("https://rappibackend.vercel.app/delivery/orders/available", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data: Order[]) => setOrders(data))
      .catch((err) => console.error(err));
  }, [token]);

  const acceptOrder = async (id: number) => {
    try {
      await fetch(
        `https://rappibackend.vercel.app/delivery/orders/${id}/accept`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Order accepted");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h1>Available Orders</h1>

      {orders.map((order) => (
        <div key={order.id}>
          <p>Order #{order.id}</p>

          <button onClick={() => acceptOrder(order.id)}>
            Accept
          </button>
        </div>
      ))}
    </div>
  );
}