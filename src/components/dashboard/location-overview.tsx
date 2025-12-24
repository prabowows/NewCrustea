
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePond } from "@/context/PondContext";
import { MapPin } from "lucide-react";

const DEFAULT_MAP_URL = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.5151917270027!2d110.37757937499671!3d-6.948390693051808!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e708b4e6b7b7f3d%3A0x324a7dee0cee3ee0!2sBINUS%20University%20%40Semarang!5e0!3m2!1sid!2sid!4v1760672269612!5m2!1sid!2sid";

export function LocationOverview() {
  const { selectedPond } = usePond();
  
  // Use the pond's specific URL if it exists, otherwise fall back to the default.
  // Note: For Google Maps embed, we often need to manipulate the URL to make it work correctly in an iframe.
  // This basic implementation assumes the stored URL is already in the correct embed format.
  const mapUrl = selectedPond?.gmaps_url || DEFAULT_MAP_URL;

  return (
    <Card className="border-primary">
      <CardHeader>
        <div className="flex items-center gap-4">
          <MapPin className="h-8 w-8 text-primary dark:text-green-400" />
          <div>
            <CardTitle className="text-primary">{selectedPond?.nama || 'Lokasi Kolam'}</CardTitle>
            <CardDescription>{selectedPond?.lokasi || 'Pilih kolam untuk melihat lokasi'}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="aspect-video w-full overflow-hidden rounded-lg border">
            <iframe 
                key={selectedPond?.id} // Add a key to force re-render when pond changes
                src={mapUrl}
                width="100%" 
                height="100%" 
                style={{ border:0 }} 
                allowFullScreen={true} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
        </div>
      </CardContent>
    </Card>
  );
}
