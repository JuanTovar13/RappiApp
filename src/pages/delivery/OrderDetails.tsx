import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { OrderStatus } from '../../types/auth';
import { OrderDetail } from '../../types/order';
import { MapView, DeliveryMarker, DestinationMarker } from '../../components/map/MapView';
import { MapFollower } from '../../components/map/MapUtils';
import '../../styles/delivery.css';

const BASE_URL = 'https://rappibackend.vercel.app';
const getToken = () => localStorage.getItem('token') ?? '';

export const OrderDetails = () => {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [order, setOrder]     = useState<OrderDetail | null>(null);
  const [pos, setPos]         = useState({ lat: 4.711, lng: -74.0721 });
  const [arrived, setArrived] = useState(false);
  const [delivering, setDelivering] = useState(false);
  const [loading, setLoading] = useState(true);

  const throttleRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingPos  = useRef(pos);

  useEffect(() => {
    if (!id) return;
    fetch(`${BASE_URL}/api/orders/${id}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then((r) => r.json())
      .then((data: OrderDetail) => {
        setOrder(data);
        if (data.status === OrderStatus.DELIVERED) setArrived(true);
        if (data.delivery_lat && data.delivery_lng) {
          const init = { lat: data.delivery_lat, lng: data.delivery_lng };
          setPos(init);
          pendingPos.current = init;
        } else {
          navigator.geolocation?.getCurrentPosition((p) => {
            const init = { lat: p.coords.latitude, lng: p.coords.longitude };
            setPos(init);
            pendingPos.current = init;
          });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const channel = supabase
      .channel(`order:${id}`)
      .on('broadcast', { event: 'order-delivered' }, () => {
        setArrived(true);
        setOrder((prev) => prev ? { ...prev, status: OrderStatus.DELIVERED } : prev);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [id]);

  const sendPosition = useCallback(async (p: { lat: number; lng: number }) => {
    await fetch(`${BASE_URL}/api/orders/${id}/position`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify({ lat: p.lat, lng: p.lng }),
    });
  }, [id]);

  useEffect(() => {
    if (arrived) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      let { lat, lng } = pendingPos.current;
      switch (e.key) {
        case 'ArrowUp':    lat += 0.0005; break;
        case 'ArrowDown':  lat -= 0.0005; break;
        case 'ArrowLeft':  lng -= 0.0005; break;
        case 'ArrowRight': lng += 0.0005; break;
        default: return;
      }
      e.preventDefault();
      setPos({ lat, lng });
      pendingPos.current = { lat, lng };

      if (throttleRef.current) return;
      throttleRef.current = setTimeout(() => {
        sendPosition(pendingPos.current);
        throttleRef.current = null;
      }, 1000);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (throttleRef.current) clearTimeout(throttleRef.current);
    };
  }, [arrived, sendPosition]);
  
  const confirmDelivery = async () => {
      setDelivering(true);
      try {
        const res = await fetch(`${BASE_URL}/api/orders/${id}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
          body: JSON.stringify({ status: OrderStatus.DELIVERED }),
        });
        if (res.ok) {
          setArrived(true);
          setOrder((prev) => prev ? { ...prev, status: OrderStatus.DELIVERED } : prev);
        }
      } finally {
        setDelivering(false);
      }
    };

  if (loading) return <p>Cargando...</p>;
  if (!order)  return <p>Pedido no encontrado</p>;

  return (
    <div className="order-details-page">
      <div className="order-details-topbar">
        <button onClick={() => navigate('/delivery')}>← Volver</button>
        <span>{order.store_name}</span>
        <span>{order.status}</span>
      </div>

      <div className="order-details-map">
        <MapView center={[pos.lat, pos.lng]} zoom={17}>
          <MapFollower lat={pos.lat} lng={pos.lng} />
          <DeliveryMarker lat={pos.lat} lng={pos.lng} label="Tu posición" />
          <DestinationMarker
            lat={order.destination_lat}
            lng={order.destination_lng}
            label={`Punto de entrega — ${order.consumer_name}`}
            showRadius
          />
        </MapView>

        {!arrived && (
          <div className="map-info-panel">
            <strong>Pedido en curso</strong>
            <span>Cliente: {order.consumer_name}</span>
            {order.items.length > 0 && (
              <ul className="map-info-items">
                {order.items.map((item, i) => (
                  <li key={i} className="map-info-item">
                    <span>{item.quantity}× {item.product_name}</span>
                    {item.price && <span>${(item.price * item.quantity).toLocaleString()}</span>}
                  </li>
                ))}
              </ul>
            )}
            <button disabled={delivering} onClick={confirmDelivery}>
              {delivering ? 'Confirmando...' : '✅ Confirmar entrega'}
            </button>
          </div>
        )}

        {arrived && (
          <div className="map-arrived-banner">
            <p>✅ ¡Pedido Entregado!</p>
            <p>Has llegado al punto de entrega</p>
            <button onClick={() => navigate('/delivery')}>Volver al dashboard</button>
          </div>
        )}

        {!arrived && (
          <div className="map-keyboard-hint">
            <span>Mover:</span>
            {['↑', '↓', '←', '→'].map((k) => (
              <kbd key={k}>{k}</kbd>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
