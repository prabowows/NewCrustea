"use client";

import dynamic from 'next/dynamic';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useMemo } from 'react';

// Dynamically import the map component with SSR turned off
const LeafletMap = dynamic(
  () => import('@/components/dashboard/leaflet-map'),
  { 
    loading: () => <div className="h-[200px] w-full rounded-lg bg-muted animate-pulse" />,
    ssr: false
  }
);

export function LocationMap() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Pond Location</CardTitle>
                <CardDescription>Geographical location of the facility.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[200px] w-full rounded-lg overflow-hidden">
                    <LeafletMap />
                </div>
            </CardContent>
        </Card>
    );
}
