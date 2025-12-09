
"use client";

import * as React from "react";
import { useDashboard } from "@/contexts/dashboard-context";
import { Skeleton } from "../ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePathname, useRouter } from "next/navigation";

export function PondSelector() {
  const { ponds, selectedPondId, setSelectedPondId, loading } = useDashboard();
  const router = useRouter();
  const pathname = usePathname();

  // Don't render this component on pages where it's not needed
  if(pathname !== '/dashboard') {
    return null;
  }

  if (loading) {
    return <Skeleton className="h-10 w-full" />;
  }
  
  if (!loading && ponds.length === 0) {
    return (
      <div className="w-full text-sm text-muted-foreground text-right pr-2">
        Tidak ada kolam. <a href="/add-pond" className="underline">Tambah baru</a>.
      </div>
    );
  }

  return (
    <Select
      value={selectedPondId || ""}
      onValueChange={(value) => {
        if (value && value !== selectedPondId) {
          setSelectedPondId(value);
          // Optional: force a reload if needed, though context should handle it
          // router.refresh(); 
        }
      }}
      disabled={loading}
    >
      <SelectTrigger className="w-full bg-card">
        <SelectValue placeholder="Pilih Kolam..." />
      </SelectTrigger>
      <SelectContent>
        {ponds.map((pond) => (
          <SelectItem key={pond.value} value={pond.value}>
            {pond.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
