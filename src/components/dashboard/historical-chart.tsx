
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { CartesianGrid, Line, LineChart, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { collection, query, onSnapshot, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { format } from 'date-fns';
import { Skeleton } from "@/components/ui/skeleton";

const chartConfig = {
  do: {
    label: "DO (mg/L)",
    color: "hsl(var(--primary))",
  },
};

type ChartData = {
    time: string;
    do: number;
};

export function HistoricalChart() {
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "water_quality_logs"), orderBy("timestamp", "desc"), limit(20));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const fetchedData: ChartData[] = [];
        querySnapshot.forEach((doc) => {
            const docData = doc.data();
            if (docData.timestamp && docData.avg_DO) {
                // Convert Firestore Timestamp to Date, then format it
                const date = docData.timestamp.toDate();
                fetchedData.push({
                    time: format(date, 'HH:mm'),
                    do: docData.avg_DO,
                });
            }
        });
        // Reverse the data to show oldest first in the chart
        setData(fetchedData.reverse());
        setLoading(false);
    }, (error) => {
        console.error("Error fetching historical chart data:", error);
        setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return (
    <Card>
      <CardHeader className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
            <CardTitle>Historical Data</CardTitle>
            <CardDescription>Dissolved Oxygen (DO) levels over time from Firestore.</CardDescription>
        </div>
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
      </CardHeader>
      <CardContent>
        {loading ? (
            <div className="h-[250px] w-full flex items-center justify-center">
                <Skeleton className="h-full w-full" />
            </div>
        ) : (
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <ResponsiveContainer>
                <LineChart
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
                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                <Line
                    dataKey="do"
                    type="monotone"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={true}
                />
                </LineChart>
            </ResponsiveContainer>
            </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
