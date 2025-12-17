'use client';

import { useEffect, useState, useMemo } from 'react';
import { database } from '@/lib/firebase';
import { ref, onValue, off } from 'firebase/database';
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
  if (value === undefined || value === null || value === '' || value === 'N/A') return 'N/A';
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

const initialEbiiMetrics = initialMetrics.filter((m) => m.source === 'water_quality');
const initialEnergyMetrics = initialMetrics.filter((m) => m.source === 'listrik');


export function RealTimeMetrics() {
  const { toast } = useToast();
  const { selectedPondId, allDevices, pondDevices, loading: isPondContextLoading } = usePond();

  const [ebiiMetrics, setEbiiMetrics] = useState<Metric[]>(initialEbiiMetrics);
  const [energyMetrics, setEnergyMetrics] = useState<Metric[]>(initialEnergyMetrics);

  const deviceIds = useMemo(() => {
    if (!selectedPondId || Object.keys(allDevices).length === 0 || Object.keys(pondDevices).length === 0) {
        return { ebii: null, se: null };
    }

    const devicesInPond = pondDevices[selectedPondId];
    if (!devicesInPond) {
      return { ebii: null, se: null };
    }

    const findDeviceKey = (type: string): string | null => {
      return Object.keys(devicesInPond).find(key => allDevices[key]?.tipe === type) || null;
    };

    return {
        ebii: findDeviceKey('EBII'),
        se: findDeviceKey('SE')
    };
  }, [selectedPondId, allDevices, pondDevices]);


  // Effect for EBII device
  useEffect(() => {
    // Reset to N/A when device changes or is not available
    setEbiiMetrics(initialEbiiMetrics);

    if (!deviceIds.ebii) {
      return; // No device, so no listener to set up
    }
    
    const deviceDataRef = ref(database, `/device_data/${deviceIds.ebii}`);
    
    const listener = onValue(deviceDataRef, (snapshot) => {
      const data = snapshot.val();
      setEbiiMetrics(prevMetrics => 
        prevMetrics.map(metric => {
          const firebaseKey = metric.firebaseKey || metric.id;
          const metricValue = data?.[firebaseKey];
          return { ...metric, value: formatValue(metricValue, metric.unit) };
        })
      );
    }, (error) => {
      console.error(`Firebase Read Error for EBII ${deviceIds.ebii}:`, error);
      toast({
          variant: "destructive",
          title: "Error Reading EBII Data",
          description: `Could not read from device ${deviceIds.ebii}.`,
      });
      setEbiiMetrics(initialEbiiMetrics);
    });

    // CRITICAL: Cleanup function to remove the listener when the component unmounts OR when deviceIds.ebii changes
    return () => {
      off(deviceDataRef, 'value', listener);
    };
    
  }, [deviceIds.ebii, toast]);

  // Effect for Smart Energy (SE) device
  useEffect(() => {
    // Reset to N/A when device changes or is not available
    setEnergyMetrics(initialEnergyMetrics);

    if (!deviceIds.se) {
      return; // No device, so no listener to set up
    }
    
    const deviceDataRef = ref(database, `/device_data/${deviceIds.se}`);

    const listener = onValue(deviceDataRef, (snapshot) => {
      const data = snapshot.val();
      setEnergyMetrics(prevMetrics => 
        prevMetrics.map(metric => {
            const firebaseKey = metric.firebaseKey || metric.id;
            const metricValue = data?.[firebaseKey];
            return { ...metric, value: formatValue(metricValue, metric.unit) };
        })
      );
    }, (error) => {
      console.error(`Firebase Read Error for SE ${deviceIds.se}:`, error);
      toast({
          variant: "destructive",
          title: "Error Reading Energy Data",
          description: `Could not read from device ${deviceIds.se}.`,
      });
      setEnergyMetrics(initialEnergyMetrics);
    });

    // CRITICAL: Cleanup function to remove the listener
    return () => {
      off(deviceDataRef, 'value', listener);
    };
  }, [deviceIds.se, toast]);


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

  const groupedEnergyMetrics = useMemo(() => {
    return energyMetrics.reduce(
      (acc, metric) => {
        const baseName = metric.name.replace(/ \d+$/, '');
        const phaseNumber = parseInt(metric.name.slice(-1), 10);

        if (isNaN(phaseNumber)) return acc;

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
  }, [energyMetrics]);

  
  if (isPondContextLoading) {
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
