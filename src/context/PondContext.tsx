'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { database } from '@/lib/firebase';
import { ref, get } from 'firebase/database';
import { useUser } from '@/hooks/use-user';

type Pond = {
    id: string;
    nama: string;
    lokasi: string;
    // other pond properties
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

    // Effect to fetch initial static data (ponds and devices list)
    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        setLoading(true);
        const userRef = ref(database, `/User/${user.uid}`);
        
        get(userRef).then((snapshot) => {
            const data = snapshot.val();
            if (!data) {
                setLoading(false);
                return;
            }

            const loadedPonds: Pond[] = [];
            const loadedDevices: any = {};

            Object.keys(data).forEach(key => {
                const item = data[key];
                if (item.lokasi && item.nama) {
                    loadedPonds.push({ id: key, ...item });
                } else if (item.tipe) {
                    loadedDevices[key] = item;
                }
            });

            setPonds(loadedPonds);
            setAllDevices(loadedDevices);

            if (loadedPonds.length > 0 && !selectedPondId) {
                setSelectedPondId(loadedPonds[0].id);
            }
            
            setLoading(false);
        }).catch(error => {
            console.error("Firebase initial data fetch error:", error);
            setLoading(false);
        });

    }, [user]);

    const findDeviceKeyForPond = useCallback((type: string, pondId: string): string | null => {
        if (Object.keys(allDevices).length === 0 || !pondId) return null;
        
        const deviceKey = Object.keys(allDevices).find(key => 
            allDevices[key].tipe === type && allDevices[key].id_kolam === pondId
        );
        return deviceKey || null;
    }, [allDevices]);
    
    const findAeratorDeviceKey = useCallback((pondId: string): string | null => {
        if (Object.keys(allDevices).length === 0 || !pondId) return null;
        
        const scDeviceKey = findDeviceKeyForPond('SC', pondId);
        if (!scDeviceKey) return null;

        return Object.keys(allDevices).find(key => 
            allDevices[key].tipe === 'AERATOR' && allDevices[key].id_sc === scDeviceKey
        ) || null;
    }, [allDevices, findDeviceKeyForPond]);


    // Effect to calculate devices for the selected pond
    useEffect(() => {
        if (!selectedPondId) {
            setDevices({ ebii: null, se: null, aerator: null });
            return;
        }

        setDevices({
            ebii: findDeviceKeyForPond('EBII', selectedPondId),
            se: findDeviceKeyForPond('SE', selectedPondId),
            aerator: findAeratorDeviceKey(selectedPondId)
        });

    }, [selectedPondId, findDeviceKeyForPond, findAeratorDeviceKey]);

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
