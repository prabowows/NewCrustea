
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Power, CalendarDays, Wifi } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { database } from "@/lib/firebase"; 
import { ref, onValue, set } from "firebase/database";
import { useDashboard } from "@/contexts/dashboard-context";
import { Skeleton } from "../ui/skeleton";

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
    { key: 'Sun', label: 'Minggu' },
    { key: 'Mon', label: 'Senin' },
    { key: 'Tue', label: 'Selasa' },
    { key: 'Wed', label: 'Rabu' },
    { key: 'Thu', label: 'Kamis' },
    { key: 'Fri', 'label': 'Jumat' },
    { key: 'Sat', 'label': 'Sabtu' },
];

export function AeratorControl() {
  const { userId, selectedPondId, loading: contextLoading } = useDashboard();
  const [isAeratorOn, setIsAeratorOn] = useState(false);
  const [aeratorDisplayStatus, setAeratorDisplayStatus] = useState("OFF");
  const [schedule, setSchedule] = useState<ScheduleState>(initialScheduleState);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (contextLoading || !userId || !selectedPondId) {
        setLoading(true);
        return;
    }

    setLoading(true);
    const aeratorPath = `User/${userId}/Kolam/${selectedPondId}/Device/Aerator`;
    const aeratorRef = ref(database, aeratorPath);
    
    const unsubscribe = onValue(aeratorRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const deviceId = Object.keys(data)[0];
        const deviceData = deviceId ? data[deviceId]['02_Data'] : null;

        if (deviceData) {
            const isOn = deviceData.Is_On === 'true' || deviceData.Is_On === true;
            setIsAeratorOn(isOn);
            setAeratorDisplayStatus(deviceData.Status ? String(deviceData.Status).toUpperCase() : (isOn ? "ON" : "OFF"));
        } else {
            setIsAeratorOn(false);
            setAeratorDisplayStatus("OFF");
        }
      } else {
        setIsAeratorOn(false);
        setAeratorDisplayStatus("OFF");
      }
      setLoading(false);
    }, (error) => {
      console.error("Firebase read failed:", error);
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: "Could not fetch aerator status.",
      });
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId, selectedPondId, contextLoading, toast]);


  const handleToggleAerator = () => {
    if (contextLoading || !userId || !selectedPondId) return;

    const newStatus = !isAeratorOn;
    const aeratorDeviceRef = ref(database, `User/${userId}/Kolam/${selectedPondId}/Device/Aerator`);
    
    onValue(aeratorDeviceRef, (snapshot) => {
        const data = snapshot.val();
        if(data){
            const deviceId = Object.keys(data)[0];
            if(deviceId){
                const controlPath = `User/${userId}/Kolam/${selectedPondId}/Device/Aerator/${deviceId}/02_Data/Is_On`;
                set(ref(database, controlPath), newStatus)
                .then(() => {
                    toast({
                    title: "Success",
                    description: `Command sent to turn aerator ${newStatus ? 'ON' : 'OFF'}.`,
                    });
                })
                .catch((error) => {
                    console.error("Firebase write failed:", error);
                    toast({
                    variant: "destructive",
                    title: "Update Failed",
                    description: "Could not update the aerator status.",
                    });
                });
            } else {
                 toast({ variant: "destructive", title: "Action Failed", description: "No aerator device found for this pond." });
            }
        } else {
            toast({ variant: "destructive", title: "Action Failed", description: "No aerator device configured for this pond." });
        }
     }, { onlyOnce: true });
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
    // In a real app, save to a path like `User/${userId}/Kolam/${selectedPondId}/Schedules`
    console.log("Saving schedule for pond " + selectedPondId + ":", schedule);
    toast({
      title: "Schedule Saved (Simulation)",
      description: "Your daily aerator schedules have been logged. This is a demo.",
    });
  };

   if (loading || contextLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-primary">Aerator Control</CardTitle>
          <CardDescription>Remotely manage the main aerator system.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-4"><Skeleton className="h-5 w-24" /></CardHeader>
              <CardContent><Skeleton className="h-8 w-20" /></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-4"><Skeleton className="h-5 w-24" /></CardHeader>
              <CardContent><Skeleton className="h-16 w-16 rounded-full" /></CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-primary">Aerator Control</CardTitle>
        <CardDescription>Remotely manage the main aerator system.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="text-base font-medium">Live Status</CardTitle>
                <Wifi className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className={cn("text-4xl font-bold", aeratorDisplayStatus === "ON" ? "text-green-600" : "text-destructive")}>
                    {aeratorDisplayStatus}
                </div>
                <p className="text-xs text-muted-foreground pt-1">Current status reported by the device</p>
            </CardContent>
          </Card>
          <Card>
             <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="text-base font-medium">Master Control</CardTitle>
                <Power className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="flex items-center justify-between">
                <div>
                    <p className="text-base font-medium">Send Command</p>
                    <p className="text-xs text-muted-foreground">Command: {isAeratorOn ? 'OFF' : 'ON'}</p>
                </div>
                <Button 
                    onClick={handleToggleAerator}
                    size="icon" 
                    className={cn(
                    "rounded-full w-16 h-16 text-primary-foreground transition-colors duration-300",
                    isAeratorOn
                        ? "bg-red-100 text-red-700 hover:bg-red-200"
                        : "bg-green-100 text-green-700 hover:bg-green-200"
                    )}
                    aria-label="Toggle Aerator Power"
                >
                    <Power className="h-8 w-8" />
                </Button>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-4">
            <Card className="border-dashed">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-primary">
                    <CalendarDays className="h-6 w-6" />
                    Set Weekly Schedule
                  </CardTitle>
                  <CardDescription>Automate aerator operations for each day of the week.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
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
      </CardContent>
    </Card>
  );
}
