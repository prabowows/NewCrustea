
'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePond } from "@/context/PondContext";
import { Skeleton } from "../ui/skeleton";

export function PondSelector() {
    const { ponds, selectedPond, setSelectedPondId, loading } = usePond();

    if (loading) {
        return (
            <Skeleton className="h-10 w-full" />
        );
    }

    if (!ponds || ponds.length === 0) {
        return (
            <div className="p-4 rounded-md border text-center text-muted-foreground">
                Tidak ada kolam yang ditemukan untuk akun Anda.
            </div>
        );
    }
    
    return (
        <Select
            value={selectedPond?.id}
            onValueChange={(value) => setSelectedPondId(value)}
            disabled={ponds.length === 0}
            >
            <SelectTrigger className="w-full border-primary border-2">
                <SelectValue placeholder="Pilih Kolam..." />
            </SelectTrigger>
            <SelectContent>
                {ponds.map(pond => (
                    <SelectItem key={pond.id} value={pond.id}>
                        {pond.nama}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
