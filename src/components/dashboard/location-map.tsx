"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import { useEffect } from "react";

const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });

export function LocationMap() {
  const position: [number, number] = [10.7769, 106.7009]; // Example: Ho Chi Minh City

  useEffect(() => {
    (async () => {
      const L = await import('leaflet');
      const markerIcon2x = (await import('leaflet/dist/images/marker-icon-2x.png')).default;
      const markerIcon = (await import('leaflet/dist/images/marker-icon.png')).default;
      const markerShadow = (await import('leaflet/dist/images/marker-shadow.png')).default;
      
      // react-leaflet doesn't have a built-in way to handle icons in SSR, so we do this on the client.
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: markerIcon2x.src,
        iconUrl: markerIcon.src,
        shadowUrl: markerShadow.src,
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
