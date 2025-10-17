"use client";

import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';

// This component is dynamically imported and will only run on the client.
export default function LeafletMap() {
  const position: [number, number] = [10.7769, 106.7009]; // Example: Ho Chi Minh City

  // This effect sets up the Leaflet icons.
  // It runs only once on the client after the component mounts.
  useEffect(() => {
    (async () => {
      const L = await import('leaflet');
      const markerIcon2x = (await import('leaflet/dist/images/marker-icon-2x.png')).default;
      const markerIcon = (await import('leaflet/dist/images/marker-icon.png')).default;
      const markerShadow = (await import('leaflet/dist/images/marker-shadow.png')).default;
      
      // This is a workaround for a known issue with react-leaflet and Next.js
      // It prevents Leaflet from trying to access server-side URLs for icons.
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: markerIcon2x.src,
        iconUrl: markerIcon.src,
        shadowUrl: markerShadow.src,
      });
    })();
  }, []);

  return (
    <MapContainer center={position} zoom={12} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={position} />
    </MapContainer>
  );
}
