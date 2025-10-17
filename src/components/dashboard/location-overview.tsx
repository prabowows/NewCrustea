"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, ExternalLink } from "lucide-react";

export function LocationOverview() {
  const latitude = 10.7769;
  const longitude = 106.7009;
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

  const handleCardClick = () => {
    window.open(googleMapsUrl, "_blank");
  };

  return (
    <Card 
      onClick={handleCardClick} 
      className="cursor-pointer transition-all hover:shadow-md hover:-translate-y-1"
    >
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-4">
          <MapPin className="h-8 w-8 text-primary" />
          <div>
            <CardTitle>Pond Location</CardTitle>
            <CardDescription>Ho Chi Minh City, Vietnam</CardDescription>
          </div>
        </div>
        <ExternalLink className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Coordinates: {latitude}, {longitude}
        </p>
      </CardContent>
    </Card>
  );
}
