
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
import { type Metric } from "@/lib/data"; // Keep the type definition
import { Power, Zap, GaugeCircle, Waves, Droplets, Thermometer, FlaskConical, Scale } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboard } from "@/contexts/dashboard-context";

const iconMap = {
  Power, Zap, GaugeCircle, Waves, Droplets, Thermometer, FlaskConical, Scale,
};

const formatValue = (value: any, unit: string) => {
    if (value === undefined || value === null || value === '') return 'N/A';
    if (typeof value === 'number' || (typeof value === 'string' && !isNaN(Number(value)))) {
        return `${Number(value).toFixed(2)}${unit ? ` ${unit}` : ''}`;
    }
    return `${String(value)}${unit ? ` ${unit}` : ''}`;
};

type GroupedMetric = {
    name: string;
    icon: string;
    unit: string;
    phases: { phase: number; value: string; }[];
};

export function RealTimeMetrics() {
  const { userId, selectedPondId, loading: contextLoading } = useDashboard();
  const [ebiiMetrics, setEbiiMetrics] = useState<Metric[]>([]);
  const [smartEnergyMetrics, setSmartEnergyMetrics] = useState<GroupedMetric[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (contextLoading || !userId || !selectedPondId) {
      setLoading(true);
      return;
    }
    
    setLoading(true);
    const devicePath = `User/${userId}/Kolam/${selectedPondId}/Device`;
    const deviceRef = ref(database, devicePath);

    const unsubscribe = onValue(deviceRef, (snapshot) => {
        const devices = snapshot.val();
        
        // Reset states
        setEbiiMetrics([]);
        setSmartEnergyMetrics([]);

        if (!devices) {
            setLoading(false);
            return;
        }

        const { EBII, Smart_Energy } = devices;

        // Process EBII Metrics
        if (EBII) {
            const ebiiDeviceId = Object.keys(EBII)[0];
            const ebiiData = ebiiDeviceId ? EBII[ebiiDeviceId]['02_Data'] : null;
            const newEbiiMetrics: Metric[] = [
                { id: 'do', name: 'DO', value: formatValue(ebiiData?.DO, 'mg/L'), unit: 'mg/L', icon: 'Droplets', description: 'Measures the amount of gaseous oxygen dissolved in the pond water.', source: 'EBII' },
                { id: 'temperature', name: 'Temp', value: formatValue(ebiiData?.Temp, '°C'), unit: '°C', icon: 'Thermometer', description: 'Monitors the water temperature.', source: 'EBII' },
                { id: 'ph', name: 'pH', value: formatValue(ebiiData?.PH, ''), unit: '', icon: 'FlaskConical', description: 'Measures the acidity or alkalinity of the water.', source: 'EBII' },
                { id: 'salinity', name: 'TDS', value: formatValue(ebiiData?.TDS, 'ppt'), unit: 'ppt', icon: 'Scale', description: 'Measures the total dissolved solids, an indicator of salinity.', source: 'EBII' },
            ];
            setEbiiMetrics(newEbiiMetrics);
        }

        // Process Smart Energy Metrics
        if (Smart_Energy) {
            const energyDeviceId = Object.keys(Smart_Energy)[0];
            const energyData = energyDeviceId ? Smart_Energy[energyDeviceId]['02_Data'] : null;

            const metricTypes = ['Power', 'Voltage', 'Current', 'Frequency', 'PF', 'Energy'];
            const units: Record<string, string> = { Power: 'W', Voltage: 'V', Current: 'A', Frequency: 'Hz', PF: '', Energy: 'kWh' };
            const icons: Record<string, string> = { Power: 'Power', Voltage: 'Zap', Current: 'GaugeCircle', Frequency: 'Waves', PF: 'Zap', Energy: 'Power' };

            const newEnergyMetrics = metricTypes.map(type => {
                const metricGroup: GroupedMetric = {
                    name: type,
                    icon: icons[type],
                    unit: units[type],
                    phases: [1, 2, 3].map(p => ({
                        phase: p,
                        value: formatValue(energyData?.[type]?.[`P${p}`], ''), // Unit is at group level
                    }))
                };
                return metricGroup;
            });
            setSmartEnergyMetrics(newEnergyMetrics);
        }
        
        setLoading(false);
    }, (error) => {
        console.error("Firebase read failed: ", error);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [userId, selectedPondId, contextLoading]);

  const renderMetricCard = (metric: Metric) => {
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
  }
  
  if (loading || contextLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4 text-primary">EBII System</h3>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
            {Array(4).fill(0).map((_, i) => (
              <Card key={`sk-ebii-${i}`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-20" />
                   <Skeleton className="h-4 w-4 rounded-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-24" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4 text-primary">Smart Energy</h3>
           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
            {Array(6).fill(0).map((_, i) => (
              <Card key={`sk-energy-${i}`}>
                 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-20" />
                   <Skeleton className="h-4 w-4 rounded-full" />
                </CardHeader>
                <CardContent className="space-y-2 mt-4">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
       {ebiiMetrics.length > 0 && (
        <div>
            <h3 className="text-lg font-semibold mb-4 text-primary">EBII System</h3>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
                {ebiiMetrics.map(renderMetricCard)}
            </div>
        </div>
        )}
       {smartEnergyMetrics.length > 0 && (
        <div>
            <h3 className="text-lg font-semibold mb-4 text-primary">Smart Energy</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
                {smartEnergyMetrics.map((metric) => {
                    const Icon = iconMap[metric.icon as keyof typeof iconMap] || Power;
                    return (
                        <Card key={metric.name}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                                <CardTitle className="text-base font-medium">{metric.name}</CardTitle>
                                <Icon className="h-5 w-5 text-muted-foreground" />
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {metric.phases.map(p => (
                                    <div key={p.phase} className="flex justify-between items-baseline">
                                        <span className="text-sm text-muted-foreground">Phase {p.phase}</span>
                                        <span className="text-lg font-bold font-mono">{p.value} {p.value !== 'N/A' ? metric.unit : ''}</span>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )
                })}
            </div>
        </div>
       )}
        {(ebiiMetrics.length === 0 && smartEnergyMetrics.length === 0) && (
             <Card>
                <CardContent className="pt-6">
                    <p className="text-center text-muted-foreground">No device data found for the selected pond.</p>
                </CardContent>
             </Card>
        )}
    </div>
  );
}
