"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps';

export function LocationMap() {
    const position = { lat: 10.7769, lng: 106.7009 };
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
                                gestureHandling={'none'}
                                disableDefaultUI={true}
                                mapId="a2c9f6a42d92d1a"
                            >
                                <Marker position={position} />
                            </Map>
                        </APIProvider>
                    ) : (
                        <div className="h-full w-full flex items-center justify-center rounded-lg bg-muted">
                            <div className="text-center text-muted-foreground text-sm">
                                <p>Google Maps API Key not configured.</p>
                                <p>Set <code className="font-mono bg-muted-foreground/20 px-1 py-0.5 rounded">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code>.</p>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}