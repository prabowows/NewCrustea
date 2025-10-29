
"use client";

import { useEffect, useState } from "react";
import { database } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Metric } from "@/lib/data";
import { Power, Zap, GaugeCircle, Waves, Droplets, Thermometer, FlaskConical, Scale } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";

const iconMap = {
  Power,
  Zap,
  GaugeCircle,
  Waves,
  Droplets,
  Thermometer,
  FlaskConical,
  Scale,
};

const initialMetrics: Metric[] = [
    { id: 'load-power', name: 'Load Power', value: 'N/A', unit: 'W', icon: 'Power', description: 'Measures the total electrical power being consumed by the aerator system. Monitoring power helps in managing energy costs and detecting potential motor issues.' },
    { id: 'voltage', name: 'Voltage', value: 'N/A', unit: 'V', icon: 'Zap', description: 'Monitors the incoming electrical voltage from the power supply. Stable voltage is crucial for the proper functioning and longevity of the equipment.' },
    { id: 'current', name: 'Current', value: 'N/A', unit: 'A', icon: 'GaugeCircle', description: 'Tracks the amount of electrical current drawn by the aerator motors. Unusual spikes or drops can indicate mechanical stress or electrical faults.' },
    { id: 'frequency', name: 'Frequency', value: 'N/A', unit: 'Hz', icon: 'Waves', description: 'Shows the frequency of the AC electrical supply. In most regions, this should be a stable 50 or 60 Hz.' },
    { id: 'do', name: 'Dissolved Oxygen', value: 'N/A', unit: 'mg/L', icon: 'Droplets', description: 'Measures the amount of gaseous oxygen dissolved in the pond water. This is a critical parameter for shrimp health and survival.' },
    { id: 'temperature', name: 'Temperature', value: 'N/A', unit: '°C', icon: 'Thermometer', description: 'Monitors the water temperature. Temperature affects shrimp metabolism, growth rate, and the water\'s ability to hold dissolved oxygen.' },
    { id: 'ph', name: 'pH Level', value: 'N/A', unit: '', icon: 'FlaskConical', description: 'Measures the acidity or alkalinity of the water. Shrimp thrive within a specific pH range, and deviations can cause stress or mortality.' },
    { id: 'salinity', name: 'Salinity', value: 'N/A', unit: 'ppt', icon: 'Scale', description: 'Measures the concentration of dissolved salts in the water, expressed in parts per thousand (ppt). Salinity is vital for the osmotic balance of shrimp.' },
];

export function RealTimeMetrics() {
  const [metrics, setMetrics] = useState<Metric[]>(initialMetrics);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  useEffect(() => {
    if (!mounted) return;

    // Reference the root of your database
    const dbRef = ref(database, '/');
    const unsubscribe = onValue(dbRef, (snapshot) => {
      const data = snapshot.val();
      
      if (data) {
        const updatedMetrics = initialMetrics.map(metric => {
          // Look for a matching key in the data from Firebase (e.g., data['do'], data['ph'])
          const metricValue = data[metric.id];
          const valueWithUnit = metricValue !== undefined && metricValue !== null 
            ? `${Number(metricValue).toFixed(2)} ${metric.unit}` 
            : 'N/A';
          
          return {
            ...metric,
            value: valueWithUnit.trim(),
          };
        });
        setMetrics(updatedMetrics);
      } else {
        // If there's no data at the root, keep the initial state
        setMetrics(initialMetrics);
      }
    
      setLoading(false);
    }, (error) => {
      console.error("Firebase read failed: ", error);
      setLoading(false);
    });    

    return () => unsubscribe();
  }, [mounted]);

  if (!mounted) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
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

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
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
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {metrics.map((metric) => {
        const Icon = iconMap[metric.icon as keyof typeof iconMap] || Power;
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
