import { ReactNode } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// ─── Leaflet icon fix ────────────────────────────────────────────────────────
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// ─── Icons ───────────────────────────────────────────────────────────────────
const deliveryIcon = L.divIcon({
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  html: `
    <div style="position:relative;width:32px;height:32px">
      <style>@keyframes ping{0%{transform:scale(1);opacity:.8}100%{transform:scale(2.5);opacity:0}}</style>
      <div style="position:absolute;inset:0;border-radius:50%;background:rgba(245,158,11,.25);animation:ping 1.5s ease-out infinite"></div>
      <div style="position:absolute;inset:0;border-radius:50%;background:rgba(245,158,11,.12);animation:ping 1.5s ease-out infinite;animation-delay:.4s"></div>
      <div style="position:absolute;inset:4px;border-radius:50%;background:linear-gradient(135deg,#fcd34d,#f59e0b);border:2.5px solid white;box-shadow:0 0 14px rgba(245,158,11,.8);display:flex;align-items:center;justify-content:center">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
          <rect x="1" y="3" width="15" height="13" rx="1"/>
          <path d="M16 8h4l3 3v5h-7V8z"/>
          <circle cx="5.5" cy="18.5" r="2.5"/>
          <circle cx="18.5" cy="18.5" r="2.5"/>
        </svg>
      </div>
    </div>`,
});

const destinationIcon = L.divIcon({
  className: '',
  iconSize: [38, 46],
  iconAnchor: [19, 46],
  html: `
    <div style="position:relative;width:38px;height:46px">
      <div style="position:absolute;bottom:0;left:50%;width:38px;height:38px;background:linear-gradient(135deg,#34d399,#059669);border:3px solid white;border-radius:50% 50% 50% 0;transform:translateX(-50%) rotate(-45deg);box-shadow:0 0 18px rgba(16,185,129,.7)"></div>
      <div style="position:absolute;top:5px;left:50%;transform:translateX(-50%);font-size:16px">📍</div>
    </div>`,
});

// ─── MapView ─────────────────────────────────────────────────────────────────
interface MapViewProps {
  center: [number, number];
  zoom?: number;
  height?: string;
  zoomControl?: boolean;
  children?: ReactNode;
}

export const MapView = ({
  center,
  zoom = 16,
  height = '100%',
  zoomControl = false,
  children,
}: MapViewProps) => (
  <>
    <style>{`.leaflet-container { background: #1a1a26 !important; }`}</style>
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height, width: '100%' }}
      zoomControl={zoomControl}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
      />
      {children}
    </MapContainer>
  </>
);

// ─── DeliveryMarker ───────────────────────────────────────────────────────────
interface DeliveryMarkerProps {
  lat: number;
  lng: number;
  label?: string;
}

export const DeliveryMarker = ({ lat, lng, label = 'Repartidor' }: DeliveryMarkerProps) => (
  <Marker position={[lat, lng]} icon={deliveryIcon}>
    <Popup>{label}</Popup>
  </Marker>
);

// ─── DestinationMarker ────────────────────────────────────────────────────────
interface DestinationMarkerProps {
  lat: number;
  lng: number;
  label?: string;
  showRadius?: boolean;
  radiusMeters?: number;
}

export const DestinationMarker = ({
  lat,
  lng,
  label = 'Punto de entrega',
  showRadius = false,
  radiusMeters = 5,
}: DestinationMarkerProps) => (
  <>
    <Marker position={[lat, lng]} icon={destinationIcon}>
      <Popup>{label}</Popup>
    </Marker>
    {showRadius && (
      <Circle
        center={[lat, lng]}
        radius={radiusMeters}
        pathOptions={{
          color: '#10b981',
          fillColor: '#10b981',
          fillOpacity: 0.15,
          weight: 2,
          dashArray: '6 4',
        }}
      />
    )}
  </>
);
