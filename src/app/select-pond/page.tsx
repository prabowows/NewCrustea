
'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/hooks/use-user';
import { database } from '@/lib/firebase';
import { ref, onValue } from 'firebase/database';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle } from 'lucide-react';
import { Header } from '@/components/dashboard/header';

type Pond = {
  id: string;
  name: string;
  location: string;
};

// This page now acts as a router.
// 1. If user has ponds, select the first one and redirect to /dashboard.
// 2. If user has no ponds, show the UI to add a new pond.
export default function SelectPondPage() {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const [hasPonds, setHasPonds] = useState<boolean | null>(null);

  useEffect(() => {
    if (userLoading) {
      return; // Wait until user status is known
    }
    if (!user) {
      router.push('/login');
      return;
    }

    const pondsRef = ref(database, `User/${user.uid}/Kolam`);
    const unsubscribe = onValue(pondsRef, (snapshot) => {
      const data = snapshot.val();
      const pondList: Pond[] = [];
      if (data) {
        Object.keys(data).forEach((key) => {
          if (typeof data[key] === 'object' && data[key] !== null && data[key].Nama_kolam) {
            pondList.push({
              id: key,
              name: data[key].Nama_kolam,
              location: data[key].Lokasi || 'Lokasi tidak diketahui',
            });
          }
        });
      }

      if (pondList.length > 0) {
        // User has ponds. Set the first one as selected and redirect.
        localStorage.setItem('selectedPondId', pondList[0].id);
        router.push('/dashboard');
      } else {
        // User has no ponds. Show the "add pond" UI.
        setHasPonds(false);
      }
    }, {
      onlyOnce: true // We only need to check this once to decide the redirect.
    });

    return () => unsubscribe();
  }, [user, userLoading, router]);

  // While checking for ponds, show a loading state.
  if (userLoading || hasPonds === null) {
    return <div className="flex justify-center items-center h-screen">Mengarahkan...</div>;
  }

  // If user has no ponds, render the page to add one.
  if (hasPonds === false) {
    return (
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <Header />
        <main className="flex-1 p-4 sm:px-6 sm:py-4">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-primary">Mulai Dengan Kolam Pertama Anda</CardTitle>
                <CardDescription>Anda belum memiliki kolam. Silakan buat satu untuk memulai pemantauan.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="text-center py-8 px-4 border-2 border-dashed rounded-lg">
                  <p className="text-muted-foreground mb-4">Anda belum memiliki kolam terdaftar.</p>
                  <Button asChild>
                    <Link href="/add-pond">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Buat Kolam Pertama Anda
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  // This return is just a fallback, user should be redirected by the useEffect.
  return <div className="flex justify-center items-center h-screen">Mengarahkan...</div>;
}
