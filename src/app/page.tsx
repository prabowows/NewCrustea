import { SidebarProvider, Sidebar, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { RealTimeMetrics } from "@/components/dashboard/real-time-metrics";
import { AeratorControl } from "@/components/dashboard/aerator-control";
import { LocationMap } from "@/components/dashboard/location-map";
import { HistoricalChart } from "@/components/dashboard/historical-chart";
import { AlarmsTable } from "@/components/dashboard/alarms-table";
import { ParameterAnalysis } from "@/components/dashboard/parameter-analysis";

export default function Home() {
  return (
    <SidebarProvider>
      <Sidebar>
        <AppSidebar />
      </Sidebar>
      <SidebarInset>
        <div className="flex min-h-screen w-full flex-col">
          <Header />
          <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6 lg:p-8">
            <RealTimeMetrics />
            
            <div className="grid grid-cols-1 items-start gap-4 md:gap-8 lg:grid-cols-3">
              <div className="grid gap-4 md:gap-8 lg:col-span-2">
                <HistoricalChart />
              </div>
              <div className="grid gap-4 md:gap-8">
                <AeratorControl />
                <LocationMap />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:gap-8 lg:grid-cols-2">
                <AlarmsTable />
                <ParameterAnalysis />
            </div>
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
