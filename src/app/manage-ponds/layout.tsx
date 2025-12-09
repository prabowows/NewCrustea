import { DashboardProvider } from "@/contexts/dashboard-context";
import { Header } from "@/components/dashboard/header";

export default function ManagePondsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Wrap with DashboardProvider so useDashboard() hook can be used
    <DashboardProvider>
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <Header />
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-4 md:gap-8">
            {children}
        </main>
        </div>
    </DashboardProvider>
  );
}
