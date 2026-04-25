import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../..//lib/supabase';
import { OrderStatus } from '../../types/auth';
import { Store } from '../../types/store';
import { GroupedOrder, OrderRow } from '../../types/order';
import { LatLng } from '../../types/map';
import { MapView, DeliveryMarker, DestinationMarker } from '../../components/map/MapView';
import '../../styles/consumer.css';

const BASE_URL = 'https://rappibackend.vercel.app';

export const ConsumerStores = () => {
  const navigate = useNavigate();

  const [stores, setStores]               = useState<Store[]>([]);
  const [orders, setOrders]               = useState<GroupedOrder[]>([]);
  const [toast, setToast]                 = useState<string | null>(null);
  const [livePositions, setLivePositions] = useState<Record<string, LatLng>>({});
  const channelsRef = useRef<Record<string, ReturnType<typeof supabase.channel>>>({});

  const token  = localStorage.getItem('token') ?? '';
  const user   = JSON.parse(localStorage.getItem('user') || '{}');
  const name   = user?.name ?? 'Consumer';

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 5000);
  };

  const fetchOrders = async () => {
    const res  = await fetch(`${BASE_URL}/api/orders/consumer/${user.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data: OrderRow[] = await res.json();
    if (!Array.isArray(data)) return;

    const grouped = Object.values(
      data.reduce<Record<string, GroupedOrder>>((acc, row) => {
        if (!acc[row.order_id]) {
          acc[row.order_id] = {
            order_id:        row.order_id,
            status:          row.status,
            items:           [],
            destination_lat: row.destination_lat,
            destination_lng: row.destination_lng,
            delivery_lat:    row.delivery_lat,
            delivery_lng:    row.delivery_lng,
          };
        }
        acc[row.order_id].items.push({ name: row.product_name, quantity: row.quantity });
        return acc;
      }, {}),
    );
    setOrders(grouped);
  };

  useEffect(() => {
    fetch(`${BASE_URL}/api/stores`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data: Store[]) => setStores(Array.isArray(data) ? data.filter((s) => s.is_open) : []));

    fetch(`${BASE_URL}/api/orders/consumer/${user.id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data: OrderRow[]) => {
        if (!Array.isArray(data)) return;
        const grouped = Object.values(
          data.reduce<Record<string, GroupedOrder>>((acc, row) => {
            if (!acc[row.order_id]) {
              acc[row.order_id] = {
                order_id:        row.order_id,
                status:          row.status,
                items:           [],
                destination_lat: row.destination_lat,
                destination_lng: row.destination_lng,
                delivery_lat:    row.delivery_lat,
                delivery_lng:    row.delivery_lng,
              };
            }
            acc[row.order_id].items.push({ name: row.product_name, quantity: row.quantity });
            return acc;
          }, {}),
        );
        setOrders(grouped);
      });
  }, [token, user.id]);

  useEffect(() => {
    const activeOrders = orders.filter((o) => o.status === OrderStatus.IN_DELIVERY);

    activeOrders.forEach((order) => {
      if (channelsRef.current[order.order_id]) return;

      const channel = supabase
        .channel(`order:${order.order_id}`)
        .on('broadcast', { event: 'position-update' }, ({ payload }) => {
          const { lat, lng } = payload as LatLng;
          setLivePositions((prev) => ({ ...prev, [order.order_id]: { lat, lng } }));
        })
        .on('broadcast', { event: 'order-delivered' }, () => {
          setOrders((prev) =>
            prev.map((o) => o.order_id === order.order_id ? { ...o, status: OrderStatus.DELIVERED } : o),
          );
          showToast('¡Tu pedido fue entregado!');
        })
        .subscribe();

      channelsRef.current[order.order_id] = channel;
    });

    return () => {
      Object.entries(channelsRef.current).forEach(([id, ch]) => {
        const stillActive = activeOrders.some((o) => o.order_id === id);
        if (!stillActive) {
          supabase.removeChannel(ch);
          delete channelsRef.current[id];
        }
      });
    };
  }, [orders]);

  const deleteOrder = async (orderId: string) => {
    await fetch(`${BASE_URL}/api/orders/${orderId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchOrders();
  };

  const logout = () => { localStorage.clear(); navigate('/'); };

  return (
    <div className="consumer-page">
      {toast && <p>{toast}</p>}

      <header className="consumer-header">
        <span>{name} — Consumidor</span>
        <button onClick={logout}>Salir</button>
      </header>

      <div className="consumer-body">
        <h2>Tiendas abiertas</h2>
        {stores.length === 0 && <p>No hay tiendas abiertas ahora</p>}
        <ul className="store-list">
          {stores.map((store) => (
            <li key={store.id} className="store-card">
              <span>{store.name}</span>
              <button onClick={() => navigate(`/store-products/${store.id}`)}>Ver productos</button>
            </li>
          ))}
        </ul>

        <h2>Mis pedidos</h2>
        {orders.length === 0 && <p>Aún no tienes pedidos</p>}
        <ul className="order-list">
          {orders.map((order) => {
            const live     = livePositions[order.order_id];
            const delivLat = live?.lat ?? order.delivery_lat;
            const delivLng = live?.lng ?? order.delivery_lng;
            const canMap   =
              order.status === OrderStatus.IN_DELIVERY &&
              delivLat && delivLng &&
              order.destination_lat && order.destination_lng;

            return (
              <li key={order.order_id} className="order-card">
                <div className="order-card-header">
                  <strong>Pedido</strong>
                  <span>{order.status}</span>
                </div>

                <ul className="order-items">
                  {order.items.map((item, i) => (
                    <li key={i}>{item.quantity}× {item.name}</li>
                  ))}
                </ul>

                {canMap && (
                  <div className="tracking-map-wrap">
                    <p className="tracking-map-label">
                      Repartidor en camino{live ? ' · actualizando...' : ''}
                    </p>
                    <MapView center={[delivLat!, delivLng!]} zoom={16} height="200px">
                      <DeliveryMarker lat={delivLat!} lng={delivLng!} />
                      <DestinationMarker
                        lat={order.destination_lat!}
                        lng={order.destination_lng!}
                        label="Tu punto de entrega"
                        showRadius
                      />
                    </MapView>
                  </div>
                )}

                {order.status === OrderStatus.DELIVERED && <p>✅ Pedido entregado</p>}

                {order.status === OrderStatus.CREATED && (
                  <button onClick={() => deleteOrder(order.order_id)}>Cancelar pedido</button>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};
