
"use client";

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useDashboard } from "@/contexts/dashboard-context";

export function PondSelector() {
    const { ponds, selectedPondId, setSelectedPondId, loading } = useDashboard();
    const [open, setOpen] = React.useState(false);

    const handleSelect = (currentValue: string) => {
        setSelectedPondId(currentValue === selectedPondId ? "" : currentValue);
        setOpen(false);
    }
    
    const selectedLabel = selectedPondId 
        ? ponds.find((pond) => pond.value === selectedPondId)?.label
        : "Pilih Kolam...";

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-[250px] justify-between bg-card"
                    disabled={loading || ponds.length === 0}
                >
                    <span className="truncate">
                        {loading ? "Memuat kolam..." : selectedLabel}
                    </span>
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
                                    onSelect={handleSelect}
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
    )
}
