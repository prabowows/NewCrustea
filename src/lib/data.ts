import type { LucideIcon } from 'lucide-react';

export type Metric = {
  id: string;
  name: string;
  value: string;
  icon: string; // Now a string key for the icon map
  description: string;
};

export const historicalData = [
    { time: '00:00', do: 5.2 },
    { time: '02:00', do: 5.1 },
    { time: '04:00', do: 5.0 },
    { time: '06:00', do: 5.3 },
    { time: '08:00', do: 5.8 },
    { time: '10:00', do: 6.5 },
    { time: '12:00', do: 7.1 },
    { time: '14:00', do: 7.4 },
    { time: '16:00', do: 7.2 },
    { time: '18:00', do: 6.8 },
    { time: '20:00', do: 6.2 },
    { time: '22:00', do: 5.5 },
];

export type Alarm = {
    id: string;
    originator: string;
    type: string;
    severity: 'High' | 'Medium' | 'Low';
    timestamp: string;
}

export const realTimeAlarms: Alarm[] = [
    { id: '1', originator: 'Pond A-1 Sensor', type: 'DO Level Critical', severity: 'High', timestamp: '2 mins ago' },
    { id: '2', originator: 'Main Power Grid', type: 'Voltage Fluctuation', severity: 'Medium', timestamp: '15 mins ago' },
];

export const historicalAlarms: Alarm[] = [
    { id: '3', originator: 'Pond C-3 Sensor', type: 'pH Out of Range', severity: 'Low', timestamp: '2 hours ago' },
    { id: '4', originator: 'Aerator 5', type: 'Device Offline', severity: 'High', timestamp: 'Yesterday' },
    { id: '5', originator: 'Pond B-2 Sensor', type: 'Temp. Anomaly', severity: 'Medium', timestamp: 'Yesterday' },
];


export type Parameter = {
    id: string;
    entityId: string;
    status: 'Online' | 'Offline' | 'Warning';
    do: string;
    ph: string;
    temperature: string;
}

export const parameters: Parameter[] = [
    { id: '1', entityId: 'POND-A01', status: 'Online', do: '7.1 mg/L', ph: '7.3', temperature: '28.2 °C' },
    { id: '2', entityId: 'POND-A02', status: 'Online', do: '6.9 mg/L', ph: '7.2', temperature: '28.4 °C' },
    { id: '3', entityId: 'POND-B01', status: 'Warning', do: '5.2 mg/L', ph: '7.9', temperature: '29.1 °C' },
    { id: '4', entityId: 'POND-B02', status: 'Online', do: '7.3 mg/L', ph: '7.4', temperature: '28.1 °C' },
    { id: '5', entityId: 'POND-C01', status: 'Offline', do: 'N/A', ph: 'N/A', temperature: 'N/A' },
];
