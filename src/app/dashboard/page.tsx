
'use client';

import { RealTimeMetrics } from "@/components/dashboard/real-time-metrics";
import { HistoricalChart } from "@/components/dashboard/historical-chart";
import { AlarmsTable } from "@/components/dashboard/alarms-table";
import { ParameterAnalysis } from "@/components/dashboard/parameter-analysis";
import { LocationOverview } from "@/components/dashboard/location-overview";
import { PondSelector } from "@/components/dashboard/pond-selector";
import { usePond } from '@/context/PondContext';

export default function DashboardPage() {
  const { selectedPondId } = usePond();
  return (
    <div className="grid grid-cols-1 gap-4 md:gap-8 lg:grid-cols-2">
       <div className="lg:col-span-2 grid grid-cols-1 gap-4 md:gap-8">
        <PondSelector />
      </div>

      <div className="lg:col-span-1">
        <LocationOverview />
      </div>
      <div className="lg:col-span-1">
         <RealTimeMetrics key={`rt-${selectedPondId}`} />
      </div>


      <div className="lg:col-span-2 space-y-4 md:space-y-8">
        <HistoricalChart key={`hc-${selectedPondId}`} />
        <ParameterAnalysis />
        <AlarmsTable />
      </div>
    </div>
  );
}
