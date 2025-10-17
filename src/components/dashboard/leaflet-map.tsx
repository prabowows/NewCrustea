"use client";

import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LocationMap() {
  const position: [number, number] = [10.7769, 106.7009]; // Example: Ho Chi Minh City

  useEffect(() => {
    // This effect runs only once on the client after the component mounts.
    (async () => {
      const L = await import('leaflet');
      // This is a workaround for a known issue with react-leaflet and Next.js
      // It prevents Leaflet from trying to access server-side URLs for icons.
      delete (L.Icon.Default.prototype as any)._getIconUrl;

      L.Icon.Default.mergeOptions({
        iconRetinaUrl: (await import('leaflet/dist/images/marker-icon-2x.png')).default.src,
        iconUrl: (await import('leaflet/dist/images/marker-icon.png')).default.src,
        shadowUrl: (await import('leaflet/dist/images/marker-shadow.png')).default.src,
      });
    })();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pond Location</CardTitle>
        <CardDescription>Geographical location of the facility.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] w-full rounded-lg overflow-hidden">
          <MapContainer center={position} zoom={12} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={position} />
          </MapContainer>
        </div>
      </CardContent>
    </Card>
  );
}
