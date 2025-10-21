import type { Icon } from 'lucide-react';
import { Power, Zap, GaugeCircle, Waves, Droplets, Thermometer, FlaskConical, Scale } from 'lucide-react';

export type Metric = {
  id: string;
  name: string;
  value: string;
  icon: Icon;
  description: string;
};

export const metrics: Metric[] = [
  { id: 'load-power', name: 'Load Power', value: '2.5 kW', icon: Power, description: 'Measures the total electrical power being consumed by the aerator system. Monitoring power helps in managing energy costs and detecting potential motor issues.' },
  { id: 'voltage', name: 'Voltage', value: '220 V', icon: Zap, description: 'Monitors the incoming electrical voltage from the power supply. Stable voltage is crucial for the proper functioning and longevity of the equipment.' },
  { id: 'current', name: 'Current', value: '11.3 A', icon: GaugeCircle, description: 'Tracks the amount of electrical current drawn by the aerator motors. Unusual spikes or drops can indicate mechanical stress or electrical faults.' },
  { id: 'frequency', name: 'Frequency', value: '50 Hz', icon: Waves, description: 'Shows the frequency of the AC electrical supply. In most regions, this should be a stable 50 or 60 Hz.' },
  { id: 'do', name: 'Dissolved Oxygen', value: '6.8 mg/L', icon: Droplets, description: 'Measures the amount of gaseous oxygen dissolved in the pond water. This is a critical parameter for shrimp health and survival.' },
  { id: 'temperature', name: 'Temperature', value: '28.5 °C', icon: Thermometer, description: 'Monitors the water temperature. Temperature affects shrimp metabolism, growth rate, and the water\'s ability to hold dissolved oxygen.' },
  { id: 'ph', name: 'pH Level', value: '7.2', icon: FlaskConical, description: 'Measures the acidity or alkalinity of the water. Shrimp thrive within a specific pH range, and deviations can cause stress or mortality.' },
  { id: 'salinity', name: 'Salinity', value: '15 ppt', icon: Scale, description: 'Measures the concentration of dissolved salts in the water, expressed in parts per thousand (ppt). Salinity is vital for the osmotic balance of shrimp.' },
];

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
