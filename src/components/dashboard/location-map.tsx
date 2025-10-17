"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";

export function LocationMap() {
  const position = { lat: 10.7769, lng: 106.7009 }; // Example: Ho Chi Minh City
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pond Location</CardTitle>
        <CardDescription>Geographical location of the facility.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] w-full rounded-lg overflow-hidden">
            {apiKey ? (
            <APIProvider apiKey={apiKey}>
                <Map
                defaultCenter={position}
                defaultZoom={12}
                gestureHandling={'greedy'}
                disableDefaultUI={true}
                mapId="aquadash-map"
                >
                <Marker position={position} />
                </Map>
            </APIProvider>
            ) : (
            <div className="flex h-full w-full items-center justify-center rounded-lg bg-muted">
                <p className="text-center text-sm text-muted-foreground">Google Maps API Key not configured.<br/>Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.</p>
            </div>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
