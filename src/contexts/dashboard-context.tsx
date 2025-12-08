
'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useUser } from '@/hooks/use-user';
import { database } from '@/lib/firebase';
import { ref, onValue } from 'firebase/database';

type Pond = {
    value: string; // e.g., "KLM01"
    label: string; // e.g., "KLM 01"
}

interface DashboardContextType {
    userId: string | null;
    ponds: Pond[];
    selectedPondId: string | null;
    setSelectedPondId: (id: string) => void;
    loading: boolean;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider = ({ children }: { children: ReactNode }) => {
    const { user, loading: userLoading } = useUser();
    const [ponds, setPonds] = useState<Pond[]>([]);
    const [selectedPondId, setSelectedPondId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (userLoading) {
            setLoading(true);
            return;
        }
        if (!user) {
            setLoading(false);
            return;
        }

        setLoading(true);
        const pondsRef = ref(database, `User/${user.uid}/Kolam`);

        const unsubscribe = onValue(pondsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const pondList: Pond[] = Object.keys(data)
                    .filter(key => key.toUpperCase().startsWith('KLM'))
                    .map(key => ({
                        value: key,
                        label: key.replace(/(\D+)(\d+)/, '$1 $2'),
                    }));
                
                setPonds(pondList);

                // Set default selected pond only if it's not already set
                if (pondList.length > 0 && !selectedPondId) {
                    setSelectedPondId(pondList[0].value);
                } else if (pondList.length === 0) {
                    setSelectedPondId(null);
                }
            } else {
                setPonds([]);
                setSelectedPondId(null);
            }
            setLoading(false);
        }, (error) => {
            console.error("Failed to fetch ponds:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user, userLoading]); // Removed selectedPondId from dependency array

    const handleSetSelectedPondId = useCallback((id: string) => {
        setSelectedPondId(id);
    }, []);


    const value = {
        userId: user?.uid || null,
        ponds,
        selectedPondId,
        setSelectedPondId: handleSetSelectedPondId,
        loading: loading || userLoading,
    };

    return (
        <DashboardContext.Provider value={value}>
            {children}
        </DashboardContext.Provider>
    );
};

export const useDashboard = (): DashboardContextType => {
    const context = useContext(DashboardContext);
    if (context === undefined) {
        throw new Error('useDashboard must be used within a DashboardProvider');
    }
    return context;
};
