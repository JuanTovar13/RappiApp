import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Order } from '../../types/order';
import { OrderStatus } from '../../types/auth';
import '../../styles/delivery.css';

const BASE_URL = 'https://rappibackend.vercel.app';
const getToken = () => localStorage.getItem('token') ?? '';

export const DeliveryDashboard = () => {
  const navigate = useNavigate();

  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [myOrders, setMyOrders]           = useState<Order[]>([]);
  const [loading, setLoading]             = useState(true);
  const [accepting, setAccepting]         = useState<string | null>(null);

  const name   = localStorage.getItem('name') ?? 'Repartidor';
  const userId = JSON.parse(localStorage.getItem('user') || '{}').id ?? '';

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const [pendingRes, allRes] = await Promise.all([
        fetch(`${BASE_URL}/api/orders/pending`, { headers: { Authorization: `Bearer ${getToken()}` } }),
        fetch(`${BASE_URL}/api/orders`,          { headers: { Authorization: `Bearer ${getToken()}` } }),
      ]);
      const pending: Order[] = await pendingRes.json();
      const all: Order[]     = await allRes.json();

      setPendingOrders(Array.isArray(pending) ? pending : []);
      setMyOrders(
        Array.isArray(all)
          ? all.filter((o) => o.status === OrderStatus.IN_DELIVERY && o.delivery_id === userId)
          : [],
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const acceptOrder = async (orderId: string) => {
    setAccepting(orderId);
    try {
      const res = await fetch(`${BASE_URL}/api/orders/${orderId}/accept`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) navigate(`/delivery/orders/${orderId}`);
    } finally {
      setAccepting(null);
    }
  };

  const logout = () => { localStorage.clear(); navigate('/'); };

  if (loading) return <p>Cargando...</p>;

  return (
    <div className="delivery-page">
      <header className="delivery-header">
        <span>{name} — Repartidor</span>
        <button onClick={logout}>Salir</button>
      </header>

      <div className="delivery-body">
        <h2>En curso ({myOrders.length})</h2>
        {myOrders.length === 0
          ? <p>Sin pedidos activos</p>
          : (
            <ul className="order-list">
              {myOrders.map((o) => (
                <li key={o.id} className="order-card">
                  <div className="order-card-row">
                    <strong>{o.store_name}</strong>
                    <span>{o.status}</span>
                  </div>
                  <span>Cliente: {o.consumer_name}</span>
                  <button onClick={() => navigate(`/delivery/orders/${o.id}`)}>
                    Abrir mapa de entrega
                  </button>
                </li>
              ))}
            </ul>
          )}

        <h2>Pedidos disponibles ({pendingOrders.length})</h2>
        {pendingOrders.length === 0
          ? <p>Sin pedidos disponibles ahora</p>
          : (
            <ul className="order-list">
              {pendingOrders.map((o) => (
                <li key={o.id} className="order-card">
                  <div className="order-card-row">
                    <strong>{o.store_name}</strong>
                    <span>{o.status}</span>
                  </div>
                  <span>Cliente: {o.consumer_name}</span>
                  <button
                    disabled={accepting === o.id}
                    onClick={() => acceptOrder(o.id)}
                  >
                    {accepting === o.id ? 'Aceptando...' : 'Aceptar pedido'}
                  </button>
                </li>
              ))}
            </ul>
          )}
      </div>
    </div>
  );
};
