
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { usePond } from '@/context/PondContext';
import { database } from '@/lib/firebase';
import { ref, onValue, off, type DatabaseReference } from 'firebase/database';
import { Skeleton } from '../ui/skeleton';

type ParameterData = {
  id: string;
  entityId: string;
  status: 'Online' | 'Offline' | 'Warning';
  do: string;
  ph: string;
  temperature: string;
};

const INITIAL_STATE: ParameterData = {
  id: '1',
  entityId: 'N/A',
  status: 'Offline',
  do: 'N/A',
  ph: 'N/A',
  temperature: 'N/A',
};

export function ParameterAnalysis() {
  const { selectedPond, allDevices, pondDevices, loading: pondLoading } = usePond();
  const [data, setData] = useState<ParameterData>(INITIAL_STATE);
  const [loading, setLoading] = useState(true);

  const ebiiDeviceId = useMemo(() => {
    if (!selectedPond?.id || !pondDevices[selectedPond.id]) return null;
    const devicesInPond = pondDevices[selectedPond.id];
    return Object.keys(devicesInPond).find(key => allDevices[key]?.tipe === 'EBII') || null;
  }, [selectedPond, allDevices, pondDevices]);

  useEffect(() => {
    // Reset state when pond changes
    setLoading(true);
    setData(prev => ({
        ...INITIAL_STATE,
        entityId: selectedPond?.nama || 'N/A',
    }));

    if (!ebiiDeviceId) {
      setLoading(false);
      return;
    }

    const deviceDataRef: DatabaseReference = ref(database, `/device_data/${ebiiDeviceId}`);
    
    const listener = onValue(deviceDataRef, (snapshot) => {
      const value = snapshot.val();
      if (snapshot.exists() && value) {
        setData({
          id: selectedPond?.id || '1',
          entityId: selectedPond?.nama || 'N/A',
          status: 'Online', // Assume online if data is received
          do: value.do !== undefined ? `${Number(value.do).toFixed(2)} mg/L` : 'N/A',
          ph: value.ph !== undefined ? Number(value.ph).toFixed(2) : 'N/A',
          temperature: value.temp !== undefined ? `${Number(value.temp).toFixed(2)} °C` : 'N/A',
        });
      } else {
         setData(prev => ({...prev, status: 'Offline', do: 'N/A', ph: 'N/A', temperature: 'N/A'}));
      }
      setLoading(false);
    }, (error) => {
        console.error("Firebase read failed for parameter analysis:", error);
        setData(prev => ({...prev, status: 'Offline', do: 'N/A', ph: 'N/A', temperature: 'N/A'}));
        setLoading(false);
    });

    return () => {
      off(deviceDataRef, 'value', listener);
    };
  }, [selectedPond, ebiiDeviceId]);

  const getStatusVariant = (status: ParameterData['status']) => {
    switch (status) {
      case 'Online':
        return 'default';
      case 'Warning':
        return 'secondary';
      case 'Offline':
      default:
        return 'destructive';
    }
  };
  
  const renderBody = () => {
      if (loading || pondLoading) {
          return (
             <TableRow>
                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-5 w-20" /></TableCell>
            </TableRow>
          )
      }
      return (
        <TableRow key={data.id}>
            <TableCell className="font-medium">{data.entityId}</TableCell>
            <TableCell>
                <Badge variant={getStatusVariant(data.status)}>
                {data.status}
                </Badge>
            </TableCell>
            <TableCell>{data.do}</TableCell>
            <TableCell>{data.ph}</TableCell>
            <TableCell className="text-right">{data.temperature}</TableCell>
        </TableRow>
      )
  }

  return (
    <Card className="border-primary">
      <CardHeader>
        <CardTitle className="text-primary">Parameter Analysis</CardTitle>
        <CardDescription>
          {ebiiDeviceId 
            ? `Memonitor data dari sensor ${ebiiDeviceId} pada kolam yang dipilih.`
            : `Tidak ada sensor EBII yang terhubung ke kolam ini.`
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>Nama Kolam</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Dissolved Oxygen</TableHead>
                <TableHead>pH Level</TableHead>
                <TableHead className="text-right">Temperature</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {renderBody()}
            </TableBody>
            </Table>
        </div>
      </CardContent>
    </Card>
  );
}
