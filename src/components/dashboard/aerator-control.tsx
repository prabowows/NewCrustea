
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Power } from "lucide-react";

export function AeratorControl() {
  const [isAeratorOn, setIsAeratorOn] = useState(true);
  const { toast } = useToast();

  const handleApplyTimeout = () => {
    toast({
        title: "Timer Set",
        description: "Aerator will turn off automatically after the specified duration.",
      });
  }

  const handleSetSchedule = () => {
    toast({
        title: "Schedule Set",
        description: "Aerator will now turn on and off at the scheduled times.",
      });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Aerator Control</CardTitle>
        <CardDescription>Remotely manage the main aerator system.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4 rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="aerator-status" className="flex flex-col space-y-1">
              <span>Master Control</span>
              <span className={cn("text-sm font-bold", isAeratorOn ? "text-success" : "text-muted-foreground")}>
                {isAeratorOn ? 'ACTIVE' : 'INACTIVE'}
              </span>
            </Label>
            <Button 
              onClick={() => setIsAeratorOn(!isAeratorOn)} 
              size="icon" 
              className={cn(
                "rounded-full w-14 h-14 text-white",
                isAeratorOn ? "bg-success hover:bg-success/90" : "bg-muted-foreground hover:bg-muted-foreground/90"
              )}
              aria-label="Toggle Aerator Power"
            >
              <Power className="h-6 w-6" />
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="timer">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="timer">Auto-off Timer</TabsTrigger>
            <TabsTrigger value="schedule">Daily Schedule</TabsTrigger>
          </TabsList>
          <TabsContent value="timer" className="mt-4">
            <div className="space-y-2">
                <Label htmlFor="aerator-timeout">Set Duration</Label>
                <div className="flex space-x-2">
                    <Input id="aerator-timeout" type="number" placeholder="e.g., 30" />
                    <Button onClick={handleApplyTimeout} className="whitespace-nowrap">Set (minutes)</Button>
                </div>
                <p className="text-xs text-muted-foreground">The aerator will turn off after the timer ends.</p>
            </div>
          </TabsContent>
          <TabsContent value="schedule" className="mt-4">
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="turn-on-time">Turn On Time</Label>
                    <Input id="turn-on-time" type="time" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="turn-off-time">Turn Off Time</Label>
                    <Input id="turn-off-time" type="time" />
                </div>
                <Button onClick={handleSetSchedule} className="w-full">Set Schedule</Button>
            </div>
          </TabsContent>
        </Tabs>

      </CardContent>
    </Card>
  );
}
