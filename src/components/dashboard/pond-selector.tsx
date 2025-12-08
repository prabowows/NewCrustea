"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Fish } from "lucide-react";

// TODO: Fetch this list dynamically based on the logged-in user
const ponds = [
    { id: "KLM001", name: "Kolam 1 (Area Timur)" },
    { id: "KLM002", name: "Kolam 2 (Area Barat)" },
    { id: "KLM003", name: "Kolam Pembibitan" },
];

export function PondSelector() {
    // TODO: Add state management to handle selected pond and pass it to other components
    return (
        <div className="flex items-center gap-2">
            <Fish className="h-5 w-5 text-muted-foreground" />
            <Select defaultValue="KLM001">
                <SelectTrigger className="w-[200px] bg-card">
                    <SelectValue placeholder="Pilih Kolam" />
                </SelectTrigger>
                <SelectContent>
                    {ponds.map(pond => (
                        <SelectItem key={pond.id} value={pond.id}>
                            {pond.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    )
}
