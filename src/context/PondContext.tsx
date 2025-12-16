'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { database } from '@/lib/firebase';
import { ref, get } from 'firebase/database';
import { useUser } from '@/hooks/use-user';

export type Pond = {
    id: string;
    nama: string;
    lokasi: string;
};

export type AllDevices = {
    [key: string]: {
        tipe: string;
        id_kolam?: string;
        id_sc?: string;
        nama?: string;
        name?: string;
    }
}

type PondContextType = {
    ponds: Pond[];
    selectedPondId: string | null;
    setSelectedPondId: (id: string) => void;
    allDevices: AllDevices;
    loading: boolean;
    selectedPond: Pond | null;
};

const PondContext = createContext<PondContextType | undefined>(undefined);

export function PondProvider({ children }: { children: ReactNode }) {
    const { user } = useUser();
    const [ponds, setPonds] = useState<Pond[]>([]);
    const [selectedPondId, setSelectedPondId] = useState<string | null>(null);
    const [allDevices, setAllDevices] = useState<AllDevices>({});
    const [loading, setLoading] = useState(true);

    // Effect to fetch initial static data (ponds and all devices) ONCE
    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        const fetchInitialData = async () => {
            setLoading(true);
            try {
                const userRef = ref(database, `/User/${user.uid}`);
                const snapshot = await get(userRef);
                const data = snapshot.val();

                if (!data) {
                    setPonds([]);
                    setAllDevices({});
                    return;
                }

                const loadedPonds: Pond[] = [];
                const loadedDevices: AllDevices = {};

                Object.keys(data).forEach(key => {
                    const item = data[key];
                    if (item.lokasi && item.nama && !item.tipe) {
                        loadedPonds.push({ id: key, ...item });
                    } else if (item.tipe) {
                        loadedDevices[key] = item;
                    }
                });

                setPonds(loadedPonds);
                setAllDevices(loadedDevices);

                // Set initial selected pond only if it's not already set
                if (loadedPonds.length > 0 && selectedPondId === null) {
                    setSelectedPondId(loadedPonds[0].id);
                }
            } catch (error) {
                console.error("Firebase initial data fetch error:", error);
                setPonds([]);
                setAllDevices({});
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const selectedPond = useMemo(() => {
        return ponds.find(p => p.id === selectedPondId) || null;
    }, [ponds, selectedPondId]);
    
    const value = { 
        ponds, 
        selectedPondId, 
        setSelectedPondId, 
        allDevices, 
        loading, 
        selectedPond 
    };

    return <PondContext.Provider value={value}>{children}</PondContext.Provider>;
}

export function usePond() {
    const context = useContext(PondContext);
    if (context === undefined) {
        throw new Error('usePond must be used within a PondProvider');
    }
    return context;
}
