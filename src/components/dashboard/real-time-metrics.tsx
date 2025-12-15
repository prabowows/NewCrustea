'use client';

import { useEffect, useState } from 'react';
import { database } from '@/lib/firebase';
import { ref, onValue } from 'firebase/database';
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
  const [metrics, setMetrics] = useState<Metric[]>(initialMetrics);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !user) {
        if (!user && mounted) {
            setLoading(false);
        }
        return;
    }

    const updateMetrics = (data: any, deviceType: 'EBII' | 'SE') => {
      if (!data) return;

      setMetrics((prevMetrics) => {
        return prevMetrics.map((metric) => {
          const sourceMatch =
            (deviceType === 'EBII' && metric.source === 'water_quality') ||
            (deviceType === 'SE' && metric.source === 'listrik');

          if (sourceMatch) {
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
      setLoading(false);
    };

    const userDevicesRef = ref(database, `/User/${user.uid}`);
    const unsubscribeDevices = onValue(
      userDevicesRef,
      (snapshot) => {
        const devices = snapshot.val();
        if (!devices) {
          setLoading(false);
          return;
        }

        const unsubscribers: (() => void)[] = [];

        Object.keys(devices).forEach((deviceId) => {
          const device = devices[deviceId];
          if (device.tipe === 'EBII' || device.tipe === 'SE') {
            const deviceValueRef = ref(database, `/User/${user.uid}/${deviceId}/value`);
            const unsub = onValue(deviceValueRef, (valueSnap) => {
              updateMetrics(valueSnap.val(), device.tipe);
            },
            (error) => {
                // Throw a more specific error for debugging security rules
                throw new Error(`Realtime Database permission denied for path: /User/${user.uid}/${deviceId}/value. Check your security rules.`);
            });
            unsubscribers.push(unsub);
          }
        });
        
        return () => unsubscribers.forEach(unsub => unsub());
      },
      (error) => {
        setLoading(false);
        // Throw a more specific error for debugging security rules
        throw new Error(`Realtime Database permission denied for path: /User/${user.uid}. Check your security rules.`);
      }
    );

    return () => {
      unsubscribeDevices();
    };
  }, [mounted, user]);

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

  if (!mounted) {
    return null;
  }
  
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
