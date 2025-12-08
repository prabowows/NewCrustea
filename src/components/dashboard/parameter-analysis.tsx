
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { database } from '@/lib/firebase';
import { ref, onValue } from 'firebase/database';
import { Skeleton } from '../ui/skeleton';
import { useDashboard } from '@/contexts/dashboard-context';

type ParameterData = {
  entityId: string;
  status: 'Online' | 'Offline' | 'Warning';
  do: string;
  ph: string;
  temperature: string;
}

export function ParameterAnalysis() {
  const { userId, selectedPondId, loading: contextLoading } = useDashboard();
  const [data, setData] = useState<ParameterData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (contextLoading || !userId || !selectedPondId) {
      setLoading(true);
      return;
    }

    setLoading(true);
    const deviceRef = ref(database, `User/${userId}/Kolam/${selectedPondId}/Device/EBII`);

    const unsubscribe = onValue(deviceRef, (snapshot) => {
      const val = snapshot.val();
      if (val) {
        const deviceId = Object.keys(val)[0];
        const deviceData = deviceId ? val[deviceId]['02_Data'] : null;

        if (deviceData) {
            setData({
                entityId: selectedPondId,
                status: 'Online', 
                do: `${deviceData.DO || 'N/A'} mg/L`,
                ph: deviceData.PH || 'N/A',
                temperature: `${deviceData.Temp || 'N/A'} °C`,
            });
        } else {
             setData({ entityId: selectedPondId, status: 'Offline', do: 'N/A', ph: 'N/A', temperature: 'N/A' });
        }
      } else {
        setData(null); 
      }
      setLoading(false);
    }, (error) => {
      console.error("Firebase read failed:", error);
      setData({ entityId: selectedPondId, status: 'Offline', do: 'Error', ph: 'Error', temperature: 'Error' });
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId, selectedPondId, contextLoading]);

  const getStatusVariant = (status: ParameterData['status']) => {
    switch (status) {
      case 'Online':
        return 'default';
      case 'Warning':
        return 'secondary';
      case 'Offline':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-primary">Parameter Analysis</CardTitle>
        <CardDescription>Monitor data and parameters for the selected entity.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>Entity ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Dissolved Oxygen</TableHead>
                <TableHead>pH Level</TableHead>
                <TableHead className="text-right">Temperature</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {loading || contextLoading ? (
                  <TableRow>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-[70px] rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
                  </TableRow>
                ) : data ? (
                  <TableRow>
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
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No EBII device data available for pond {selectedPondId}.
                    </TableCell>
                  </TableRow>
                )}
            </TableBody>
            </Table>
        </div>
      </CardContent>
    </Card>
  );
}
