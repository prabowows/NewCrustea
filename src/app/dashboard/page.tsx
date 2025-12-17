
import { RealTimeMetrics } from "@/components/dashboard/real-time-metrics";
import { HistoricalChart } from "@/components/dashboard/historical-chart";
import { AlarmsTable } from "@/components/dashboard/alarms-table";
import { ParameterAnalysis } from "@/components/dashboard/parameter-analysis";
import { AeratorControl } from "@/components/dashboard/aerator-control";
import { LocationOverview } from "@/components/dashboard/location-overview";
import { PondSelector } from "@/components/dashboard/pond-selector";
import { RefreshButton } from "@/components/dashboard/refresh-button";

export default function DashboardPage() {
  return (
    <div className="grid grid-cols-1 gap-4 md:gap-8">
      <PondSelector />
      <LocationOverview />
      <RefreshButton />
      <RealTimeMetrics />
      <div className="space-y-4 md:space-y-8">
        <HistoricalChart />
        <ParameterAnalysis />
        <AeratorControl />
        <AlarmsTable />
      </div>
    </div>
  );
}
