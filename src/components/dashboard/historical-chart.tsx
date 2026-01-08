
"use client";

import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@/hooks/use-user";
import { usePond } from "@/context/PondContext";
import { database } from '@/lib/firebase';
import { ref, onValue, off, query, orderByChild, limitToLast } from 'firebase/database';
import { AreaChart, CartesianGrid, Area, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { ChartContainer, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";

type ParameterKey = 'do' | 'ph' | 'temp' | 'tds';
type TimeframeKey = 'hour' | 'day' | 'week' | 'month' | 'year';

type HistoricalReading = {
  do: number;
  ph: number;
  tds: number;
  temp: number;
  ts: number;
  time: string; // Formatted timestamp
};

const parameterOptions: { value: ParameterKey, label: string, unit: string }[] = [
    { value: 'do', label: 'Dissolved Oxygen (DO)', unit: 'mg/L' },
    { value: 'ph', label: 'pH', unit: '' },
    { value: 'temp', label: 'Temperature', unit: '°C' },
    { value: 'tds', label: 'Total Dissolved Solids (TDS)', unit: 'ppm' },
];

const timeframeOptions: { value: TimeframeKey, label: string, duration: number }[] = [
    { value: 'hour', label: '1 Jam Terakhir', duration: 60 * 60 * 1000 },
    { value: 'day', label: '24 Jam Terakhir', duration: 24 * 60 * 60 * 1000 },
    { value: 'week', label: '7 Hari Terakhir', duration: 7 * 24 * 60 * 60 * 1000 },
    { value: 'month', label: '30 Hari Terakhir', duration: 30 * 24 * 60 * 60 * 1000 },
    { value: 'year', label: '1 Tahun Terakhir', duration: 365 * 24 * 60 * 60 * 1000 },
];


const chartConfig = {
  do: {
    label: 'DO',
    color: 'hsl(var(--chart-1))',
  },
  ph: {
    label: 'pH',
    color: 'hsl(var(--chart-2))',
  },
  temp: {
    label: 'Temp',
    color: 'hsl(var(--chart-3))',
  },
  tds: {
    label: 'TDS',
    color: 'hsl(var(--chart-4))',
  },
} satisfies ChartConfig;


export function HistoricalChart() {
  const { user } = useUser();
  const { selectedPondId, allDevices, pondDevices } = usePond();
  const [loading, setLoading] = useState(true);
  const [historicalData, setHistoricalData] = useState<HistoricalReading[]>([]);
  const [selectedParameter, setSelectedParameter] = useState<ParameterKey>('do');
  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeframeKey>('day');

  const ebiiDeviceId = useMemo(() => {
    if (!selectedPondId || !pondDevices[selectedPondId]) return null;
    const devicesInPond = pondDevices[selectedPondId];
    return Object.keys(devicesInPond).find(key => allDevices[key]?.tipe === 'EBII') || null;
  }, [selectedPondId, allDevices, pondDevices]);

  useEffect(() => {
    if (!ebiiDeviceId) {
        setHistoricalData([]);
        setLoading(false);
        return;
    }
    setLoading(true);

    const historicalDataRef = ref(database, `/Historical/${ebiiDeviceId}`);
    
    // Fetch the last 200 data points, ordered by timestamp.
    // This avoids issues with incorrect future timestamps while still showing recent data.
    const dataQuery = query(
        historicalDataRef, 
        orderByChild('ts'), 
        limitToLast(200) 
    );
    
    const listener = onValue(dataQuery, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            const processedData: HistoricalReading[] = Object.values(data).map((entry: any) => {
                 const date = new Date(entry.ts);
                 return {
                    ...entry,
                    time: date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }),
                 };
            }).sort((a,b) => a.ts - b.ts);
            
            setHistoricalData(processedData);
        } else {
             setHistoricalData([]);
        }
        setLoading(false);
    }, (error) => {
        console.error("Failed to fetch historical data:", error);
        setHistoricalData([]);
        setLoading(false);
    });

    return () => {
        off(dataQuery, 'value', listener);
    }
  }, [ebiiDeviceId, selectedTimeframe]);

  const selectedParamConfig = useMemo(() => {
      return parameterOptions.find(p => p.value === selectedParameter);
  }, [selectedParameter]);

  return (
    <Card className="border-primary">
      <CardHeader className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
            <CardTitle className="text-primary">Historical Data</CardTitle>
            <CardDescription>
                {ebiiDeviceId 
                    ? `Displaying recent readings from device ${ebiiDeviceId}.`
                    : 'No EBII device found for this pond.'
                }
            </CardDescription>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Select value={selectedParameter} onValueChange={(value) => setSelectedParameter(value as ParameterKey)}>
                <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Select Parameter" />
                </SelectTrigger>
                <SelectContent>
                    {parameterOptions.map(option => (
                         <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Select value={selectedTimeframe} onValueChange={(value) => setSelectedTimeframe(value as TimeframeKey)}>
                <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Select Timeframe" />
                </SelectTrigger>
                <SelectContent>
                    {timeframeOptions.map(option => (
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
        ) : historicalData.length > 0 ? (
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={historicalData}>
                    <defs>
                        <linearGradient id={`color-${selectedParameter}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={`var(--color-${selectedParameter})`} stopOpacity={0.8} />
                        <stop offset="95%" stopColor={`var(--color-${selectedParameter})`} stopOpacity={0.1} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis
                        dataKey="time"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    />
                    <YAxis
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                        unit={selectedParamConfig?.unit}
                        domain={['dataMin - 1', 'dataMax + 1']}
                    />
                     <Tooltip
                        cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1, strokeDasharray: '3 3' }}
                        content={
                            <ChartTooltipContent
                                formatter={(value, name) => (
                                    <div className="flex flex-col">
                                        <span className="text-muted-foreground capitalize">{name}</span>
                                        <span className="font-bold">{`${Number(value).toFixed(2)} ${selectedParamConfig?.unit}`}</span>
                                    </div>
                                )}
                                labelFormatter={(label, payload) => {
                                    if(payload && payload.length > 0) {
                                        const date = new Date(payload[0].payload.ts);
                                        return date.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
                                    }
                                    return label;
                                }}
                            />
                        }
                    />
                    <Area
                        dataKey={selectedParameter}
                        name={selectedParamConfig?.label}
                        type="monotone"
                        stroke={`var(--color-${selectedParameter})`}
                        fill={`url(#color-${selectedParameter})`}
                        strokeWidth={2}
                        dot={{ r: 0 }}
                        activeDot={{ r: 6, strokeWidth: 1, fill: 'white' }}
                    />
                </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        ) : (
            <div className="h-[250px] w-full flex flex-col items-center justify-center text-center bg-muted/50 rounded-lg">
                <p className="font-medium text-muted-foreground">No Historical Data Found</p>
                <p className="text-sm text-muted-foreground">There is no historical data available for this device yet.</p>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
