
import { RealTimeMetrics } from "@/components/dashboard/real-time-metrics";
import { HistoricalChart } from "@/components/dashboard/historical-chart";
import { AlarmsTable } from "@/components/dashboard/alarms-table";
import { ParameterAnalysis } from "@/components/dashboard/parameter-analysis";
import { AeratorControl } from "@/components/dashboard/aerator-control";
import { LocationOverview } from "@/components/dashboard/location-overview";

export default function DashboardPage() {
  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-3 xl:grid-cols-3">
      <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
           <RealTimeMetrics />
        </div>
        <HistoricalChart />
        <AlarmsTable />
        <ParameterAnalysis />
      </div>
      <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-1">
        <AeratorControl />
        <LocationOverview />
      </div>
    </main>
  );
}
