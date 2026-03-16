import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

interface Product {
  id: string;
  name: string;
  price: number;
}

interface CartItem {
  product_id: string;
  name: string;
  quantity: number;
}

export const StoreProducts = () => {

    const navigate = useNavigate()
  const { storeId } = useParams();

  const [products, setProducts] = useState<Product[]>([]);
 const [cart, setCart] = useState<CartItem[]>([]);

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const getProducts = async () => {
    const res = await fetch(
      `https://rappibackend.vercel.app/products/store/${storeId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();
    setProducts(data);
  };

  useEffect(() => {
    getProducts();
  }, []);

  const addToCart = (product: Product) => {

  const existing = cart.find(
    (item) => item.product_id === product.id
  );

  if (existing) {
    setCart(
      cart.map((item) =>
        item.product_id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  } else {
    setCart([
      ...cart,
      {
        product_id: product.id,
        name: product.name,
        quantity: 1,
      },
    ]);
  }
};

const increaseQty = (productId: string) => {
  setCart(
    cart.map((item) =>
      item.product_id === productId
        ? { ...item, quantity: item.quantity + 1 }
        : item
    )
  );
};

const decreaseQty = (productId: string) => {
  setCart(
    cart
      .map((item) =>
        item.product_id === productId
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
      .filter((item) => item.quantity > 0)
  );
};

  const createOrder = async () => {
    const res = await fetch(
      "https://rappibackend.vercel.app/orders",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          consumer_id: user.id,
          store_id: storeId,
          items: cart,
        }),
      }
    );

    

    const data = await res.json();

    console.log("ORDER CREATED", data);
    navigate("/consumer");
   setCart([])
  };

  const removeItem = (productId: string) => {
  setCart(
    cart.filter(
      (item) => item.product_id !== productId
    )
  );
};

  return (
    <div>
        <button onClick={()=> navigate(-1)}>Go back</button>
      <h1>Products</h1>

      {products.map((p) => (
        <div key={p.id}>
          {p.name} - ${p.price}

          <button onClick={() => addToCart(p)}>
            Add
          </button>
        </div>
      ))}

      <h2>Cart</h2>

      {cart.map((item, i) => (
        <div key={i}>
          {item.name}
          <button
      onClick={() => decreaseQty(item.product_id)}
    >
      -
    </button>

    {item.quantity}

    <button
      onClick={() => increaseQty(item.product_id)}
    >
      +
    </button>

    <button
      onClick={() => removeItem(item.product_id)}
    >
      Remove
    </button>
        </div>
      ))}

      {cart.length > 0 && (
        <button onClick={createOrder}>
          Create Order
        </button>
      )}
    </div>
  );
};