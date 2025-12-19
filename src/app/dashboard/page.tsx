
'use client';

import { RealTimeMetrics } from "@/components/dashboard/real-time-metrics";
import { HistoricalChart } from "@/components/dashboard/historical-chart";
import { AlarmsTable } from "@/components/dashboard/alarms-table";
import { ParameterAnalysis } from "@/components/dashboard/parameter-analysis";
import { LocationOverview } from "@/components/dashboard/location-overview";
import { PondSelector } from "@/components/dashboard/pond-selector";
import { RefreshButton } from "@/components/dashboard/refresh-button";
import { usePond } from '@/context/PondContext';

export default function DashboardPage() {
  const { selectedPondId } = usePond();
  return (
    <div className="grid grid-cols-1 gap-4 md:gap-8">
      <PondSelector />
      <LocationOverview />
      <RefreshButton />
      <RealTimeMetrics key={`rt-${selectedPondId}`} />
      <div className="space-y-4 md:space-y-8">
        <HistoricalChart key={`hc-${selectedPondId}`} />
        <ParameterAnalysis />
        <AlarmsTable />
      </div>
    </div>
  );
}
