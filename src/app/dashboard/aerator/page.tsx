
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
import { Wind, WifiOff, Power } from 'lucide-react';
import { database } from '@/lib/firebase';
import { ref, onValue, set, off, DatabaseReference, get } from 'firebase/database';
import { useUser } from '@/hooks/use-user';
import { usePond } from '@/context/PondContext';
import { PondSelector } from '@/components/dashboard/pond-selector';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

type AeratorDevice = {
  id: string;
  name: string;
  liveStatus: boolean; // from device_data.power
  commandStatus: boolean; // from device_commands.power
};

export default function AeratorControlPage() {
  const { user } = useUser();
  const { selectedPondId, allDevices, pondDevices, loading: pondLoading } = usePond();
  const { toast } = useToast();
  
  const [aeratorDevices, setAeratorDevices] = useState<AeratorDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [isBulkCommandOn, setIsBulkCommandOn] = useState(false);

  // Simplified logic to directly find all aerators ('AE') in the selected pond.
  const aeratorDeviceIds = useMemo(() => {
    if (!selectedPondId || !pondDevices[selectedPondId] || !allDevices) {
      return [];
    }
    const devicesInPond = Object.keys(pondDevices[selectedPondId]);
    return devicesInPond.filter(id => allDevices[id]?.tipe === 'AE');
  }, [selectedPondId, pondDevices, allDevices]);


  useEffect(() => {
    setLoading(true);

    if (!user || aeratorDeviceIds.length === 0) {
      setAeratorDevices([]);
      setLoading(false);
      return;
    }
    
    const fetchInitialAndListen = async () => {
        const initialAerators: AeratorDevice[] = [];
        const listeners: { ref: DatabaseReference, listener: any }[] = [];

        for (const deviceId of aeratorDeviceIds) {
            // Fetch initial state
            const commandRef = ref(database, `/device_commands/${deviceId}/power`);
            const dataRef = ref(database, `/device_data/${deviceId}/power`);

            try {
                const [commandSnap, dataSnap] = await Promise.all([
                    get(commandRef),
                    get(dataRef)
                ]);

                const newAerator: AeratorDevice = {
                    id: deviceId,
                    name: allDevices[deviceId]?.name || deviceId,
                    liveStatus: dataSnap.val() || false,
                    commandStatus: commandSnap.val() || false,
                };
                initialAerators.push(newAerator);
                
                // Set up listeners
                const commandListener = onValue(commandRef, (snapshot) => {
                    setAeratorDevices(prev => prev.map(d => d.id === deviceId ? { ...d, commandStatus: snapshot.val() || false } : d));
                });
                listeners.push({ ref: commandRef, listener: commandListener });

                const dataListener = onValue(dataRef, (snapshot) => {
                    setAeratorDevices(prev => prev.map(d => d.id === deviceId ? { ...d, liveStatus: snapshot.val() || false } : d));
                });
                listeners.push({ ref: dataRef, listener: dataListener });
            } catch (error) {
                console.error(`Failed to fetch or listen for device ${deviceId}`, error);
                // Optionally add a toast message for the failed device
            }
        }
        
        setAeratorDevices(initialAerators);
        setLoading(false);
        
        return () => {
             listeners.forEach(({ ref: r, listener: l }) => off(r, 'value', l));
        }
    }

    const cleanupPromise = fetchInitialAndListen();
    
    return () => {
        cleanupPromise.then(cleanup => cleanup && cleanup());
    };

  }, [aeratorDeviceIds, allDevices, user]);


  const handleSetAerator = (deviceId: string, currentCommandStatus: boolean) => {
    if (!user) return;
    const aeratorCommandRef = ref(database, `/device_commands/${deviceId}/power`);
    set(aeratorCommandRef, !currentCommandStatus).catch((error) => {
        console.error('Firebase write failed:', error);
        toast({
          variant: 'destructive',
          title: 'Update Failed',
          description: 'Could not send command to the aerator.',
        });
    });
  };
  
  const handleBulkToggle = () => {
      const newCommand = !isBulkCommandOn;
      setIsBulkCommandOn(newCommand);

      const promises = aeratorDeviceIds.map(deviceId => {
          const aeratorCommandRef = ref(database, `/device_commands/${deviceId}/power`);
          return set(aeratorCommandRef, newCommand);
      });

      Promise.all(promises)
        .then(() => {
            toast({
                title: "Bulk Command Sent",
                description: `All aerators commanded to turn ${newCommand ? 'ON' : 'OFF'}.`,
            });
        })
        .catch((error) => {
            console.error('Firebase bulk write failed:', error);
            toast({
              variant: 'destructive',
              title: 'Bulk Update Failed',
              description: 'Could not send command to all aerators.',
            });
        });
  }

  const renderSkeletons = () => (
     <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-40 w-full" />
    </div>
  );

  return (
    <div className="space-y-4">
        <PondSelector />
        
        {!user ? (
            <Card className="border-primary">
                <CardHeader>
                <CardTitle className="text-primary">Aerator Control</CardTitle>
                <CardDescription>Please log in to manage the aerator system.</CardDescription>
                </CardHeader>
            </Card>
        ) : (
            <Card className="border-primary">
                <CardHeader>
                    <div className="flex items-center gap-3">
                         <Wind className="h-6 w-6 text-primary" />
                        <div>
                            <CardTitle className="text-primary">Kontrol Aerator (Kincir)</CardTitle>
                            <CardDescription>
                            Kelola semua sistem kincir untuk tambak yang dipilih.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {pondLoading || loading ? renderSkeletons() : 
                        aeratorDevices.length > 0 ? (
                        <div className="grid grid-cols-1 gap-6">
                            {/* Master Control */}
                            <Card className={cn("flex flex-col items-center justify-center p-6", isBulkCommandOn ? "bg-green-100/50 dark:bg-green-900/20" : "bg-red-100/50 dark:bg-red-900/20")}>
                                <h3 className="text-lg font-medium text-muted-foreground">Kontrol Utama (Semua Kincir)</h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                   Perintah: <span className={cn("font-bold", isBulkCommandOn ? "text-green-600" : "text-red-600")}>{isBulkCommandOn ? 'ON' : 'OFF'}</span>
                                </p>
                                <Button
                                    onClick={handleBulkToggle}
                                    size="icon"
                                    className={cn(
                                        'h-20 w-20 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105',
                                        isBulkCommandOn
                                        ? 'bg-green-500 hover:bg-green-600 text-white'
                                        : 'bg-red-500 hover:bg-red-600 text-white'
                                    )}
                                >
                                    <Power className="h-10 w-10" />
                                </Button>
                                <p className="text-xs text-muted-foreground mt-4">Mengontrol semua kincir di tambak ini.</p>
                            </Card>

                            {/* Individual Status */}
                             <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Status Kincir Individual</CardTitle>
                                    <CardDescription>Status langsung dan kontrol individual untuk setiap kincir.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="rounded-md border">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Kincir</TableHead>
                                                    <TableHead>Status Langsung</TableHead>
                                                    <TableHead className="text-right">Aksi Kontrol</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {aeratorDevices.map(device => (
                                                    <TableRow key={device.id}>
                                                        <TableCell className="font-medium">{device.name}</TableCell>
                                                        <TableCell>
                                                            <Badge variant={device.liveStatus ? 'default' : 'destructive'} className={cn(device.liveStatus && 'bg-success text-success-foreground')}>
                                                                {device.liveStatus ? 'ON' : 'OFF'}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <Button
                                                                onClick={() => handleSetAerator(device.id, device.commandStatus)}
                                                                size="icon"
                                                                variant="outline"
                                                                disabled
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
                            <h3 className="text-xl font-semibold">Tidak Ada Kincir Ditemukan</h3>
                            <p className="text-muted-foreground mt-2">
                                Tidak ada perangkat kincir (aerator) yang terhubung ke tambak yang dipilih.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        )}
    </div>
  );
}
