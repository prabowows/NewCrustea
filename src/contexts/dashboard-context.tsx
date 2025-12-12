
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

        const lastSelectedId = localStorage.getItem('selectedPondId');
        if (lastSelectedId) {
            setSelectedPondId(lastSelectedId);
        } else {
            router.push('/select-pond');
            return;
        }

        setLoading(true);
        const pondsRef = ref(database, `User/${user.uid}/Kolam`);

        const unsubscribe = onValue(pondsRef, (snapshot) => {
            const data = snapshot.val();
            const pondList: Pond[] = [];
            let isSelectedIdValid = false;

            if (data) {
                Object.keys(data).forEach(key => {
                    const pondData = data[key];
                    if (pondData && typeof pondData === 'object' && pondData.Nama_kolam) {
                        pondList.push({
                            value: key,
                            label: pondData.Nama_kolam,
                        });
                        if (key === lastSelectedId) {
                            isSelectedIdValid = true;
                        }
                    }
                });
            }

            setPonds(pondList);
            
            if (!isSelectedIdValid && pondList.length > 0) {
                // If the stored ID is invalid but there are other ponds, select the first one.
                handleSetSelectedPondId(pondList[0].value);
            } else if (!isSelectedIdValid && pondList.length === 0) {
                 // If the stored ID is invalid and there are no ponds, go to select page.
                router.push('/select-pond');
            }

            setLoading(false);
        }, (error) => {
            console.error("Failed to fetch ponds:", error);
            setLoading(false);
        }, { onlyOnce: true }); // Fetch data only once

        // The onValue with onlyOnce: true doesn't need an unsubscribe function.
        // The return is kept for consistency in case the option is removed later.
        return () => {};
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
        </Dashboard.Provider>
    );
};

export const useDashboard = (): DashboardContextType => {
    const context = useContext(DashboardContext);
    if (context === undefined) {
        throw new Error('useDashboard must be used within a DashboardProvider');
    }
    return context;
};
