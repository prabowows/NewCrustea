
"use client";

import { useEffect, useState } from "react";
import { database } from "@/lib/firebase";
import { ref, onValue, set } from "firebase/database";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { initialMetrics, type Metric } from "@/lib/data";
import { Power, Zap, GaugeCircle, Waves, Droplets, Thermometer, FlaskConical, Scale, Wind } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";


const iconMap = {
  Power,
  Zap,
  GaugeCircle,
  Waves,
  Droplets,
  Thermometer,
  FlaskConical,
  Scale,
  Wind,
};

const metricKeyMap: { [key: string]: string } = {
    'load-power': 'Load Power',
    'voltage': 'Voltage',
    'current': 'Current',
    'frequency': 'Frequency',
    'do': 'DO',
    'temperature': 'Temp',
    'ph': 'pH',
    'salinity': 'Salinity',
    'pump': 'Pump',
};


export function RealTimeMetrics() {
  const [metrics, setMetrics] = useState<Metric[]>(initialMetrics);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  useEffect(() => {
    if (!mounted) return;

    const dbRef = ref(database, '/device1/water_quality');
    const unsubscribe = onValue(dbRef, (snapshot) => {
      const data = snapshot.val();
      
      if (data) {
        const updatedMetrics = initialMetrics.map(metric => {
          const firebaseKey = metric.id === 'do' ? 'DO' : metric.id === 'ph' ? 'pH' : metric.id === 'temperature' ? 'Temp' : metricKeyMap[metric.id] || metric.id;
          const metricValue = data[firebaseKey];

          let valueWithUnit = 'N/A';
          if (metricValue !== undefined && metricValue !== null) {
            if (typeof metricValue === 'number') {
                valueWithUnit = `${metricValue.toFixed(2)}${metric.unit ? ` ${metric.unit}` : ''}`;
            } else {
                valueWithUnit = `${metricValue}${metric.unit ? ` ${metric.unit}` : ''}`;
            }
          }
          
          return {
            ...metric,
            value: valueWithUnit.trim(),
          };
        });
        setMetrics(updatedMetrics);
      } else {
         const resetMetrics = initialMetrics.map(m => ({ ...m, value: 'N/A' }));
        setMetrics(resetMetrics);
      }
    
      setLoading(false);
    }, (error) => {
      console.error("Firebase read failed: ", error);
       const resetMetrics = initialMetrics.map(m => ({ ...m, value: 'N/A' }));
      setMetrics(resetMetrics);
      setLoading(false);
    });    

    return () => unsubscribe();
  }, [mounted]);

  if (!mounted || loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-9 gap-4">
        {initialMetrics.map((metric) => (
          <Card key={metric.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
               <Skeleton className="h-4 w-4 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-9 gap-4">
      {metrics.map((metric) => {
        const Icon = iconMap[metric.icon as keyof typeof iconMap] || Power;

        if (metric.id === 'pump') {
          const isPumpOn = metric.value === 'ON';
          return (
            <Card key={metric.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <Button 
                  disabled
                  className={cn(
                    "w-full text-lg font-bold",
                    isPumpOn ? "bg-green-500 hover:bg-green-600" : "bg-gray-400 hover:bg-gray-500",
                    "disabled:opacity-100"
                  )}
                >
                  {metric.value}
                </Button>
              </CardContent>
            </Card>
          );
        }

        return (
            <Dialog key={metric.id}>
            <DialogTrigger asChild>
                <Card className="cursor-pointer hover:bg-muted/80 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{metric.value}</div>
                </CardContent>
                </Card>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                    <Icon className="h-5 w-5 text-primary" />
                    {metric.name}
                </DialogTitle>
                <DialogDescription className="pt-4">
                    {metric.description}
                </DialogDescription>
                </DialogHeader>
                <div className="flex items-baseline justify-end gap-2 pt-4">
                <span className="text-sm text-muted-foreground">Current Value:</span>
                <span className="text-3xl font-bold text-primary">{metric.value}</span>
                </div>
            </DialogContent>
            </Dialog>
        );
      })}
    </div>
  );
}
