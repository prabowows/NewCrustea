"use client";

import dynamic from 'next/dynamic';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useMemo } from 'react';

export function LocationMap() {
    const Map = useMemo(() => dynamic(
      () => import('@/components/dashboard/leaflet-map'),
      { 
        loading: () => <div className="h-[200px] w-full rounded-lg bg-muted animate-pulse" />,
        ssr: false
      }
    ), [])

    return (
        <Card>
            <CardHeader>
                <CardTitle>Pond Location</CardTitle>
                <CardDescription>Geographical location of the facility.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[200px] w-full rounded-lg overflow-hidden">
                    <Map />
                </div>
            </CardContent>
        </Card>
    );
}
