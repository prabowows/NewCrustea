
"use client";

import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { CartesianGrid, Area, AreaChart, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { format } from 'date-fns';
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@/hooks/use-user";
import { database, db } from "@/lib/firebase";
import { ref, onValue, off } from "firebase/database";
import { collection, query, where, orderBy, limit, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";
import { errorEmitter } from "@/lib/error-emitter";
import { FirestorePermissionError } from "@/lib/errors";
import { usePond } from "@/context/PondContext";

type ParameterKey = 'do' | 'ph' | 'temp' | 'tds';

type ChartData = {
    time: string;
    do: number;
    ph: number;
    temp: number;
    tds: number;
};

type RealtimeReading = {
  do: number;
  ph: number;
  tds: number;
  temp: number;
  timestamp: number;
};

type ChartConfig = {
  [key in ParameterKey]: {
    label: string;
    color: string;
  };
};

const chartConfig: ChartConfig = {
  do: { label: "DO (mg/L)", color: "hsl(var(--chart-1))" },
  ph: { label: "pH", color: "hsl(var(--chart-2))" },
  temp: { label: "Temp (°C)", color: "hsl(var(--chart-3))" },
  tds: { label: "TDS (ppm)", color: "hsl(var(--destructive))" },
};

const parameterOptions: { value: ParameterKey, label: string }[] = [
    { value: 'do', label: 'Dissolved Oxygen (DO)' },
    { value: 'ph', label: 'pH' },
    { value: 'temp', label: 'Temperature' },
    { value: 'tds', label: 'Total Dissolved Solids (TDS)' },
];


export function HistoricalChart() {
  const { user } = useUser();
  const { devices, selectedPond } = usePond();
  const ebiiDeviceId = devices.ebii;

  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedParameter, setSelectedParameter] = useState<ParameterKey>('do');
  
  const readingsBufferRef = useRef<RealtimeReading[]>([]);
  const dataListenerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Setup listeners and intervals once user and device ID are available
   useEffect(() => {
    if (!user || !ebiiDeviceId || !selectedPond) {
      if(dataListenerIntervalRef.current) clearInterval(dataListenerIntervalRef.current);
      return;
    }

    // Listener for real-time data
    const deviceValueRef = ref(database, `/User/${user.uid}/${ebiiDeviceId}/value`);
    const rt_listener = onValue(deviceValueRef, (snapshot) => {
      const value = snapshot.val();
      if (value && typeof value.do === 'number') { 
        readingsBufferRef.current.push({ ...value, timestamp: Date.now() });
      }
    });

    // Interval to process and save data
    dataListenerIntervalRef.current = setInterval(() => {
      const readings = [...readingsBufferRef.current];
      if (readings.length === 0) return;

      readingsBufferRef.current = [];

      const avg = readings.reduce((acc, curr) => {
        acc.do += curr.do;
        acc.ph += curr.ph;
        acc.tds += curr.tds;
        acc.temp += curr.temp;
        return acc;
      }, { do: 0, ph: 0, tds: 0, temp: 0 });

      const count = readings.length;
      const newLogData = {
          pondId: selectedPond.id,
          pondName: selectedPond.nama,
          avg_do: avg.do / count,
          avg_ph: avg.ph / count,
          avg_tds: avg.tds / count,
          avg_temp: avg.temp / count,
          timestamp: serverTimestamp()
      };
      
      const logsCollectionRef = collection(db, "water_quality_logs");
      addDoc(logsCollectionRef, newLogData)
        .catch((serverError) => {
            const permissionError = new FirestorePermissionError({
                path: logsCollectionRef.path,
                operation: 'create',
                requestResourceData: newLogData,
            });
            errorEmitter.emit('permission-error', permissionError);
        });

    }, 60000); // 60 seconds

    return () => {
      off(deviceValueRef, 'value', rt_listener);
      if (dataListenerIntervalRef.current) {
        clearInterval(dataListenerIntervalRef.current);
      }
    };

  }, [user, ebiiDeviceId, selectedPond]);

  // Listen to Firestore for historical data to display in the chart
  useEffect(() => {
    if (!selectedPond?.id) {
        setChartData([]);
        setLoading(false);
        return;
    }
    setLoading(true);
    const q = query(
        collection(db, "water_quality_logs"), 
        where("pondId", "==", selectedPond.id),
        orderBy("timestamp", "desc"), 
        limit(20)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const fetchedData: ChartData[] = [];
        querySnapshot.forEach((doc) => {
            const docData = doc.data();
            if (docData.timestamp) {
                const date = docData.timestamp.toDate();
                fetchedData.push({
                    time: format(date, 'HH:mm'),
                    do: docData.avg_do || 0,
                    ph: docData.avg_ph || 0,
                    temp: docData.avg_temp || 0,
                    tds: docData.avg_tds || 0,
                });
            }
        });

        const sortedData = fetchedData.sort((a, b) => a.time.localeCompare(b.time));
        setChartData(sortedData);
        setLoading(false);
    }, (error) => {
        const permissionError = new FirestorePermissionError({
          path: collection(db, "water_quality_logs").path,
          operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [selectedPond]);

  const activeChartConfig = {
    [selectedParameter]: chartConfig[selectedParameter],
  };

  const uniqueGradientId = `color-${selectedParameter}`;

  return (
    <Card className="border-primary">
      <CardHeader className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
            <CardTitle className="text-primary">Historical Data</CardTitle>
            <CardDescription>Displaying average readings from the last 20 minutes for the selected pond.</CardDescription>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
            <Select value={selectedParameter} onValueChange={(value) => setSelectedParameter(value as ParameterKey)}>
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
        ) : chartData.length === 0 ? (
            <div className="h-[250px] w-full flex flex-col items-center justify-center text-center">
                <p className="font-medium">No Historical Data</p>
                <p className="text-sm text-muted-foreground">Waiting for data or select a pond with data...</p>
            </div>
        ) : (
            <ChartContainer config={activeChartConfig} className="h-[250px] w-full">
            <ResponsiveContainer>
                <AreaChart
                data={chartData}
                margin={{
                    top: 5,
                    right: 10,
                    left: -10,
                    bottom: 0,
                }}
                >
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                    dataKey="time"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    fontSize={12}
                />
                <YAxis 
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => `${value.toFixed(1)}`}
                    fontSize={12}
                    domain={['dataMin - 1', 'dataMax + 1']}
                />
                <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent 
                        indicator="dot" 
                        formatter={(value, name, item) => {
                            const config = chartConfig[selectedParameter];
                            if (!config) return null;
                            const unitLabel = config.label.match(/\(([^)]+)\)/);
                            const unit = unitLabel ? unitLabel[1] : '';
                            return (
                                <div className="flex flex-col">
                                    <span className="font-semibold text-foreground">
                                        {`${(value as number).toFixed(2)} ${unit}`}
                                    </span>
                                    <span className="text-sm text-muted-foreground">
                                        {item.payload.time}
                                    </span>
                                </div>
                            );
                        }}
                    />}
                />
                <defs>
                    <linearGradient id={uniqueGradientId} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={chartConfig[selectedParameter].color} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={chartConfig[selectedParameter].color} stopOpacity={0}/>
                    </linearGradient>
                </defs>
                <Area
                    type="monotone"
                    dataKey={selectedParameter}
                    stroke={chartConfig[selectedParameter].color}
                    fillOpacity={1}
                    fill={`url(#${uniqueGradientId})`}
                    strokeWidth={2}
                    dot={{ r: 4, fill: chartConfig[selectedParameter].color }}
                    activeDot={{ r: 6 }}
                />
                </AreaChart>
            </ResponsiveContainer>
            </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
