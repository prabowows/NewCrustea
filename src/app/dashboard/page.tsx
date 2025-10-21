
import { RealTimeMetrics } from "@/components/dashboard/real-time-metrics";
import { HistoricalChart } from "@/components/dashboard/historical-chart";
import { AlarmsTable } from "@/components/dashboard/alarms-table";
import { ParameterAnalysis } from "@/components/dashboard/parameter-analysis";
import { AeratorControl } from "@/components/dashboard/aerator-control";
import { LocationOverview } from "@/components/dashboard/location-overview";

export default function DashboardPage() {
  return (
    <main className="flex-1 space-y-4 p-4 sm:px-6 sm:py-0 md:space-y-8">
      <LocationOverview />
      <div className="grid grid-cols-1 gap-4 md:gap-8 lg:grid-cols-3 xl:grid-cols-3">
        <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
          <RealTimeMetrics />
          <HistoricalChart />
          <AlarmsTable />
          <ParameterAnalysis />
        </div>
        <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-1">
          <AeratorControl />
        </div>
      </div>
    </main>
  );
}
