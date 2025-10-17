"use client"

import dynamic from 'next/dynamic'

const LeafletMap = dynamic(() => import('./leaflet-map'), { 
  ssr: false,
  loading: () => <div className="h-[268px] w-full rounded-lg bg-muted animate-pulse" />
});

export function LocationMap() {
    return <LeafletMap />
}
