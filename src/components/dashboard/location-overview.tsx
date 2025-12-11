"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";

export function LocationOverview() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <MapPin className="h-8 w-8 text-primary" />
          <div>
            <CardTitle className="text-primary">Pond Location</CardTitle>
            <CardDescription>BINUS University @Semarang</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="aspect-video w-full overflow-hidden rounded-lg border">
            <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.5151917270027!2d110.37757937499671!3d-6.948390693051808!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e708b4e6b7b7f3d%3A0x324a7dee0cee3ee0!2sBINUS%20University%20%40Semarang!5e0!3m2!1sid!2sid!4v1760672269612!5m2!1sid!2sid" 
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
