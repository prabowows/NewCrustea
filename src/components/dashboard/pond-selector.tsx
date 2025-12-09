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

export function PondSelector() {
  const { ponds, selectedPondId, setSelectedPondId, loading } = useDashboard();

  if (loading) {
    return <Skeleton className="h-10 w-full" />;
  }

  if (!loading && ponds.length === 0) {
    return (
      <div className="w-full text-sm text-muted-foreground text-right pr-2">
        Tidak ada kolam ditemukan.
      </div>
    );
  }

  return (
    <Select
      value={selectedPondId || ""}
      onValueChange={(value) => {
        if (value) {
          setSelectedPondId(value);
        }
      }}
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
