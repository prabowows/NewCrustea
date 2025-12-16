'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { database } from '@/lib/firebase';
import { ref, onValue, off } from 'firebase/database';
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
    const [selectedPond, setSelectedPond] = useState<Pond | null>(null);
    const [allDevices, setAllDevices] = useState<any>({});
    const [devices, setDevices] = useState<Devices>({ ebii: null, se: null, aerator: null });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        setLoading(true);
        const userRef = ref(database, `/User/${user.uid}`);
        
        const listener = onValue(userRef, (snapshot) => {
            const data = snapshot.val();
            if (!data) {
                setLoading(false);
                return;
            }

            const loadedPonds: Pond[] = [];
            const loadedDevices: any = {};

            Object.keys(data).forEach(key => {
                const item = data[key];
                // Assuming ponds have a 'lokasi' property and devices have a 'tipe'
                if (item.lokasi && item.nama) {
                    loadedPonds.push({ id: key, ...item });
                } else if (item.tipe) {
                    loadedDevices[key] = item;
                }
            });

            setPonds(loadedPonds);
            setAllDevices(loadedDevices);

            if (loadedPonds.length > 0 && !selectedPond) {
                setSelectedPond(loadedPonds[0]);
            } else if (loadedPonds.length === 0) {
                setSelectedPond(null);
            }
            setLoading(false);
        });

        return () => {
            off(userRef, 'value', listener);
        };
    }, [user]);

    useEffect(() => {
        if (!selectedPond || Object.keys(allDevices).length === 0) {
            setDevices({ ebii: null, se: null, aerator: null });
            return;
        };

        // This is a placeholder for logic that links devices to a pond.
        // For now, we assume the first found device of each type belongs to the pond.
        // A better structure would be to have device IDs inside the pond object in the DB.
        const findDevice = (type: string) => {
            return Object.keys(allDevices).find(key => allDevices[key].tipe === type) || null;
        }

        setDevices({
            ebii: findDevice('EBII'),
            se: findDevice('SE'),
            aerator: findDevice('AERATOR')
        });

    }, [selectedPond, allDevices]);

    const setSelectedPondId = (id: string) => {
        const pond = ponds.find(p => p.id === id);
        if (pond) {
            setSelectedPond(pond);
        }
    };

    const value = { ponds, selectedPond, setSelectedPondId, devices, loading };

    return <PondContext.Provider value={value}>{children}</PondContext.Provider>;
}

export function usePond() {
    const context = useContext(PondContext);
    if (context === undefined) {
        throw new Error('usePond must be used within a PondProvider');
    }
    return context;
}
