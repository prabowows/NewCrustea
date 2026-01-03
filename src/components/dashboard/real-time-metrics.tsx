
'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { database } from '@/lib/firebase';
import { ref, onValue, off, type DatabaseReference } from 'firebase/database';
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
import { cn } from '@/lib/utils';


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

// Define a type that includes the raw value for comparison
type MetricWithRawValue = Metric & { rawValue: number | 'N/A' };

const getMetricStatus = (metric: MetricWithRawValue): 'normal' | 'warning' | 'neutral' => {
    if (metric.rawValue === 'N/A' || typeof metric.rawValue !== 'number') {
        return 'neutral';
    }

    const value = metric.rawValue;

    switch (metric.id) {
        case 'ph':
            return value >= 7.5 && value <= 8.5 ? 'normal' : 'warning';
        case 'do':
            return value >= 4 && value <= 8 ? 'normal' : 'warning';
        case 'temperature':
            return value >= 26 && value <= 32 ? 'normal' : 'warning';
        default:
            return 'neutral';
    }
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

const initialEbiiMetrics: MetricWithRawValue[] = initialMetrics
  .filter((m) => m.source === 'water_quality')
  .map(m => ({ ...m, rawValue: 'N/A' }));

const initialEnergyMetrics = initialMetrics.filter((m) => m.source === 'listrik');


export function RealTimeMetrics() {
  const { toast } = useToast();
  const { selectedPondId, allDevices, pondDevices, loading: isPondContextLoading } = usePond();

  const [ebiiMetrics, setEbiiMetrics] = useState<MetricWithRawValue[]>(initialEbiiMetrics);
  const [energyMetrics, setEnergyMetrics] = useState<Metric[]>(initialEnergyMetrics);
  const [isSwitching, setIsSwitching] = useState(false);
  const pondIdRef = useRef(selectedPondId);

  useEffect(() => {
    if (pondIdRef.current !== selectedPondId) {
      setIsSwitching(true);
      pondIdRef.current = selectedPondId;
      const timer = setTimeout(() => setIsSwitching(false), 500); // Animation duration
      return () => clearTimeout(timer);
    }
  }, [selectedPondId]);

  const deviceIds = useMemo(() => {
    if (!selectedPondId || !allDevices || !pondDevices) {
        return { ebii: null, se: null };
    }

    const devicesInPond = pondDevices[selectedPondId];
    if (!devicesInPond) {
      return { ebii: null, se: null };
    }
    
    const findDeviceKey = (type: string, prefix?: string): string | null => {
        return Object.keys(devicesInPond).find(key => 
            allDevices[key]?.tipe === type &&
            (!prefix || key.startsWith(prefix))
        ) || null;
    };

    return {
        ebii: findDeviceKey('EBII'),
        se: findDeviceKey('SE')
    };
  }, [selectedPondId, allDevices, pondDevices]);


  // Effect for EBII device - STRICTLY following the cleanup pattern
  useEffect(() => {
    setEbiiMetrics(initialEbiiMetrics);

    const ebiiDeviceId = deviceIds.ebii;
    if (!ebiiDeviceId) {
      return;
    }
    
    const deviceDataRef: DatabaseReference = ref(database, `/device_data/${ebiiDeviceId}`);
    
    const listener = onValue(deviceDataRef, (snapshot) => {
      const readingData = snapshot.val();

      setEbiiMetrics(prevMetrics => 
        prevMetrics.map(metric => {
          const firebaseKey = metric.firebaseKey || metric.id;
          const rawValue = readingData?.[firebaseKey];
          const numericValue = (rawValue !== undefined && rawValue !== null && !isNaN(parseFloat(rawValue))) ? parseFloat(rawValue) : 'N/A';
          
          return { 
            ...metric, 
            value: formatValue(rawValue, metric.unit),
            rawValue: numericValue
          };
        })
      );
    }, (error) => {
      console.error(`Firebase Read Error for EBII ${ebiiDeviceId}:`, error);
      toast({
          variant: "destructive",
          title: "Error Reading EBII Data",
          description: `Could not read from device ${ebiiDeviceId}.`,
      });
      setEbiiMetrics(initialEbiiMetrics);
    });

    return () => {
      off(deviceDataRef, 'value', listener);
    };
    
  }, [deviceIds.ebii, toast]);

  // Effect for Smart Energy (SE) device - STRICTLY following the cleanup pattern
  useEffect(() => {
    setEnergyMetrics(initialEnergyMetrics);

    const seDeviceId = deviceIds.se;
    if (!seDeviceId) {
      return;
    }
    
    const deviceDataRef: DatabaseReference = ref(database, `/device_data/${seDeviceId}`);

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
      console.error(`Firebase Read Error for SE ${seDeviceId}:`, error);
      toast({
          variant: "destructive",
          title: "Error Reading Energy Data",
          description: `Could not read from device ${seDeviceId}.`,
      });
      setEnergyMetrics(initialEnergyMetrics); // Reset on error
    });

    return () => {
      off(deviceDataRef, 'value', listener);
    };
  }, [deviceIds.se, toast]);


  const renderMetricCard = (metric: MetricWithRawValue) => {
    const Icon = iconMap[metric.icon as keyof typeof iconMap] || Power;
    const status = getMetricStatus(metric);

    return (
      <Dialog key={metric.id}>
        <DialogTrigger asChild>
          <Card className={cn(
            "cursor-pointer hover:bg-muted/80 transition-colors border-primary",
            status === 'warning' && 'bg-destructive/10 dark:bg-destructive/20 border-destructive'
            )}>
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

        if (isNaN(phaseNumber)) {
            // Handle metrics without phase number like 'Power'
             if (!acc[baseName]) {
                acc[baseName] = {
                    name: baseName,
                    icon: metric.icon,
                    description: metric.description,
                    unit: metric.unit,
                    phases: [],
                };
            }
            // For now, we will group them but may need a different display logic
            acc[baseName].phases.push({ phase: 0, value: metric.value });

            return acc;
        };

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

  
  if (isPondContextLoading || isSwitching) {
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
            {Object.keys(groupedEnergyMetrics).map((key, i) => (
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
        <h3 className="text-lg font-semibold text-primary">EBII System</h3>
        {deviceIds.ebii ? (
          <p className="text-xs text-muted-foreground mb-4">
            Device ID: {deviceIds.ebii}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground mb-4">
            No EBII device found for this pond.
          </p>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
          {ebiiMetrics.map(renderMetricCard)}
        </div>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-primary">Smart Energy</h3>
        {deviceIds.se ? (
          <p className="text-xs text-muted-foreground mb-4">
            Device ID: {deviceIds.se}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground mb-4">
            No Smart Energy device found for this pond.
          </p>
        )}
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
                      <span className="text-sm text-muted-foreground">Phase {p.phase === 0 ? '' : p.phase}</span>
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
