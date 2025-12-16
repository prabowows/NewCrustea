
'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { database } from '@/lib/firebase';
import { ref, onValue, off, get } from 'firebase/database';
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

            // Set initial selected pond only if it hasn't been set
            if (loadedPonds.length > 0 && !selectedPondId) {
                setSelectedPondId(loadedPonds[0].id);
            }
            
            setLoading(false);
        }).catch(error => {
            console.error("Firebase initial data fetch error:", error);
            setLoading(false);
        });

    }, [user, selectedPondId]); // Dependency on user is correct. selectedPondId is to help initial set.

    // Effect to calculate devices for the selected pond
    useEffect(() => {
        const selectedPond = ponds.find(p => p.id === selectedPondId);
        if (!selectedPond || Object.keys(allDevices).length === 0) {
            setDevices({ ebii: null, se: null, aerator: null });
            return;
        }

        const findDeviceKeyForPond = (type: string): string | null => {
            const deviceKey = Object.keys(allDevices).find(key => 
                allDevices[key].tipe === type && allDevices[key].id_kolam === selectedPond.id
            );
            return deviceKey || null;
        };

        const findAeratorDeviceKey = (): string | null => {
            const scDeviceKey = findDeviceKeyForPond('SC');
            if (!scDeviceKey) return null;

            return Object.keys(allDevices).find(key => 
                allDevices[key].tipe === 'AERATOR' && allDevices[key].id_sc === scDeviceKey
            ) || null;
        }

        setDevices({
            ebii: findDeviceKeyForPond('EBII'),
            se: findDeviceKeyForPond('SE'),
            aerator: findAeratorDeviceKey()
        });

    }, [selectedPondId, ponds, allDevices]);

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
