"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useDashboard } from "@/contexts/dashboard-context";
import { Skeleton } from "../ui/skeleton";

export function PondSelector() {
  const { ponds, selectedPondId, setSelectedPondId, loading } = useDashboard();
  const [open, setOpen] = React.useState(false);
  
  // The local 'value' state is not strictly necessary if the context updates fast enough,
  // but it can make the component feel more responsive, especially if context logic were complex.
  // For now, we will directly use `selectedPondId` from the context to simplify.

  if (loading) {
    return <Skeleton className="h-10 w-[250px]" />;
  }
  
  if (ponds.length === 0 && !loading) {
    return (
      <div className="w-[250px] text-sm text-muted-foreground text-right pr-2">
        Tidak ada kolam ditemukan.
      </div>
    );
  }
  
  const selectedLabel = ponds.find((pond) => pond.value === selectedPondId)?.label || "Pilih Kolam...";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[250px] justify-between bg-card"
        >
          {selectedLabel}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[250px] p-0">
        <Command>
          <CommandInput placeholder="Cari kolam..." />
          <CommandList>
            <CommandEmpty>Kolam tidak ditemukan.</CommandEmpty>
            <CommandGroup>
              {ponds.map((pond) => (
                <CommandItem
                  key={pond.value}
                  value={pond.value}
                  onSelect={(currentValue) => {
                    // Check if the value is already selected to avoid unnecessary updates
                    if (currentValue !== selectedPondId) {
                       setSelectedPondId(currentValue);
                    }
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedPondId === pond.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {pond.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
