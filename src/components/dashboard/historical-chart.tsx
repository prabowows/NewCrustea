
"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@/hooks/use-user";
import { usePond } from "@/context/PondContext";
import { database } from '@/lib/firebase';
import { ref, onValue, off } from 'firebase/database';

type ParameterKey = 'do' | 'ph' | 'temp' | 'tds';

type RealtimeReading = {
  do: number;
  ph: number;
  tds: number;
  temp: number;
};

const parameterOptions: { value: ParameterKey, label: string }[] = [
    { value: 'do', label: 'Dissolved Oxygen (DO)' },
    { value: 'ph', label: 'pH' },
    { value: 'temp', label: 'Temperature' },
    { value: 'tds', label: 'Total Dissolved Solids (TDS)' },
];


export function HistoricalChart() {
  const { user } = useUser();
  const { selectedPondId, allDevices, pondDevices } = usePond();
  const [loading] = useState(false); // Kept for consistency, but feature is disabled.
  const [selectedParameter, setSelectedParameter] = useState<ParameterKey>('do');

  const ebiiDeviceId = useMemo(() => {
    if (!selectedPondId || !pondDevices[selectedPondId]) return null;
    const devicesInPond = pondDevices[selectedPondId];
    return Object.keys(devicesInPond).find(key => allDevices[key]?.tipe === 'EBII') || null;
  }, [selectedPondId, allDevices, pondDevices]);
  
  const readingsBufferRef = useRef<RealtimeReading[]>([]);
  
  // This useEffect now correctly cleans up the RTDB listener.
  useEffect(() => {
    // 1. Guard clause: Do nothing if user or device ID is missing.
    if (!user || !ebiiDeviceId || !selectedPondId) {
      readingsBufferRef.current = [];
      return;
    }

    // 2. Define the specific path for the listener.
    const deviceDataRef = ref(database, `/device_data/${ebiiDeviceId}`);
    
    // 3. Set up the new listener to populate a buffer (logic is paused but listener is managed).
    const rt_listener = onValue(deviceDataRef, (snapshot) => {
      const value = snapshot.val();
      if (value && typeof value.do === 'number') { 
        // NOTE: This buffer is not currently used to save data, 
        // but the listener management is crucial.
        readingsBufferRef.current.push(value);
      }
    });

    // 4. MANDATORY CLEANUP FUNCTION: This is critical.
    // It runs when the component unmounts or before the effect runs again.
    return () => {
      off(deviceDataRef, 'value', rt_listener);
    };
    
  }, [user, ebiiDeviceId, selectedPondId]);


  return (
    <Card className="border-primary">
      <CardHeader className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
            <CardTitle className="text-primary">Historical Data</CardTitle>
            <CardDescription>Displaying historical readings from the selected pond.</CardDescription>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
            <Select value={selectedParameter} onValueChange={(value) => setSelectedParameter(value as ParameterKey)} disabled>
                <SelectTrigger className="w-full sm:w-[220px]">
                    <SelectValue placeholder="Select Parameter" />
                </SelectTrigger>
                <SelectContent>
                    {parameterOptions.map(option => (
                         <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
            <div className="h-[250px] w-full flex items-center justify-center">
                <Skeleton className="h-full w-full" />
            </div>
        ) : (
            <div className="h-[250px] w-full flex flex-col items-center justify-center text-center bg-muted/50 rounded-lg">
                <p className="font-medium text-muted-foreground">Historical Chart Disabled</p>
                <p className="text-sm text-muted-foreground">This feature is temporarily unavailable pending database migration.</p>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
