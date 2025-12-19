
'use client';
import { Header } from "@/components/dashboard/header";
import { PondProvider } from "@/context/PondContext";
import { useUser } from "@/hooks/use-user";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Simple CSS-only spinner component
const Spinner = () => (
  <div>
    <style jsx>{`
      .spinner {
        width: 48px;
        height: 48px;
        border: 5px solid #ffffff;
        border-bottom-color: hsl(var(--primary));
        border-radius: 50%;
        display: inline-block;
        box-sizing: border-box;
        animation: rotation 1s linear infinite;
      }
      @keyframes rotation {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }
    `}</style>
    <div className="spinner" />
  </div>
);


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useUser();
  const router = useRouter();
  const [isSwitchingPond, setIsSwitchingPond] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);


  if (loading || !user) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-muted/40">
        <div>Loading...</div>
      </div>
    );
  }

  const handlePondSwitch = () => {
    setIsSwitchingPond(true);
    // This timeout simulates the data loading time. In a real app,
    // this would be tied to a data fetching "isSuccess" state.
    // The existing components already have their own loading states,
    // this is for the global overlay effect.
    setTimeout(() => {
      setIsSwitchingPond(false);
    }, 700); // A brief spinner for better UX
  };


  return (
    <PondProvider onPondSwitch={handlePondSwitch}>
       {isSwitchingPond && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <Spinner />
        </div>
      )}
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <Header />
        <div className="flex flex-col sm:gap-4 sm:py-4">
          <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
            {children}
          </main>
        </div>
      </div>
    </PondProvider>
  );
}
