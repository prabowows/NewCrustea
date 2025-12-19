
'use client';

import { RealTimeMetrics } from "@/components/dashboard/real-time-metrics";
import { HistoricalChart } from "@/components/dashboard/historical-chart";
import { AlarmsTable } from "@/components/dashboard/alarms-table";
import { ParameterAnalysis } from "@/components/dashboard/parameter-analysis";
import { LocationOverview } from "@/components/dashboard/location-overview";
import { PondSelector } from "@/components/dashboard/pond-selector";
import { usePond } from '@/context/PondContext';
import { AeratorControl } from "@/components/dashboard/aerator-control";

export default function DashboardPage() {
  const { selectedPondId } = usePond();
  return (
    <div className="grid grid-cols-1 gap-4 md:gap-8 lg:grid-cols-3">
       <div className="lg:col-span-2 grid grid-cols-1 gap-4 md:gap-8">
        <PondSelector />
        <LocationOverview />
        <RealTimeMetrics key={`rt-${selectedPondId}`} />
      </div>

      <div className="lg:col-span-1 grid grid-cols-1 gap-4 md:gap-8">
        <AeratorControl key={`ac-${selectedPondId}`} />
      </div>

      <div className="lg:col-span-3 space-y-4 md:space-y-8">
        <HistoricalChart key={`hc-${selectedPondId}`} />
        <ParameterAnalysis />
        <AlarmsTable />
      </div>
    </div>
  );
}
