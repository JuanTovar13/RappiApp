import { useEffect } from 'react';
import { useMap, useMapEvents } from 'react-leaflet';
import { LatLng } from '../../types/map';

// ─── DestinationPicker ────────────────────────────────────────────────────────
// Captura clicks en el mapa y devuelve la coordenada al padre
interface DestinationPickerProps {
  onPick: (latlng: LatLng) => void;
}

export const DestinationPicker = ({ onPick }: DestinationPickerProps) => {
  useMapEvents({
    click: (e) => onPick({ lat: e.latlng.lat, lng: e.latlng.lng }),
  });
  return null;
};

// ─── MapFollower ──────────────────────────────────────────────────────────────
// Hace pan automático del mapa siguiendo una posición (usado en OrderDetails)
interface MapFollowerProps {
  lat: number;
  lng: number;
}

export const MapFollower = ({ lat, lng }: MapFollowerProps) => {
  const map = useMap();
  useEffect(() => {
    map.panTo([lat, lng], { animate: true, duration: 0.3 });
  }, [lat, lng, map]);
  return null;
};
