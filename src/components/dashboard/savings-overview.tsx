
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Leaf, CircleDollarSign, Cloud, Percent } from 'lucide-react';

const savingsData = [
  {
    title: 'Penghematan Energi',
    value: '723',
    unit: 'kWh/tahun',
    icon: Leaf,
  },
  {
    title: 'Penghematan Biaya',
    value: 'Rp 1,08 juta',
    unit: '/ tahun',
    icon: CircleDollarSign,
  },
  {
    title: 'Penurunan Emisi',
    value: '0,59',
    unit: 'ton CO2/tahun',
    icon: Cloud,
  },
  {
    title: 'Penghematan Listrik',
    value: '30',
    unit: '%',
    icon: Percent,
  },
];

export function SavingsOverview() {
  return (
    <div>
        <h3 className="text-lg font-semibold text-primary mb-4">Analisis Penghematan</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {savingsData.map((item) => (
            <Card key={item.title} className="border-primary">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
                <item.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{item.value}</div>
                <p className="text-xs text-muted-foreground">{item.unit}</p>
            </CardContent>
            </Card>
        ))}
        </div>
    </div>
  );
}
