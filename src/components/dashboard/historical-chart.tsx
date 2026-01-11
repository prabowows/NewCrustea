
"use client";

import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@/hooks/use-user";
import { usePond } from "@/context/PondContext";
import { database } from '@/lib/firebase';
import { ref, onValue, off, query, orderByChild, startAt, get, limitToLast } from 'firebase/database';
import { AreaChart, CartesianGrid, Area, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { ChartContainer, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";

type ParameterKey = 'do' | 'ph' | 'temp' | 'tds';
type TimeRangeKey = '1h' | '24h' | '7d' | '30d' | 'all';

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

const timeRangeOptions: { value: TimeRangeKey, label: string }[] = [
    { value: '1h', label: '1 Jam Terakhir' },
    { value: '24h', label: '24 Jam Terakhir' },
    { value: '7d', label: '7 Hari Terakhir' },
    { value: '30d', label: '30 Hari Terakhir' },
    { value: 'all', label: 'Semua Data' },
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

const aggregateData = (data: HistoricalReading[], timeRange: TimeRangeKey): HistoricalReading[] => {
    if (!data || data.length === 0) return [];

    switch (timeRange) {
        case '1h':
            return data; // No aggregation for 1 hour

        case '24h': {
            const hourlyData: { [key: string]: HistoricalReading } = {};
            data.forEach(d => {
                const date = new Date(d.ts);
                const hourKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${date.getHours()}`;
                // Keep the last reading for each hour
                hourlyData[hourKey] = {
                    ...d,
                    time: date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
                };
            });
            return Object.values(hourlyData);
        }

        case '7d':
        case '30d':
        case 'all': {
            const dailyAverages: { [key: string]: { sum: { [k in ParameterKey]: number }, count: number, ts: number } } = {};
            data.forEach(d => {
                const date = new Date(d.ts);
                const dayKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
                
                if (!dailyAverages[dayKey]) {
                    dailyAverages[dayKey] = { sum: { do: 0, ph: 0, temp: 0, tds: 0 }, count: 0, ts: d.ts };
                }
                dailyAverages[dayKey].sum.do += d.do;
                dailyAverages[dayKey].sum.ph += d.ph;
                dailyAverages[dayKey].sum.temp += d.temp;
                dailyAverages[dayKey].sum.tds += d.tds;
                dailyAverages[dayKey].count += 1;
            });
            
            return Object.entries(dailyAverages).map(([dayKey, value]) => {
                 const avgDate = new Date(value.ts);
                 return {
                    do: value.sum.do / value.count,
                    ph: value.sum.ph / value.count,
                    temp: value.sum.temp / value.count,
                    tds: value.sum.tds / value.count,
                    ts: value.ts,
                    time: avgDate.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' }), // e.g., 'Aug 05'
                 };
            }).sort((a,b) => a.ts - b.ts);
        }
        
        default:
            return data;
    }
}


export function HistoricalChart() {
  const { user } = useUser();
  const { selectedPondId, allDevices, pondDevices } = usePond();
  const [loading, setLoading] = useState(true);
  const [historicalData, setHistoricalData] = useState<HistoricalReading[]>([]);
  const [selectedParameter, setSelectedParameter] = useState<ParameterKey>('do');
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRangeKey>('24h');

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
    let listener: any;

    const fetchData = async () => {
        try {
            if (selectedTimeRange === 'all') {
                const dataQuery = query(historicalDataRef, orderByChild('ts'));
                 listener = onValue(dataQuery, (snapshot) => {
                    handleSnapshot(snapshot);
                }, (error) => {
                    console.error("Failed to fetch all historical data:", error);
                    setHistoricalData([]);
                    setLoading(false);
                });
                return;
            }

            const latestQuery = query(historicalDataRef, orderByChild('ts'), limitToLast(1));
            const latestSnap = await get(latestQuery);

            if (!latestSnap.exists()) {
                setHistoricalData([]);
                setLoading(false);
                return;
            }

            let latestTimestamp = 0;
            latestSnap.forEach((child) => {
                latestTimestamp = child.val().ts;
            });
            
            let startTime = 0;
            switch (selectedTimeRange) {
                case '1h': startTime = latestTimestamp - 3600 * 1000; break;
                case '24h': startTime = latestTimestamp - 24 * 3600 * 1000; break;
                case '7d': startTime = latestTimestamp - 7 * 24 * 3600 * 1000; break;
                case '30d': startTime = latestTimestamp - 30 * 24 * 3600 * 1000; break;
            }

            const dataQuery = query(
                historicalDataRef, 
                orderByChild('ts'),
                startAt(startTime)
            );
            
            listener = onValue(dataQuery, handleSnapshot, (error) => {
                console.error("Failed to fetch historical data:", error);
                setHistoricalData([]);
                setLoading(false);
            });
        } catch (error) {
            console.error("Failed to set up historical data fetch:", error);
            setHistoricalData([]);
            setLoading(false);
        }
    };
    
    const handleSnapshot = (snapshot: any) => {
        const data = snapshot.val();
        if (data) {
            const rawData: HistoricalReading[] = Object.values(data).map((entry: any) => {
                 const date = new Date(entry.ts);
                 return {
                    ...entry,
                    time: date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }),
                 };
            }).sort((a,b) => a.ts - b.ts);
            
            const aggregated = aggregateData(rawData, selectedTimeRange);
            setHistoricalData(aggregated);
        } else {
             setHistoricalData([]);
        }
        setLoading(false);
    }

    fetchData();

    return () => {
        if(listener) {
             const queryRef = query(historicalDataRef, orderByChild('ts'));
             off(queryRef, 'value', listener);
        }
    }
  }, [ebiiDeviceId, selectedTimeRange]);

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
                <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Select Parameter" />
                </SelectTrigger>
                <SelectContent>
                    {parameterOptions.map(option => (
                         <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Select value={selectedTimeRange} onValueChange={(value) => setSelectedTimeRange(value as TimeRangeKey)}>
                <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Select Time Range" />
                </SelectTrigger>
                <SelectContent>
                    {timeRangeOptions.map(option => (
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
                <p className="text-sm text-muted-foreground">There is no historical data available for this device or time range.</p>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
