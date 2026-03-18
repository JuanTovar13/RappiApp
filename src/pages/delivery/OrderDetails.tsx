


import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";


interface Item {
  product_name: string;
  quantity: number;
}

export const OrderDetails = () => {

  const { id } = useParams();
  const navigate = useNavigate();

  const [items, setItems] = useState<Item[]>([]);
  const [storeName, setStoreName] = useState("");
  const [orderStatus, setOrderStatus] = useState("");


  const token = localStorage.getItem("token");

  const getOrderDetails = async () => {

    const res = await fetch(
      `https://rappibackend.vercel.app/orders/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();

    setOrderStatus(data.status);
    setStoreName(data.store_name);
    setItems(data.items);
  };

  // ✅ aceptar orden

    const acceptOrder = async () => {

  await fetch(
    `https://rappibackend.vercel.app/delivery/orders/${id}/accept`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  navigate("/delivery");
};

const declineOrder = async () => {

  await fetch(
    `https://rappibackend.vercel.app/delivery/orders/${id}/decline`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  navigate("/delivery");
};



  useEffect(() => {
    getOrderDetails();
  }, []);


  return (
    <div>
      <button onClick={() => navigate(-1)}>
      Back
    </button>

    <h1>{storeName}</h1>

    <h2>Items</h2>

    {items.map((item, index) => (
      <div key={index}>
        {item.product_name} x{item.quantity}
      </div>
    ))}

    {orderStatus === "pending"?
  <button onClick={acceptOrder}>
    Accept Order
  </button> : 
 <button onClick={declineOrder}>
    Decline Order
  </button>
}
    </div>
  );
};