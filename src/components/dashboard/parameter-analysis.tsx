
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { database } from '@/lib/firebase';
import { ref, onValue } from 'firebase/database';
import { Skeleton } from '../ui/skeleton';

type ParameterData = {
  entityId: string;
  status: 'Online' | 'Offline' | 'Warning';
  do: string;
  ph: string;
  temperature: string;
}

export function ParameterAnalysis() {
  const [data, setData] = useState<ParameterData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const deviceRef = ref(database, 'Device');
    const unsubscribe = onValue(deviceRef, (snapshot) => {
      const val = snapshot.val();
      if (val) {
        setData({
          entityId: val.id_kolam || 'N/A',
          status: 'Online', // Status can be derived from data freshness in a real app
          do: `${val.Tipe?.EBII?.DO || 'N/A'} mg/L`,
          ph: val.Tipe?.EBII?.pH || 'N/A',
          temperature: `${val.Tipe?.EBII?.Temp || 'N/A'} °C`,
        });
      } else {
        setData({
          entityId: 'N/A',
          status: 'Offline',
          do: 'N/A',
          ph: 'N/A',
          temperature: 'N/A',
        });
      }
      setLoading(false);
    }, (error) => {
      console.error("Firebase read failed:", error);
      setData({
          entityId: 'Error',
          status: 'Offline',
          do: 'Error',
          ph: 'Error',
          temperature: 'Error',
      });
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

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
        <CardTitle>Parameter Analysis</CardTitle>
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
                {loading ? (
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
                      No data available.
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
