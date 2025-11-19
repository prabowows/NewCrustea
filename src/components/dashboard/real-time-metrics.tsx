
"use client";

import { useEffect, useState } from "react";
import { database, databaseWater } from "@/lib/firebase";
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


const formatValue = (value: any, unit: string) => {
    if (value === undefined || value === null || value === '') return 'N/A';
    if (typeof value === 'number') {
        return `${value.toFixed(2)}${unit ? ` ${unit}` : ''}`;
    }
    return `${value}${unit ? ` ${unit}` : ''}`;
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

    const listrikRef = ref(database, '/device4/listrik');
    const waterRef = ref(databaseWater, '/device1/water_quality');

    const updateMetrics = (data: any, source: 'listrik' | 'water_quality') => {
      if (!data) return;

      setMetrics(prevMetrics => {
        return prevMetrics.map(metric => {
          if (metric.source === source) {
            const firebaseKey = metric.firebaseKey || metric.id;
            const metricValue = data[firebaseKey];
            return {
              ...metric,
              value: formatValue(metricValue, metric.unit),
            };
          }
          return metric;
        });
      });
    };

    const unsubListrik = onValue(listrikRef, (snapshot) => {
        updateMetrics(snapshot.val(), 'listrik');
        setLoading(false);
    }, (error) => {
        console.error("Firebase 'listrik' read failed: ", error);
        setLoading(false);
    });

    const unsubWater = onValue(waterRef, (snapshot) => {
        updateMetrics(snapshot.val(), 'water_quality');
        setLoading(false);
    }, (error) => {
        console.error("Firebase 'water_quality' read failed: ", error);
        setLoading(false);
    });

    return () => {
      unsubListrik();
      unsubWater();
    };
  }, [mounted]);

  if (!mounted) {
    return null;
  }
  
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-9 gap-4">
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
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-9 gap-4">
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
