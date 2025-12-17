
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState, useEffect, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Power, CalendarDays, Wifi } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { database } from '@/lib/firebase';
import { ref, onValue, set, off, DatabaseReference } from 'firebase/database';
import { useUser } from '@/hooks/use-user';
import { usePond } from '@/context/PondContext';

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
  const { user } = useUser();
  const { selectedPondId, allDevices, pondDevices, scDevices } = usePond();

  const aeratorDeviceId = useMemo(() => {
    if (!selectedPondId || !pondDevices[selectedPondId]) return null;

    // 1. Find the Smart Control device for the current pond
    const scDeviceKey = Object.keys(pondDevices[selectedPondId] || {}).find(
      key => allDevices[key]?.tipe === 'SC'
    );
    
    if (!scDeviceKey || !scDevices[scDeviceKey]) return null;

    // 2. Find the first Aerator device linked to that Smart Control device
    const aeratorKey = Object.keys(scDevices[scDeviceKey]).find(
        key => allDevices[key]?.tipe === 'AERATOR'
    );

    return aeratorKey || null;

  }, [selectedPondId, allDevices, pondDevices, scDevices]);

  const [isAeratorOn, setIsAeratorOn] = useState(false);
  const [aeratorDisplayStatus, setAeratorDisplayStatus] = useState('OFF');
  const [timeoutInput, setTimeoutInput] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [schedule, setSchedule] = useState<ScheduleState>(initialScheduleState);
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Effect to listen to aerator status from `device_data` with proper cleanup
  useEffect(() => {
    // 1. Reset state to default when device changes
    setIsAeratorOn(false);
    setAeratorDisplayStatus('OFF');

    // 2. Guard clause: If there's no device ID, do nothing.
    if (!aeratorDeviceId) {
      return;
    }

    // 3. Define the specific path for the listener.
    const aeratorDataRef: DatabaseReference = ref(database, `/device_data/${aeratorDeviceId}`);
    
    // 4. Set up the new listener.
    const listener = onValue(
      aeratorDataRef,
      (snapshot) => {
        const value = snapshot.val();
        if (value) {
          setIsAeratorOn(value.power || false);
          setAeratorDisplayStatus(value.status || 'OFF');
        } else {
          // If no data exists, ensure state is reset
          setIsAeratorOn(false);
          setAeratorDisplayStatus('OFF');
        }
      },
      (error) => {
        console.error('Firebase status read failed:', error);
        toast({
          variant: 'destructive',
          title: 'Connection Error',
          description: 'Could not fetch aerator status.',
        });
        // Reset state on error
        setIsAeratorOn(false);
        setAeratorDisplayStatus('OFF');
      }
    );

    // 5. MANDATORY CLEANUP FUNCTION: This is critical.
    // It runs before the effect runs again (if aeratorDeviceId changes) or when the component unmounts.
    return () => {
      off(aeratorDataRef, 'value', listener);
    };
  }, [aeratorDeviceId, toast]); // Dependency array ensures this runs only when the device ID changes.

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isTimerRunning && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prevCountdown) => prevCountdown - 1);
      }, 1000);
    } else if (isTimerRunning && countdown <= 0) {
        toast({
          title: 'Timer Finished',
          description: 'Aerator has been turned off.',
        });
        handleToggleAerator(false);
        setIsTimerRunning(false);
        setCountdown(0);
    }
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTimerRunning, countdown]);

  if (!mounted) {
    return null;
  }

  // Function to send commands to `device_commands`
  const handleToggleAerator = (forceStatus?: boolean) => {
    if (!user || !aeratorDeviceId) return;

    const newStatus = forceStatus !== undefined ? forceStatus : !isAeratorOn;
    // Write to the new `device_commands` path
    const aeratorCommandRef = ref(database, `/device_commands/${aeratorDeviceId}/power`);
    
    set(aeratorCommandRef, newStatus)
      .then(() => {
        toast({
          title: 'Success',
          description: `Command sent to turn aerator ${newStatus ? 'ON' : 'OFF'}.`,
        });
      })
      .catch((error) => {
        console.error('Firebase write failed:', error);
        toast({
          variant: 'destructive',
          title: 'Update Failed',
          description: 'Could not update the aerator status.',
        });
      });
  };

  const handleApplyTimeout = () => {
    const minutes = parseInt(timeoutInput, 10);
    if (isNaN(minutes) || minutes <= 0) {
      toast({
        variant: 'destructive',
        title: 'Invalid Input',
        description: 'Please enter a valid number of minutes.',
      });
      return;
    }

    handleToggleAerator(true);
    setCountdown(minutes * 60);
    setIsTimerRunning(true);
    toast({
      title: 'Timer Set',
      description: `Aerator turned ON. It will turn off automatically in ${minutes} minute(s).`,
    });
  };

  const handleCancelTimer = () => {
    setIsTimerRunning(false);
    setCountdown(0);
    toast({
      title: 'Timer Cancelled',
      description: 'The auto-off timer has been cancelled.',
    });
  };

  const handleScheduleChange = (
    day: Day,
    field: keyof DailySchedule,
    value: string | boolean
  ) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
  };

  const handleSaveSchedule = () => {
    // Schedule saving logic is not implemented with the new RTDB structure.
    // This is a placeholder.
    console.log('Saving schedule:', schedule);
    toast({
      title: 'Schedule Saved (Placeholder)',
      description: 'Your daily aerator schedules have been updated.',
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  if (!user) {
     return (
       <Card className="border-primary">
         <CardHeader>
           <CardTitle className="text-primary">Aerator Control</CardTitle>
           <CardDescription>Please log in to manage the aerator system.</CardDescription>
         </CardHeader>
       </Card>
     );
  }

  if (!aeratorDeviceId) {
     return (
       <Card className="border-primary">
         <CardHeader>
           <CardTitle className="text-primary">Aerator Control</CardTitle>
           <CardDescription>No aerator device found for the selected pond.</CardDescription>
         </CardHeader>
       </Card>
     );
  }


  return (
    <Card className="border-primary">
      <CardHeader>
        <CardTitle className="text-primary">Aerator Control</CardTitle>
        <CardDescription>
          Remotely manage the main aerator system for the selected pond.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-base font-medium">Live Status</CardTitle>
              <Wifi className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div
                className={cn(
                  'text-4xl font-bold',
                  aeratorDisplayStatus === 'ON'
                    ? 'text-green-600'
                    : 'text-destructive'
                )}
              >
                {aeratorDisplayStatus}
              </div>
              <p className="text-xs text-muted-foreground pt-1">
                Current status reported by the device
              </p>
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
                <p className="text-xs text-muted-foreground">
                  Turn Aerator {isAeratorOn ? 'OFF' : 'ON'}
                </p>
              </div>
              <Button
                onClick={() => handleToggleAerator()}
                size="icon"
                className={cn(
                  'rounded-full w-16 h-16 text-primary-foreground transition-colors duration-300',
                  isAeratorOn
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-green-500 hover:bg-green-600'
                )}
                aria-label="Toggle Aerator Power"
              >
                <Power className="h-8 w-8" />
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
                  <Button
                    onClick={handleApplyTimeout}
                    className="whitespace-nowrap"
                    disabled={isTimerRunning}
                  >
                    Set (minutes)
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  The aerator will turn on and then turn off after the timer ends.
                </p>
              </div>
              {isTimerRunning && (
                <div className="space-y-2 rounded-lg border border-dashed p-4 text-center">
                  <p className="text-sm text-muted-foreground">Turning off in:</p>
                  <p className="text-4xl font-bold font-mono">
                    {formatTime(countdown)}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancelTimer}
                  >
                    Cancel Timer
                  </Button>
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
                    <h3 className="font-semibold text-foreground">
                      Set Weekly Schedule
                    </h3>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-4">
                  {daysOfWeek.map((day, index) => (
                    <div key={day.key}>
                      <div className="flex items-center justify-between">
                        <Label
                          htmlFor={`schedule-switch-${day.key}`}
                          className="font-medium"
                        >
                          {day.label}
                        </Label>
                        <Switch
                          id={`schedule-switch-${day.key}`}
                          checked={schedule[day.key].enabled}
                          onCheckedChange={(checked) =>
                            handleScheduleChange(day.key, 'enabled', checked)
                          }
                        />
                      </div>
                      <div
                        className={cn(
                          'grid grid-cols-2 gap-2 mt-2 transition-all duration-300 ease-in-out',
                          schedule[day.key].enabled
                            ? 'max-h-20 opacity-100'
                            : 'max-h-0 opacity-0 overflow-hidden'
                        )}
                      >
                        <div className="space-y-1">
                          <Label
                            htmlFor={`on-time-${day.key}`}
                            className="text-xs"
                          >
                            Turn On
                          </Label>
                          <Input
                            id={`on-time-${day.key}`}
                            type="time"
                            value={schedule[day.key].onTime}
                            onChange={(e) =>
                              handleScheduleChange(
                                day.key,
                                'onTime',
                                e.target.value
                              )
                            }
                            disabled={!schedule[day.key].enabled}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label
                            htmlFor={`off-time-${day.key}`}
                            className="text-xs"
                          >
                            Turn Off
                          </Label>
                          <Input
                            id={`off-time-${day.key}`}
                            type="time"
                            value={schedule[day.key].offTime}
                            onChange={(e) =>
                              handleScheduleChange(
                                day.key,
                                'offTime',
                                e.target.value
                              )
                            }
                            disabled={!schedule[day.key].enabled}
                          />
                        </div>
                      </div>
                      {index < daysOfWeek.length - 1 && (
                        <Separator className="mt-4" />
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
              <Button onClick={handleSaveSchedule} className="w-full">
                Save All Schedules
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

    

    