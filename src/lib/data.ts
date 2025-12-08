
export type Metric = {
  id: string;
  name: string;
  value: string;
  unit: string;
  icon: string;
  description: string;
  source: 'EBII' | 'Smart_Energy';
};

// This initialMetrics is now mostly for defining the structure and static text,
// the values will be populated dynamically from the new database structure.
export const initialMetrics: Metric[] = [
    // Water Quality Metrics from 'EBII' source
    { id: 'do', name: 'DO', value: 'N/A', unit: 'mg/L', icon: 'Droplets', description: 'Measures the amount of gaseous oxygen dissolved in the pond water.', source: 'EBII' },
    { id: 'temperature', name: 'Temp', value: 'N/A', unit: '°C', icon: 'Thermometer', description: 'Monitors the water temperature.', source: 'EBII' },
    { id: 'ph', name: 'pH', value: 'N/A', unit: '', icon: 'FlaskConical', description: 'Measures the acidity or alkalinity of the water.', source: 'EBII' },
    { id: 'salinity', name: 'TDS', value: 'N/A', unit: 'ppt', icon: 'Scale', description: 'Measures the total dissolved solids, an indicator of salinity.', source: 'EBII' },

    // Power
    { id: 'power1', name: 'Power 1', value: 'N/A', unit: 'W', icon: 'Power', description: 'Measures the electrical power for phase 1.', source: 'Smart_Energy' },
    { id: 'power2', name: 'Power 2', value: 'N/A', unit: 'W', icon: 'Power', description: 'Measures the electrical power for phase 2.', source: 'Smart_Energy' },
    { id: 'power3', name: 'Power 3', value: 'N/A', unit: 'W', icon: 'Power', description: 'Measures the electrical power for phase 3.', source: 'Smart_Energy' },
    // Voltage
    { id: 'voltage1', name: 'Voltage 1', value: 'N/A', unit: 'V', icon: 'Zap', description: 'Monitors the incoming electrical voltage for phase 1.', source: 'Smart_Energy' },
    { id: 'voltage2', name: 'Voltage 2', value: 'N/A', unit: 'V', icon: 'Zap', description: 'Monitors the incoming electrical voltage for phase 2.', source: 'Smart_Energy' },
    { id: 'voltage3', name: 'Voltage 3', value: 'N/A', unit: 'V', icon: 'Zap', description: 'Monitors the incoming electrical voltage for phase 3.', source: 'Smart_Energy' },
    // Current
    { id: 'current1', name: 'Current 1', value: 'N/A', unit: 'A', icon: 'GaugeCircle', description: 'Tracks the amount of electrical current drawn for phase 1.', source: 'Smart_Energy' },
    { id: 'current2', name: 'Current 2', value: 'N/A', unit: 'A', icon: 'GaugeCircle', description: 'Tracks the amount of electrical current drawn for phase 2.', source: 'Smart_Energy' },
    { id: 'current3', name: 'Current 3', value: 'N/A', unit: 'A', icon: 'GaugeCircle', description: 'Tracks the amount of electrical current drawn for phase 3.', source: 'Smart_Energy' },
    // Frequency
    { id: 'frequency1', name: 'Frequency 1', value: 'N/A', unit: 'Hz', icon: 'Waves', description: 'Shows the frequency of the AC electrical supply for phase 1.', source: 'Smart_Energy' },
    { id: 'frequency2', name: 'Frequency 2', value: 'N/A', unit: 'Hz', icon: 'Waves', description: 'Shows the frequency of the AC electrical supply for phase 2.', source: 'Smart_Energy' },
    { id: 'frequency3', name: 'Frequency 3', value: 'N/A', unit: 'Hz', icon: 'Waves', description: 'Shows the frequency of the AC electrical supply for phase 3.', source: 'Smart_Energy' },
    // PF
    { id: 'pf1', name: 'PF 1', value: 'N/A', unit: '', icon: 'Zap', description: 'Power factor for phase 1.', source: 'Smart_Energy' },
    { id: 'pf2', name: 'PF 2', value: 'N/A', unit: '', icon: 'Zap', description: 'Power factor for phase 2.', source: 'Smart_Energy' },
    { id: 'pf3', name: 'PF 3', value: 'N/A', unit: '', icon: 'Zap', description: 'Power factor for phase 3.', source: 'Smart_Energy' },
    // Energy
    { id: 'energy1', name: 'Energy 1', value: 'N/A', unit: 'kWh', icon: 'Power', description: 'Energy consumption for phase 1.', source: 'Smart_Energy' },
    { id: 'energy2', name: 'Energy 2', value: 'N/A', unit: 'kWh', icon: 'Power', description: 'Energy consumption for phase 2.', source: 'Smart_Energy' },
    { id: 'energy3', name: 'Energy 3', value: 'N/A', unit: 'kWh', icon: 'Power', description: 'Energy consumption for phase 3.', source: 'Smart_Energy' },
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
    { id: '4', entityId: 'POND-A02', status: 'Online', do: '7.3 mg/L', ph: '7.4', temperature: '28.1 °C' },
    { id: '5', entityId: 'POND-C01', status: 'Offline', do: 'N/A', ph: 'N/A', temperature: 'N/A' },
];
