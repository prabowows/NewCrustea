'use client';

import { usePond } from "@/context/PondContext";
import { Button } from "../ui/button";
import { RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function RefreshButton() {
    const { fetchInitialData, loading } = usePond();
    const { toast } = useToast();

    const handleRefresh = async () => {
        await fetchInitialData();
        toast({
            title: "Data Dimuat Ulang",
            description: "Data terbaru telah berhasil diambil dari server.",
        })
    }

    return (
        <Button onClick={handleRefresh} disabled={loading} variant="outline" className="w-full">
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Memuat Ulang...' : 'Refresh Data'}
        </Button>
    )
}
