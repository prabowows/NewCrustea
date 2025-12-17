
'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { database } from '@/lib/firebase';
import { ref, get } from 'firebase/database';
import { useUser } from '@/hooks/use-user';

export type Pond = {
    id: string;
    nama: string;
    lokasi: string;
};

export type Device = {
    id: string;
    name: string;
    tipe: string;
    pond_id?: string;
    sc_id?: string;
}

export type AllDevices = {
    [key: string]: Device;
}

export type PondDevices = {
    [key: string]: boolean;
}

export type ScDevices = {
    [key: string]: boolean;
}

type PondContextType = {
    ponds: Pond[];
    selectedPondId: string | null;
    setSelectedPondId: (id: string) => void;
    allDevices: AllDevices;
    pondDevices: { [key: string]: PondDevices };
    scDevices: { [key: string]: ScDevices };
    loading: boolean;
    selectedPond: Pond | null;
    fetchInitialData: () => Promise<void>;
};

const PondContext = createContext<PondContextType | undefined>(undefined);

export function PondProvider({ children }: { children: ReactNode }) {
    const { user } = useUser();
    const [ponds, setPonds] = useState<Pond[]>([]);
    const [selectedPondId, setSelectedPondId] = useState<string | null>(null);
    const [allDevices, setAllDevices] = useState<AllDevices>({});
    const [pondDevices, setPondDevices] = useState<{ [key: string]: PondDevices }>({});
    const [scDevices, setScDevices] = useState<{ [key: string]: ScDevices }>({});
    const [loading, setLoading] = useState(true);

    const fetchInitialData = useCallback(async () => {
        if (!user) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            // 1. Get user's pond IDs
            const userPondsRef = ref(database, `/user_ponds/${user.uid}`);
            const userPondsSnap = await get(userPondsRef);
            const userPondIds = userPondsSnap.exists() ? Object.keys(userPondsSnap.val()) : [];

            if (userPondIds.length === 0) {
                setPonds([]);
                setAllDevices({});
                setPondDevices({});
                setScDevices({});
                setLoading(false);
                return;
            }

            // 2. Fetch all required data in parallel
            const [pondsSnap, devicesSnap, pondDevicesSnap, scDevicesSnap] = await Promise.all([
                get(ref(database, '/ponds')),
                get(ref(database, '/devices')),
                get(ref(database, '/pond_devices')),
                get(ref(database, '/sc_devices')),
            ]);

            const allPondsData = pondsSnap.val() || {};
            const allDevicesData = devicesSnap.val() || {};
            
            // 3. Filter ponds based on user's access
            const userPonds = userPondIds.map(id => ({
                id,
                ...allPondsData[id]
            })).filter(p => p.nama); // Ensure pond data exists

            // 4. Map devices data to include the ID inside the object
            const mappedDevices: AllDevices = {};
            for (const deviceId in allDevicesData) {
                mappedDevices[deviceId] = {
                    id: deviceId,
                    ...allDevicesData[deviceId]
                }
            }
            
            setPonds(userPonds);
            setAllDevices(mappedDevices);
            setPondDevices(pondDevicesSnap.val() || {});
            setScDevices(scDevicesSnap.val() || {});

            // Set initial selected pond ONLY if it's not already set
            setSelectedPondId(prevSelectedPondId => {
                if (userPonds.length > 0) {
                    const currentPondExists = userPonds.some(p => p.id === prevSelectedPondId);
                    if (!currentPondExists) {
                        return userPonds[0].id; // Default to first pond if current is invalid or null
                    }
                    return prevSelectedPondId; // Keep the existing valid selection
                }
                return null; // No ponds, so no selection
            });

        } catch (error) {
            console.error("Firebase initial data fetch error:", error);
            setPonds([]);
            setAllDevices({});
            setPondDevices({});
            setScDevices({});
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchInitialData();
    }, [fetchInitialData]);

    const selectedPond = useMemo(() => {
        return ponds.find(p => p.id === selectedPondId) || null;
    }, [ponds, selectedPondId]);
    
    const value: PondContextType = { 
        ponds, 
        selectedPondId, 
        setSelectedPondId, 
        allDevices, 
        pondDevices,
        scDevices,
        loading, 
        selectedPond,
        fetchInitialData,
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
