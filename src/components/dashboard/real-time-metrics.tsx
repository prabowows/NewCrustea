'use client';

import { useEffect, useState, useRef } from 'react';
import { database } from '@/lib/firebase';
import { ref, onValue, off, Unsubscribe } from 'firebase/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { initialMetrics, type Metric } from '@/lib/data';
import {
  Power,
  Zap,
  GaugeCircle,
  Waves,
  Droplets,
  Thermometer,
  FlaskConical,
  Scale,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useUser } from '@/hooks/use-user';
import { useToast } from '@/hooks/use-toast';
import { usePond } from '@/context/PondContext';

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

const formatValue = (value: any, unit: string) => {
  if (value === undefined || value === null || value === '') return 'N/A';
  if (typeof value === 'number') {
    return `${value.toFixed(2)}${unit ? ` ${unit}` : ''}`;
  }
  return `${value}${unit ? ` ${unit}` : ''}`;
};

type GroupedMetric = {
  name: string;
  icon: string;
  description: string;
  unit: string;
  phases: {
    phase: number;
    value: string;
  }[];
};

export function RealTimeMetrics() {
  const { user } = useUser();
  const { toast } = useToast();
  const { devices, loading: isPondContextLoading } = usePond();
  
  const [metrics, setMetrics] = useState<Metric[]>(initialMetrics);
  const [loading, setLoading] = useState(true);

  // Effect to handle setting up and tearing down Firebase listeners
  useEffect(() => {
    // Show loading skeleton while context is loading or user is not available
    if (isPondContextLoading || !user) {
      setLoading(true);
      return;
    }
  
    const deviceIds = Object.values(devices).filter(Boolean) as string[];
  
    // If no devices are found for the selected pond, reset to N/A and stop loading.
    if (deviceIds.length === 0) {
      setMetrics(initialMetrics);
      setLoading(false);
      return;
    }
  
    const listeners: Unsubscribe[] = [];
  
    // A flag to ensure we only stop the initial loading once.
    let initialLoadsPending = deviceIds.length;
    const checkDoneLoading = () => {
      initialLoadsPending--;
      if (initialLoadsPending <= 0) {
        setLoading(false);
      }
    };
    
    // Set loading to true when we start fetching new device data
    setLoading(true);
  
    deviceIds.forEach(deviceId => {
      const deviceRef = ref(database, `/User/${user.uid}/${deviceId}/value`);
      
      const listener = onValue(deviceRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setMetrics(prevMetrics => 
            prevMetrics.map(metric => {
              const deviceType = (devices.ebii === deviceId) ? 'water_quality' : 'listrik';
              const sourceMatch = metric.source === deviceType;
  
              if (sourceMatch) {
                const firebaseKey = metric.firebaseKey || metric.id;
                const metricValue = data[firebaseKey];
                if (metricValue !== undefined) {
                  return { ...metric, value: formatValue(metricValue, metric.unit) };
                }
              }
              return metric;
            })
          );
        }
        checkDoneLoading();
      }, (error) => {
        console.error(`Firebase Read Error for ${deviceId}:`, error);
        toast({
            variant: "destructive",
            title: "Error Reading Data",
            description: `Could not read from device ${deviceId}.`,
        });
        checkDoneLoading();
      });
  
      listeners.push(() => off(deviceRef, 'value', listener));
    });
  
    // Cleanup function: This is crucial.
    // It runs when the component unmounts OR when dependencies change.
    return () => {
      listeners.forEach(unsubscribe => unsubscribe());
    };
    
  }, [user, devices, isPondContextLoading, toast]);


  const renderMetricCard = (metric: Metric) => {
    const Icon = iconMap[metric.icon as keyof typeof iconMap] || Power;

    return (
      <Dialog key={metric.id}>
        <DialogTrigger asChild>
          <Card className="cursor-pointer hover:bg-muted/80 transition-colors border-primary">
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
            <DialogDescription className="pt-4">{metric.description}</DialogDescription>
          </DialogHeader>
          <div className="flex items-baseline justify-end gap-2 pt-4">
            <span className="text-sm text-muted-foreground">Current Value:</span>
            <span className="text-3xl font-bold text-primary">{metric.value}</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  const ebiiMetrics = metrics.filter((m) =>
    ['do', 'salinity', 'temperature', 'ph'].includes(m.id)
  );
  const smartEnergyMetrics = metrics.filter((m) => m.source === 'listrik');

  const groupedEnergyMetrics = smartEnergyMetrics.reduce(
    (acc, metric) => {
      const baseName = metric.name.replace(/ \d+$/, '');
      const phaseNumber = parseInt(metric.name.slice(-1), 10);

      if (!acc[baseName]) {
        acc[baseName] = {
          name: baseName,
          icon: metric.icon,
          description: metric.description.replace(/ for phase \d/, ''),
          unit: metric.unit,
          phases: [],
        };
      }

      acc[baseName].phases.push({
        phase: phaseNumber,
        value: metric.value,
      });

      acc[baseName].phases.sort((a, b) => a.phase - b.phase);

      return acc;
    },
    {} as Record<string, GroupedMetric>
  );

  
  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4 text-primary">EBII System</h3>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
            {Array(4).fill(0).map((_, i) => (
              <Card key={`sk-ebii-${i}`} className="border-primary">
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
            {Array(3).fill(0).map((_, i) => (
              <Card key={`sk-energy-${i}`} className="border-primary">
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
      <div>
        <h3 className="text-lg font-semibold mb-4 text-primary">EBII System</h3>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
          {ebiiMetrics.map(renderMetricCard)}
        </div>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-4 text-primary">Smart Energy</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
          {Object.values(groupedEnergyMetrics).map((metric) => {
            const Icon = iconMap[metric.icon as keyof typeof iconMap] || Power;
            return (
              <Card key={metric.name} className="border-primary">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <CardTitle className="text-base font-medium">{metric.name}</CardTitle>
                  <Icon className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent className="space-y-2">
                  {metric.phases.map((p) => (
                    <div key={p.phase} className="flex justify-between items-baseline">
                      <span className="text-sm text-muted-foreground">Phase {p.phase}</span>
                      <span className="text-lg font-bold font-mono">{p.value}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
