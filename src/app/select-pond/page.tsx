
'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/hooks/use-user';
import { database } from '@/lib/firebase';
import { ref, onValue } from 'firebase/database';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Droplets } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Header } from '@/components/dashboard/header';

type Pond = {
  id: string;
  name: string;
  location: string;
};

export default function SelectPondPage() {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const [ponds, setPonds] = useState<Pond[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userLoading) {
      return;
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
          // A valid pond is an object and has Nama_kolam
          if (typeof data[key] === 'object' && data[key] !== null && data[key].Nama_kolam) {
            pondList.push({
              id: key,
              name: data[key].Nama_kolam,
              location: data[key].Lokasi || 'Lokasi tidak diketahui',
            });
          }
        });
      }
      setPonds(pondList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, userLoading, router]);

  const handlePondSelect = (pondId: string) => {
    // Save to local storage to be picked up by the dashboard
    localStorage.setItem('selectedPondId', pondId);
    router.push('/dashboard');
  };

  if (userLoading || loading) {
    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <Header />
            <main className="flex-1 p-4 sm:px-6 sm:py-4">
                <div className="max-w-4xl mx-auto">
                <Card>
                    <CardHeader>
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-64 mt-2" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-10 w-full" />
                    </CardContent>
                </Card>
                </div>
            </main>
        </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <Header />
      <main className="flex-1 p-4 sm:px-6 sm:py-4">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-primary">Pilih Kolam</CardTitle>
              <CardDescription>Pilih kolam yang ingin Anda pantau atau tambahkan kolam baru.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {ponds.length > 0 ? (
                ponds.map((pond) => (
                  <button
                    key={pond.id}
                    onClick={() => handlePondSelect(pond.id)}
                    className="w-full text-left p-4 rounded-lg border bg-card hover:bg-muted transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                        <Droplets className="h-6 w-6 text-primary" />
                        <div>
                            <p className="font-semibold text-lg">{pond.name}</p>
                            <p className="text-sm text-muted-foreground">{pond.location}</p>
                        </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center py-8 px-4 border-2 border-dashed rounded-lg">
                  <p className="text-muted-foreground mb-4">Anda belum memiliki kolam.</p>
                  <Button asChild>
                    <Link href="/add-pond">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Buat Kolam Pertama Anda
                    </Link>
                  </Button>
                </div>
              )}
              {ponds.length > 0 && (
                 <Button asChild className="w-full">
                    <Link href="/add-pond">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Tambah Kolam Baru
                    </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
