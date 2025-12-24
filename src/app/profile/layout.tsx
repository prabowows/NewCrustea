
'use client'; // Required to use client-side context hooks

import { Header } from "@/components/dashboard/header";
import { PondProvider } from "@/context/PondContext";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PondProvider>
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
