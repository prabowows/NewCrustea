
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Power, CalendarDays } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

type Day = 'Sun' | 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat';

type DailySchedule = {
  onTime: string;
  offTime: string;
  enabled: boolean;
};

type ScheduleState = Record<Day, DailySchedule>;

const initialScheduleState: ScheduleState = {
  Sun: { onTime: '', offTime: '', enabled: false },
  Mon: { onTime: '', offTime: '', enabled: false },
  Tue: { onTime: '', offTime: '', enabled: false },
  Wed: { onTime: '', offTime: '', enabled: false },
  Thu: { onTime: '', offTime: '', enabled: false },
  Fri: { onTime: '', offTime: '', enabled: false },
  Sat: { onTime: '', offTime: '', enabled: false },
};

const daysOfWeek: { key: Day; label: string }[] = [
    { key: 'Sun', label: 'Sunday' },
    { key: 'Mon', label: 'Monday' },
    { key: 'Tue', label: 'Tuesday' },
    { key: 'Wed', label: 'Wednesday' },
    { key: 'Thu', label: 'Thursday' },
    { key: 'Fri', label: 'Friday' },
    { key: 'Sat', label: 'Saturday' },
];


export function AeratorControl() {
  const [isAeratorOn, setIsAeratorOn] = useState(true);
  const [timeoutInput, setTimeoutInput] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [schedule, setSchedule] = useState<ScheduleState>(initialScheduleState);
  const { toast } = useToast();

  useEffect(() => {
    if (!isTimerRunning || countdown <= 0) {
      if (isTimerRunning) {
        toast({
            title: "Timer Finished",
            description: "Aerator has been turned off.",
        });
        setIsAeratorOn(false);
      }
      setIsTimerRunning(false);
      setCountdown(0);
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prevCountdown) => prevCountdown - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isTimerRunning, countdown, toast]);

  const handleApplyTimeout = () => {
    const minutes = parseInt(timeoutInput, 10);
    if (isNaN(minutes) || minutes <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid Input",
        description: "Please enter a valid number of minutes.",
      });
      return;
    }
    setCountdown(minutes * 60);
    setIsTimerRunning(true);
    toast({
      title: "Timer Set",
      description: `Aerator will turn off automatically in ${minutes} minute(s).`,
    });
  };

  const handleCancelTimer = () => {
    setIsTimerRunning(false);
    setCountdown(0);
    toast({
        title: "Timer Cancelled",
        description: "The auto-off timer has been cancelled.",
    });
  };

  const handleScheduleChange = (day: Day, field: keyof DailySchedule, value: string | boolean) => {
    setSchedule(prev => ({
        ...prev,
        [day]: {
            ...prev[day],
            [field]: value,
        },
    }));
  };

  const handleSaveSchedule = () => {
    const activeSchedules = Object.entries(schedule).filter(([, details]) => details.enabled);

    if (activeSchedules.length === 0) {
        toast({
            variant: "destructive",
            title: "No Schedule Active",
            description: "Please enable and configure a schedule for at least one day.",
        });
        return;
    }
    
    console.log("Saving schedule:", schedule);
    toast({
      title: "Schedule Saved",
      description: "Your daily aerator schedules have been updated.",
    });
  };


  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };


  return (
    <Card>
      <CardHeader>
        <CardTitle>Aerator Control</CardTitle>
        <CardDescription>Remotely manage the main aerator system.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader className="p-4 pb-2">
                <CardTitle className="text-base">Master Control</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
                <p className="text-sm text-muted-foreground">Status</p>
                <p className={cn("text-2xl font-bold", isAeratorOn ? "text-primary" : "text-destructive")}>
                    {isAeratorOn ? 'ACTIVE' : 'INACTIVE'}
                </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center justify-center">
              <Button 
                onClick={() => setIsAeratorOn(!isAeratorOn)} 
                size="icon" 
                className={cn(
                  "rounded-full w-20 h-20 text-primary-foreground",
                  isAeratorOn ? "bg-primary hover:bg-primary/90" : "bg-muted-foreground hover:bg-muted-foreground/90"
                )}
                aria-label="Toggle Aerator Power"
              >
                <Power className="h-10 w-10" />
              </Button>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="timer">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="timer">Auto-off Timer</TabsTrigger>
            <TabsTrigger value="schedule">Daily Schedule</TabsTrigger>
          </TabsList>
          <TabsContent value="timer" className="mt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                  <Label htmlFor="aerator-timeout">Set Duration</Label>
                  <div className="flex space-x-2">
                      <Input 
                        id="aerator-timeout" 
                        type="number" 
                        placeholder="e.g., 30"
                        value={timeoutInput}
                        onChange={(e) => setTimeoutInput(e.target.value)}
                        disabled={isTimerRunning}
                      />
                      <Button onClick={handleApplyTimeout} className="whitespace-nowrap" disabled={isTimerRunning}>Set (minutes)</Button>
                  </div>
                  <p className="text-xs text-muted-foreground">The aerator will turn off after the timer ends.</p>
              </div>
              {isTimerRunning && (
                <div className="space-y-2 rounded-lg border border-dashed p-4 text-center">
                    <p className="text-sm text-muted-foreground">Turning off in:</p>
                    <p className="text-4xl font-bold font-mono">{formatTime(countdown)}</p>
                    <Button variant="outline" size="sm" onClick={handleCancelTimer}>Cancel Timer</Button>
                </div>
              )}
            </div>
          </TabsContent>
          <TabsContent value="schedule" className="mt-4">
            <div className="space-y-4">
                <Card className="border-dashed">
                    <CardHeader className="p-4">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <CalendarDays className="h-5 w-5" />
                            <h3 className="font-semibold text-foreground">Set Weekly Schedule</h3>
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 space-y-4">
                        {daysOfWeek.map((day, index) => (
                            <div key={day.key}>
                                <div className="flex items-center justify-between">
                                    <Label htmlFor={`schedule-switch-${day.key}`} className="font-medium">{day.label}</Label>
                                    <Switch
                                        id={`schedule-switch-${day.key}`}
                                        checked={schedule[day.key].enabled}
                                        onCheckedChange={(checked) => handleScheduleChange(day.key, 'enabled', checked)}
                                    />
                                </div>
                                <div className={cn(
                                    "grid grid-cols-2 gap-2 mt-2 transition-all duration-300 ease-in-out",
                                    schedule[day.key].enabled ? "max-h-20 opacity-100" : "max-h-0 opacity-0 overflow-hidden"
                                )}>
                                    <div className="space-y-1">
                                        <Label htmlFor={`on-time-${day.key}`} className="text-xs">Turn On</Label>
                                        <Input 
                                            id={`on-time-${day.key}`} 
                                            type="time" 
                                            value={schedule[day.key].onTime}
                                            onChange={(e) => handleScheduleChange(day.key, 'onTime', e.target.value)}
                                            disabled={!schedule[day.key].enabled}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor={`off-time-${day.key}`} className="text-xs">Turn Off</Label>
                                        <Input 
                                            id={`off-time-${day.key}`} 
                                            type="time"
                                            value={schedule[day.key].offTime}
                                            onChange={(e) => handleScheduleChange(day.key, 'offTime', e.target.value)}
                                            disabled={!schedule[day.key].enabled}
                                        />
                                    </div>
                                </div>
                                {index < daysOfWeek.length - 1 && <Separator className="mt-4" />}
                            </div>
                        ))}
                    </CardContent>
                </Card>
                <Button onClick={handleSaveSchedule} className="w-full">Save All Schedules</Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
