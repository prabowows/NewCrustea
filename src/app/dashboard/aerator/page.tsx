
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
import { Wind, WifiOff } from 'lucide-react';
import { database } from '@/lib/firebase';
import { ref, onValue, set, off, DatabaseReference } from 'firebase/database';
import { useUser } from '@/hooks/use-user';
import { usePond } from '@/context/PondContext';
import { PondSelector } from '@/components/dashboard/pond-selector';
import { Skeleton } from '@/components/ui/skeleton';

type AeratorDevice = {
  id: string;
  name: string;
  isAeratorOn: boolean;
  displayStatus: string;
};

export default function AeratorControlPage() {
  const { user } = useUser();
  const { selectedPondId, allDevices, pondDevices, scDevices, loading: pondLoading } = usePond();
  const { toast } = useToast();
  
  const [aeratorDevices, setAeratorDevices] = useState<AeratorDevice[]>([]);
  const [loading, setLoading] = useState(true);

  const smartControllerKey = useMemo(() => {
    if (!selectedPondId || !pondDevices[selectedPondId] || !scDevices) return null;

    const devicesInPond = Object.keys(pondDevices[selectedPondId]);
    return devicesInPond.find(key => scDevices[key]);

  }, [selectedPondId, pondDevices, scDevices]);

  const aeratorDeviceIds = useMemo(() => {
    if (!smartControllerKey || !scDevices[smartControllerKey]) return [];
    
    const aeratorIds = Object.keys(scDevices[smartControllerKey]);
    
    // Make sure we only get devices with type 'AE' from the main devices list
    return aeratorIds.filter(id => allDevices[id]?.tipe === 'AE');

  }, [smartControllerKey, scDevices, allDevices]);

  useEffect(() => {
    setLoading(true);

    if (aeratorDeviceIds.length === 0) {
      setAeratorDevices([]);
      setLoading(false);
      return;
    }
    
    const initialAerators = aeratorDeviceIds.map(id => ({
        id,
        name: allDevices[id]?.name || id,
        isAeratorOn: false,
        displayStatus: 'Offline'
    }));
    setAeratorDevices(initialAerators);


    const listeners: { ref: DatabaseReference, listener: any }[] = [];

    aeratorDeviceIds.forEach((deviceId) => {
      const aeratorDataRef = ref(database, `/device_data/${deviceId}`);
      const listener = onValue(aeratorDataRef, (snapshot) => {
        const value = snapshot.val();
        setAeratorDevices(prevDevices => 
            prevDevices.map(device => 
                device.id === deviceId 
                ? {
                    ...device,
                    // The UI status is read from device_data
                    isAeratorOn: value?.power || false,
                    displayStatus: value?.status || 'Offline',
                }
                : device
            )
        );
      });
      listeners.push({ ref: aeratorDataRef, listener });
    });

    setLoading(false);

    return () => {
      listeners.forEach(({ ref: r, listener: l }) => off(r, 'value', l));
    };

  }, [aeratorDeviceIds, allDevices]);


  // This function now sends a specific boolean value to the database
  const handleSetAerator = (deviceId: string, command: boolean) => {
    if (!user) return;

    const aeratorCommandRef = ref(database, `/device_commands/${deviceId}/power`);
    
    set(aeratorCommandRef, command)
      .then(() => {
        toast({
          title: 'Success',
          description: `Command sent to turn aerator ${command ? 'ON' : 'OFF'}.`,
        });
      })
      .catch((error) => {
        console.error('Firebase write failed:', error);
        toast({
          variant: 'destructive',
          title: 'Update Failed',
          description: 'Could not update the aerator status.',
        });
      });
  };

  const renderSkeletons = () => (
     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array(4).fill(0).map((_, i) => (
            <Card key={i}>
                <CardHeader>
                   <Skeleton className="h-6 w-3/4" />
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                    <Skeleton className="h-8 w-20" />
                    <div className="flex gap-2">
                        <Skeleton className="h-10 w-16" />
                        <Skeleton className="h-10 w-16" />
                    </div>
                </CardContent>
            </Card>
        ))}
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
                            <CardTitle className="text-primary">Aerator Bulk Control</CardTitle>
                            <CardDescription>
                            Remotely manage all aerator systems for the selected pond.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {pondLoading || loading ? renderSkeletons() : 
                        aeratorDevices.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {aeratorDevices.map(device => (
                                <Card key={device.id} className="flex flex-col">
                                    <CardHeader className="pb-4">
                                        <CardTitle className="text-lg">{device.name}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="flex-grow flex items-center justify-between">
                                        <div
                                            className={cn(
                                            'text-xl font-bold',
                                            device.isAeratorOn
                                                ? 'text-green-600'
                                                : 'text-destructive'
                                            )}
                                        >
                                            {device.isAeratorOn ? 'ON' : 'OFF'}
                                        </div>
                                        <div className="flex gap-2">
                                           <Button
                                                onClick={() => handleSetAerator(device.id, true)}
                                                disabled={device.isAeratorOn}
                                                className="bg-green-600 hover:bg-green-700 text-white"
                                                size="sm"
                                            >
                                                ON
                                            </Button>
                                            <Button
                                                onClick={() => handleSetAerator(device.id, false)}
                                                disabled={!device.isAeratorOn}
                                                variant="destructive"
                                                size="sm"
                                            >
                                                OFF
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                         <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg">
                            <WifiOff className="h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-xl font-semibold">No Aerator Devices Found</h3>
                            <p className="text-muted-foreground mt-2">
                                There are no aerator devices associated with the selected pond.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        )}
    </div>
  );
}
