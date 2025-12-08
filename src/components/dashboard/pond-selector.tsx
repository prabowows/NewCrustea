"use client";

import * as React from "react";
import { useDashboard } from "@/contexts/dashboard-context";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "../ui/skeleton";

export function PondSelector() {
  const { ponds, selectedPondId, setSelectedPondId, loading } = useDashboard();

  if (loading) {
    return <Skeleton className="h-10 w-[250px]" />;
  }
  
  if (ponds.length === 0 && !loading) {
     return (
       <div className="w-[250px] text-sm text-muted-foreground text-right pr-2">
         Tidak ada kolam ditemukan.
       </div>
     )
  }

  return (
    <Select
      value={selectedPondId || ""}
      onValueChange={(value) => {
        if (value) {
          setSelectedPondId(value);
        }
      }}
      disabled={loading || ponds.length === 0}
    >
      <SelectTrigger className="w-[250px] bg-card">
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
