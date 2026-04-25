import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Product, CartItem } from '../../types/store';
import { LatLng } from '../../types/map';
import { MapView, DestinationMarker } from '../../components/map/MapView';
import { DestinationPicker } from '../../components/map/MapUtils';
import '../../styles/storeProducts.css';

const BASE_URL = 'https://rappibackend.vercel.app';

export const StoreProducts = () => {
  const navigate    = useNavigate();
  const { storeId } = useParams<{ storeId: string }>();

  const [products, setProducts]       = useState<Product[]>([]);
  const [cart, setCart]               = useState<CartItem[]>([]);
  const [destination, setDestination] = useState<LatLng | null>(null);
  const [ordering, setOrdering]       = useState(false);

  const token = localStorage.getItem('token') ?? '';
  const user  = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetch(`${BASE_URL}/api/products/store/${storeId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then(setProducts)
      .catch(console.error);
  }, [storeId]);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product_id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product_id === product.id ? { ...i, quantity: i.quantity + 1 } : i,
        );
      }
      return [...prev, { product_id: product.id, name: product.name, quantity: 1 }];
    });
  };

  const changeQty = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) => i.product_id === productId ? { ...i, quantity: i.quantity + delta } : i)
        .filter((i) => i.quantity > 0),
    );
  };

  const createOrder = async () => {
    if (!destination || cart.length === 0) return;
    setOrdering(true);
    try {
      await fetch(`${BASE_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          consumer_id:     user.id,
          store_id:        storeId,
          destination_lat: destination.lat,
          destination_lng: destination.lng,
          items:           cart,
        }),
      });
      navigate('/consumer');
    } finally {
      setOrdering(false);
    }
  };

  const totalItems   = cart.reduce((s, i) => s + i.quantity, 0);
  const readyToOrder = Boolean(destination) && cart.length > 0;

  return (
    <div className="products-page">
      <header className="products-header">
        <button onClick={() => navigate(-1)}>← Volver</button>
        <h1>Productos</h1>
        {totalItems > 0 && <span>{totalItems} en carrito</span>}
      </header>

      <div className="products-body">
        <h2>Productos disponibles</h2>
        <ul className="product-list">
          {products.map((p) => (
            <li key={p.id} className="product-card">
              <span>{p.name} — ${p.price.toLocaleString()}</span>
              <button onClick={() => addToCart(p)}>Agregar</button>
            </li>
          ))}
        </ul>

        {cart.length > 0 && (
          <>
            <h2>Tu carrito</h2>
            <ul className="cart-list">
              {cart.map((item) => (
                <li key={item.product_id} className="cart-item">
                  <span>{item.name}</span>
                  <div className="cart-item-qty">
                    <button onClick={() => changeQty(item.product_id, -1)}>−</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => changeQty(item.product_id, +1)}>+</button>
                  </div>
                </li>
              ))}
            </ul>

            <h2>Punto de entrega</h2>
            <div className="destination-map-wrap">
              <p className="destination-map-label">
                {destination
                  ? `Seleccionado: ${destination.lat.toFixed(5)}, ${destination.lng.toFixed(5)}`
                  : 'Haz click en el mapa para elegir tu punto de entrega'}
              </p>
              <MapView center={[4.711, -74.0721]} zoom={14} height="260px" zoomControl>
                <DestinationPicker onPick={setDestination} />
                {destination && (
                  <DestinationMarker lat={destination.lat} lng={destination.lng} />
                )}
              </MapView>
            </div>

            {!destination && <p>⚠️ Selecciona un punto de entrega para continuar</p>}

            <button disabled={!readyToOrder || ordering} onClick={createOrder}>
              {ordering ? 'Creando pedido...' : 'Confirmar pedido'}
            </button>
          </>
        )}
      </div>
    </div>
  );
};
