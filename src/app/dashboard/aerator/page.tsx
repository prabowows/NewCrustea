
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState, useEffect, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Wind, WifiOff, Power, Cpu } from 'lucide-react';
import { database } from '@/lib/firebase';
import { ref, onValue, set, off, DatabaseReference, get } from 'firebase/database';
import { useUser } from '@/hooks/use-user';
import { usePond } from '@/context/PondContext';
import { PondSelector } from '@/components/dashboard/pond-selector';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

type DeviceState = {
  id: string;
  name: string;
  liveStatus: 'ON' | 'OFF' | 'UNKNOWN';
  commandStatus: boolean;
};

export default function DeviceControlPage() {
  const { user } = useUser();
  const { selectedPondId, allDevices, pondDevices, loading: pondLoading } = usePond();
  const { toast } = useToast();
  
  // States for Aerators
  const [aeratorDevices, setAeratorDevices] = useState<DeviceState[]>([]);
  const [loadingAerators, setLoadingAerators] = useState(true);
  const [isBulkAeratorOn, setIsBulkAeratorOn] = useState(false);

  // States for Smart Controls
  const [scDevices, setScDevices] = useState<DeviceState[]>([]);
  const [loadingSc, setLoadingSc] = useState(true);
  const [isBulkScOn, setIsBulkScOn] = useState(false);

  // Find all aerators ('AE') in the selected pond.
  const aeratorDeviceIds = useMemo(() => {
    if (!selectedPondId || !pondDevices[selectedPondId] || !allDevices) return [];
    const devicesInPond = Object.keys(pondDevices[selectedPondId]);
    return devicesInPond.filter(id => allDevices[id]?.tipe === 'AE');
  }, [selectedPondId, pondDevices, allDevices]);

  // Find all smart controls ('RELAY') in the selected pond.
  const scDeviceIds = useMemo(() => {
    if (!selectedPondId || !pondDevices[selectedPondId] || !allDevices) return [];
    const devicesInPond = Object.keys(pondDevices[selectedPondId]);
    return devicesInPond.filter(id => allDevices[id]?.tipe === 'RELAY');
  }, [selectedPondId, pondDevices, allDevices]);


  // Effect for Aerators
  useEffect(() => {
    setLoadingAerators(true);

    if (!user || aeratorDeviceIds.length === 0) {
      setAeratorDevices([]);
      setLoadingAerators(false);
      return;
    }
    
    const fetchInitialAndListen = async () => {
        const initialDevices: DeviceState[] = [];
        const listeners: { ref: DatabaseReference, listener: any }[] = [];

        for (const deviceId of aeratorDeviceIds) {
            const commandRef = ref(database, `/device_commands/${deviceId}/power`);
            const dataRef = ref(database, `/device_data/${deviceId}`);
            try {
                const [commandSnap, dataSnap] = await Promise.all([get(commandRef), get(dataRef)]);
                const deviceData = dataSnap.val();
                initialDevices.push({
                    id: deviceId,
                    name: allDevices[deviceId]?.name || deviceId,
                    liveStatus: deviceData?.status || 'UNKNOWN',
                    commandStatus: commandSnap.val() || false,
                });
                
                const commandListener = onValue(commandRef, (snapshot) => {
                    setAeratorDevices(prev => prev.map(d => d.id === deviceId ? { ...d, commandStatus: snapshot.val() || false } : d));
                });
                listeners.push({ ref: commandRef, listener: commandListener });

                const dataListener = onValue(dataRef, (snapshot) => {
                    setAeratorDevices(prev => prev.map(d => d.id === deviceId ? { ...d, liveStatus: snapshot.val()?.status || 'UNKNOWN' } : d));
                });
                listeners.push({ ref: dataRef, listener: dataListener });
            } catch (error) {
                console.error(`Failed to fetch or listen for aerator ${deviceId}`, error);
            }
        }
        
        setAeratorDevices(initialDevices);
        setLoadingAerators(false);
        
        return () => listeners.forEach(({ ref: r, listener: l }) => off(r, 'value', l));
    }

    const cleanupPromise = fetchInitialAndListen();
    return () => { cleanupPromise.then(cleanup => cleanup && cleanup()); };
  }, [aeratorDeviceIds, allDevices, user]);

  // Effect for Smart Controls
  useEffect(() => {
    setLoadingSc(true);

    if (!user || scDeviceIds.length === 0) {
      setScDevices([]);
      setLoadingSc(false);
      return;
    }
    
    const fetchInitialAndListen = async () => {
        const initialDevices: DeviceState[] = [];
        const listeners: { ref: DatabaseReference, listener: any }[] = [];

        for (const deviceId of scDeviceIds) {
            const commandRef = ref(database, `/device_commands/${deviceId}/power`);
            const dataRef = ref(database, `/device_data/${deviceId}`);
            try {
                const [commandSnap, dataSnap] = await Promise.all([get(commandRef), get(dataRef)]);
                const deviceData = dataSnap.val();
                initialDevices.push({
                    id: deviceId,
                    name: allDevices[deviceId]?.name || deviceId,
                    liveStatus: deviceData?.status || 'UNKNOWN',
                    commandStatus: commandSnap.val() || false,
                });
                
                const commandListener = onValue(commandRef, (snapshot) => {
                    setScDevices(prev => prev.map(d => d.id === deviceId ? { ...d, commandStatus: snapshot.val() || false } : d));
                });
                listeners.push({ ref: commandRef, listener: commandListener });

                const dataListener = onValue(dataRef, (snapshot) => {
                    setScDevices(prev => prev.map(d => d.id === deviceId ? { ...d, liveStatus: snapshot.val()?.status || 'UNKNOWN' } : d));
                });
                listeners.push({ ref: dataRef, listener: dataListener });
            } catch (error) {
                console.error(`Failed to fetch or listen for SC device ${deviceId}`, error);
            }
        }
        
        setScDevices(initialDevices);
        setLoadingSc(false);
        
        return () => listeners.forEach(({ ref: r, listener: l }) => off(r, 'value', l));
    }

    const cleanupPromise = fetchInitialAndListen();
    return () => { cleanupPromise.then(cleanup => cleanup && cleanup()); };
  }, [scDeviceIds, allDevices, user]);

  // Generic handler for individual device
  const handleSetDevice = (deviceId: string, currentCommandStatus: boolean) => {
    if (!user) return;
    const deviceCommandRef = ref(database, `/device_commands/${deviceId}/power`);
    set(deviceCommandRef, !currentCommandStatus).catch((error) => {
        console.error('Firebase write failed:', error);
        toast({
          variant: 'destructive',
          title: 'Update Failed',
          description: 'Could not send command to the device.',
        });
    });
  };
  
  // Generic handler for bulk toggle
  const handleBulkToggle = (
    deviceIds: string[], 
    isBulkOn: boolean, 
    setIsBulkOn: React.Dispatch<React.SetStateAction<boolean>>,
    deviceTypeName: string
  ) => {
      const newCommand = !isBulkOn;
      setIsBulkOn(newCommand);

      const promises = deviceIds.map(deviceId => {
          const commandRef = ref(database, `/device_commands/${deviceId}/power`);
          return set(commandRef, newCommand);
      });

      Promise.all(promises)
        .then(() => {
            toast({
                title: "Bulk Command Sent",
                description: `All ${deviceTypeName}s commanded to turn ${newCommand ? 'ON' : 'OFF'}.`,
            });
        })
        .catch((error) => {
            console.error('Firebase bulk write failed:', error);
            toast({
              variant: 'destructive',
              title: 'Bulk Update Failed',
              description: `Could not send command to all ${deviceTypeName}s.`,
            });
        });
  }

  const renderSkeletons = () => (
     <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-40 w-full" />
    </div>
  );

  const renderDeviceCard = (
    title: string,
    description: string,
    Icon: React.ElementType,
    devices: DeviceState[],
    deviceIds: string[],
    isLoading: boolean,
    isBulkOn: boolean,
    setIsBulkOn: React.Dispatch<React.SetStateAction<boolean>>,
    deviceTypeName: string
  ) => {
     if (pondLoading || isLoading) {
         return (
            <Card className="border-primary">
                <CardHeader>
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-48" />
                </CardHeader>
                <CardContent>
                    {renderSkeletons()}
                </CardContent>
            </Card>
         )
     }

     return (
        <Card className="border-primary">
            <CardHeader>
                <div className="flex items-center gap-3">
                     <Icon className="h-6 w-6 text-primary" />
                    <div>
                        <CardTitle className="text-primary">{title}</CardTitle>
                        <CardDescription>{description}</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {devices.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6">
                        <Card className={cn("flex flex-col items-center justify-center p-6", isBulkOn ? "bg-green-100/50 dark:bg-green-900/20" : "bg-red-100/50 dark:bg-red-900/20")}>
                            <h3 className="text-lg font-medium text-muted-foreground">Kontrol Utama (Semua {deviceTypeName})</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                               Perintah: <span className={cn("font-bold", isBulkOn ? "text-green-600" : "text-red-600")}>{isBulkOn ? 'ON' : 'OFF'}</span>
                            </p>
                            <Button
                                onClick={() => handleBulkToggle(deviceIds, isBulkOn, setIsBulkOn, deviceTypeName)}
                                size="icon"
                                className={cn(
                                    'h-20 w-20 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105',
                                    isBulkOn
                                    ? 'bg-green-500 hover:bg-green-600 text-white'
                                    : 'bg-red-500 hover:bg-red-600 text-white'
                                )}
                            >
                                <Power className="h-10 w-10" />
                            </Button>
                            <p className="text-xs text-muted-foreground mt-4">Mengontrol semua {deviceTypeName} di tambak ini.</p>
                        </Card>

                         <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Status Individual</CardTitle>
                                <CardDescription>Status langsung dan kontrol individual untuk setiap {deviceTypeName}.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Perangkat</TableHead>
                                                <TableHead>Status Langsung</TableHead>
                                                <TableHead className="text-right">Aksi Kontrol</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {devices.map(device => (
                                                <TableRow key={device.id}>
                                                    <TableCell className="font-medium">{device.name}</TableCell>
                                                    <TableCell>
                                                        <Badge variant={device.liveStatus === 'ON' ? 'default' : 'destructive'} className={cn(device.liveStatus === 'ON' && 'bg-success text-success-foreground')}>
                                                            {device.liveStatus}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Button
                                                            onClick={() => handleSetDevice(device.id, device.commandStatus)}
                                                            size="icon"
                                                            variant="outline"
                                                            className={cn(
                                                                'h-10 w-10 rounded-full shadow-md transition-colors duration-300',
                                                                device.commandStatus
                                                                ? 'border-green-500 text-green-500 hover:bg-green-500 hover:text-white'
                                                                : 'border-red-500 text-red-500 hover:bg-red-500 hover:text-white'
                                                            )}
                                                            >
                                                            <Power className="h-5 w-5" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                ) : (
                     <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg">
                        <WifiOff className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-xl font-semibold">Tidak Ada Perangkat Ditemukan</h3>
                        <p className="text-muted-foreground mt-2">
                            Tidak ada perangkat '{deviceTypeName}' yang terhubung ke tambak yang dipilih.
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
     )
  }

  return (
    <div className="space-y-4">
        <PondSelector />
        
        {!user ? (
            <Card className="border-primary">
                <CardHeader>
                <CardTitle className="text-primary">Kontrol Perangkat</CardTitle>
                <CardDescription>Please log in to manage the devices.</CardDescription>
                </CardHeader>
            </Card>
        ) : (
            <div className="space-y-4">
                {renderDeviceCard(
                    "Kontrol Aerator (Kincir)",
                    "Kelola semua sistem kincir untuk tambak yang dipilih.",
                    Wind,
                    aeratorDevices,
                    aeratorDeviceIds,
                    loadingAerators,
                    isBulkAeratorOn,
                    setIsBulkAeratorOn,
                    "Kincir"
                )}
                {renderDeviceCard(
                    "Kontrol Smart Control",
                    "Kelola semua perangkat Smart Control untuk tambak yang dipilih.",
                    Cpu,
                    scDevices,
                    scDeviceIds,
                    loadingSc,
                    isBulkScOn,
                    setIsBulkScOn,
                    "Smart Control"
                )}
            </div>
        )}
    </div>
  );
}

    

    