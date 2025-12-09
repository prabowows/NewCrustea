
'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useUser } from '@/hooks/use-user';
import { database } from '@/lib/firebase';
import { ref, onValue } from 'firebase/database';
import { useRouter } from 'next/navigation';

type Pond = {
    value: string;
    label: string; 
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
    const router = useRouter();
    const [ponds, setPonds] = useState<Pond[]>([]);
    const [selectedPondId, setSelectedPondId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // Function to set selectedPondId, also saves to localStorage
    const handleSetSelectedPondId = useCallback((id: string) => {
        localStorage.setItem('selectedPondId', id);
        setSelectedPondId(id);
    }, []);

    useEffect(() => {
        if (userLoading) {
            setLoading(true);
            return;
        }
        if (!user) {
            router.push('/login');
            return;
        }

        // Try to get the last selected pond from local storage
        const lastSelectedId = localStorage.getItem('selectedPondId');
        if (lastSelectedId) {
            setSelectedPondId(lastSelectedId);
        } else {
            // If no pond is in local storage, user must select one
            router.push('/select-pond');
            return;
        }

        setLoading(true);
        const pondsRef = ref(database, `User/${user.uid}/Kolam`);

        const unsubscribe = onValue(pondsRef, (snapshot) => {
            const data = snapshot.val();
            const pondList: Pond[] = [];
            let foundLastSelected = false;

            if (data) {
                Object.keys(data).forEach(key => {
                    const pondData = data[key];
                    if (pondData && typeof pondData === 'object' && pondData.Nama_kolam) {
                        pondList.push({
                            value: key,
                            label: pondData.Nama_kolam,
                        });
                        if(key === lastSelectedId) {
                            foundLastSelected = true;
                        }
                    }
                });
            }

            setPonds(pondList);
            
            // If the last selected pond doesn't exist anymore, redirect
            if (lastSelectedId && !foundLastSelected && pondList.length > 0) {
                handleSetSelectedPondId(pondList[0].value);
            } else if (pondList.length === 0) {
                 // If user has no ponds, redirect them to add one
                router.push('/add-pond');
            }

            setLoading(false);
        }, (error) => {
            console.error("Failed to fetch ponds:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user, userLoading, router, handleSetSelectedPondId]);

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
