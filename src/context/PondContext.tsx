'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { database } from '@/lib/firebase';
import { ref, get } from 'firebase/database';
import { useUser } from '@/hooks/use-user';

type Pond = {
    id: string;
    nama: string;
    lokasi: string;
};

type Devices = {
    ebii: string | null;
    se: string | null;
    aerator: string | null;
}

type PondContextType = {
    ponds: Pond[];
    selectedPond: Pond | null;
    setSelectedPondId: (id: string) => void;
    devices: Devices;
    loading: boolean;
};

const PondContext = createContext<PondContextType | undefined>(undefined);

export function PondProvider({ children }: { children: ReactNode }) {
    const { user } = useUser();
    const [ponds, setPonds] = useState<Pond[]>([]);
    const [selectedPondId, setSelectedPondId] = useState<string | null>(null);
    const [allDevices, setAllDevices] = useState<any>({});
    const [devices, setDevices] = useState<Devices>({ ebii: null, se: null, aerator: null });
    const [loading, setLoading] = useState(true);

    // Effect 1: Fetch initial static data (ponds and all devices) only ONCE
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
                const loadedDevices: any = {};

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

                // Set initial pond selection
                if (loadedPonds.length > 0) {
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
    }, [user]);

    // Effect 2: Update devices whenever selectedPondId or allDevices list changes
    useEffect(() => {
        if (!selectedPondId || Object.keys(allDevices).length === 0) {
            setDevices({ ebii: null, se: null, aerator: null });
            return;
        }

        const findDeviceKeyForPond = (type: string, pondId: string): string | null => {
            return Object.keys(allDevices).find(key => 
                allDevices[key].tipe === type && allDevices[key].id_kolam === pondId
            ) || null;
        };
        
        const findAeratorDeviceKey = (pondId: string): string | null => {
            const scDeviceKey = findDeviceKeyForPond('SC', pondId);
            if (!scDeviceKey) return null;

            return Object.keys(allDevices).find(key => 
                allDevices[key].tipe === 'AERATOR' && allDevices[key].id_sc === scDeviceKey
            ) || null;
        };

        const newDevices: Devices = {
            ebii: findDeviceKeyForPond('EBII', selectedPondId),
            se: findDeviceKeyForPond('SE', selectedPondId),
            aerator: findAeratorDeviceKey(selectedPondId)
        };
        
        setDevices(newDevices);

    }, [selectedPondId, allDevices]);


    const handleSetSelectedPondId = (id: string) => {
        setSelectedPondId(id);
    };

    const selectedPond = ponds.find(p => p.id === selectedPondId) || null;

    const value = { ponds, selectedPond, setSelectedPondId: handleSetSelectedPondId, devices, loading };

    return <PondContext.Provider value={value}>{children}</PondContext.Provider>;
}

export function usePond() {
    const context = useContext(PondContext);
    if (context === undefined) {
        throw new Error('usePond must be used within a PondProvider');
    }
    return context;
}
