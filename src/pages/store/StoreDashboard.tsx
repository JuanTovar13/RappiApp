import { useState, useEffect, FormEvent } from "react";

interface ProductForm {
  name: string;
  price: number;
}

interface Store {
  id: string;
  name: string;
  is_open: boolean;
}

export const StoreDashboard = () => {
  const [product, setProduct] = useState<ProductForm>({
    name: "",
    price: 0,
  });

  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<any[]>([]);

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // obtener la tienda del usuario
  const getStore = async () => {
    const res = await fetch(
      "https://rappibackend.vercel.app/stores",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();

    const myStore = data.find(
      (s: any) => s.user_id === user.id
    );

    setStore(myStore);

    if (myStore) {
      getProducts(myStore.id);
    }
  };

  // obtener productos
  const getProducts = async (storeId: string) => {
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

   const deleteProduct = async (productId: string) => {
    await fetch(
      `https://rappibackend.vercel.app/products/${productId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (store) {
      getProducts(store.id);
    }
  };

  const toggleStore = async () => {
  if (!store) return;

  const endpoint = store.is_open ? "close" : "open";

  await fetch(
    `https://rappibackend.vercel.app/stores/${store.id}/${endpoint}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  setStore({
    ...store,
    is_open: !store.is_open,
  });
};
const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("role");

  window.location.href = "/login";
};

  useEffect(() => {
    getStore();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!store) return;

    await fetch(
      "https://rappibackend.vercel.app/products",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: product.name,
          price: product.price,
          store_id: store.id,
        }),
      }
    );

    getProducts(store.id);
  };

  return (
    <div>
      <h1>{store?.name} Dashboard</h1>
      
      <button onClick={toggleStore}>
        {store?.is_open ? "Close Store" : "Open Store"}
        </button>

      <form onSubmit={handleSubmit}>
        <input
          placeholder="Product name"
          value={product.name}
          onChange={(e) =>
            setProduct({ ...product, name: e.target.value })
          }
        />

        <input
          type="number"
          placeholder="Price"
          value={product.price}
          onChange={(e) =>
            setProduct({
              ...product,
              price: Number(e.target.value),
            })
          }
        />

        <button type="submit">Create Product</button>
      </form>
<button onClick={logout}>Logout</button>
      <h2>Products</h2>

      {products.map((p) => (
        <div key={p.id}>
          {p.name} - ${p.price}
          <button
            onClick={() => deleteProduct(p.id)}
            style={{ marginLeft: "10px" }}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
};