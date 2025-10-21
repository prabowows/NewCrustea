
import { AppSidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <AppSidebar />
        <SidebarInset>
          <div className="flex flex-col sm:gap-4 sm:py-4">
            <Header />
            {children}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
