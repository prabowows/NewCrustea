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

// TODO: Fetch this list dynamically based on the logged-in user
const ponds = [
    { value: "klm001", label: "Kolam 1 (Area Timur)" },
    { value: "klm002", label: "Kolam 2 (Area Barat)" },
    { value: "klm003", label: "Kolam Pembibitan" },
];

export function PondSelector() {
    const [open, setOpen] = React.useState(false)
    const [value, setValue] = React.useState("klm001")

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-[250px] justify-between bg-card"
                >
                    {value
                        ? ponds.find((pond) => pond.value === value)?.label
                        : "Pilih Kolam..."}
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
                                        setValue(currentValue === value ? "" : currentValue)
                                        setOpen(false)
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === pond.value ? "opacity-100" : "opacity-0"
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
