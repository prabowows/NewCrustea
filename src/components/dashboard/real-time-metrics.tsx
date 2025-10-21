
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { metrics } from "@/lib/data";

export function RealTimeMetrics() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {metrics.map((metric) => (
        <Dialog key={metric.id}>
          <DialogTrigger asChild>
            <Card className="cursor-pointer hover:bg-muted/80 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
                <metric.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
              </CardContent>
            </Card>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <metric.icon className="h-5 w-5 text-primary" />
                {metric.name}
              </DialogTitle>
              <DialogDescription className="pt-4">
                {metric.description}
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-baseline justify-end gap-2 pt-4">
              <span className="text-sm text-muted-foreground">Current Value:</span>
              <span className="text-3xl font-bold text-primary">{metric.value}</span>
            </div>
          </DialogContent>
        </Dialog>
      ))}
    </div>
  );
}
