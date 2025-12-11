
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { CartesianGrid, Area, AreaChart, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { collection, query, onSnapshot, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { format } from 'date-fns';
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type ParameterKey = 'do' | 'ph' | 'temp' | 'tds';

type ChartData = {
    time: string;
    do: number;
    ph: number;
    temp: number;
    tds: number;
};

type ChartConfig = {
  [key in ParameterKey]: {
    label: string;
    color: string;
  };
};

const chartConfig: ChartConfig = {
  do: {
    label: "DO (mg/L)",
    color: "hsl(var(--primary))",
  },
  ph: {
    label: "pH",
    color: "hsl(var(--chart-2))",
  },
  temp: {
    label: "Temp (°C)",
    color: "hsl(var(--chart-3))",
  },
  tds: {
    label: "TDS (ppm)",
    color: "hsl(var(--destructive))",
  },
};

const parameterOptions: { value: ParameterKey, label: string }[] = [
    { value: 'do', label: 'Dissolved Oxygen (DO)' },
    { value: 'ph', label: 'pH' },
    { value: 'temp', label: 'Temperature' },
    { value: 'tds', label: 'Total Dissolved Solids (TDS)' },
];

export function HistoricalChart() {
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedParameter, setSelectedParameter] = useState<ParameterKey>('do');

  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, "water_quality_logs"), orderBy("timestamp", "desc"), limit(20));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const fetchedData: ChartData[] = [];
        querySnapshot.forEach((doc) => {
            const docData = doc.data();
            if (docData.timestamp) {
                const date = docData.timestamp.toDate();
                fetchedData.push({
                    time: format(date, 'HH:mm'),
                    do: docData.avg_DO || 0,
                    ph: docData.avg_PH || 0,
                    temp: docData.avg_Temp || 0,
                    tds: docData.avg_TDS || 0,
                });
            }
        });
        setData(fetchedData.reverse());
        setLoading(false);
    }, (error) => {
        console.error("Error fetching historical chart data:", error);
        setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const activeChartConfig = {
    [selectedParameter]: chartConfig[selectedParameter],
  };

  const uniqueGradientId = `color-${selectedParameter}`;

  return (
    <Card>
      <CardHeader className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
            <CardTitle className="text-primary">Historical Data</CardTitle>
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
            <Select defaultValue="live">
                <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="live">Live (Last 20 entries)</SelectItem>
                    <SelectItem value="24h" disabled>Last 24 hours</SelectItem>
                    <SelectItem value="7d" disabled>Last 7 days</SelectItem>
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
            <ChartContainer config={activeChartConfig} className="h-[250px] w-full">
            <ResponsiveContainer>
                <AreaChart
                data={data}
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
                        formatter={(value) => {
                            const config = chartConfig[selectedParameter];
                            if (!config) return null;
                            const unit = config.label.split(' ')[1] || '';
                            return (
                                <div className="flex flex-col">
                                    <span className="font-semibold text-foreground">
                                        {`${(value as number).toFixed(2)} ${unit}`}
                                    </span>
                                    <span className="text-sm text-muted-foreground">
                                        {config.label.split(' ')[0]}
                                    </span>
                                </div>
                            );
                        }}
                    />}
                />
                <defs>
                    <linearGradient id={uniqueGradientId} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={chartConfig[selectedParameter].color} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={chartConfig[selectedParameter].color} stopOpacity={0.1}/>
                    </linearGradient>
                </defs>
                <Area
                    type="monotone"
                    dataKey={selectedParameter}
                    stroke={chartConfig[selectedParameter].color}
                    strokeWidth={2}
                    fillOpacity={1}
                    fill={`url(#${uniqueGradientId})`}
                    name={chartConfig[selectedParameter].label}
                    dot={true}
                />
                </AreaChart>
            </ResponsiveContainer>
            </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
