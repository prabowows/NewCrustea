"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import dynamic from 'next/dynamic';

const LeafletMap = dynamic(() => import('./leaflet-map'), {
  ssr: false,
  loading: () => <div className="h-[200px] w-full rounded-lg bg-muted animate-pulse" />,
});

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
