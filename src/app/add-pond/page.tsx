
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/use-user';
import { database } from '@/lib/firebase';
import { ref, push, set, update } from 'firebase/database';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AddPondPage() {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [pondName, setPondName] = useState('');
  const [pondLocation, setPondLocation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddPond = async () => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Anda belum login',
        description: 'Silakan login terlebih dahulu untuk menambah kolam.',
      });
      router.push('/login');
      return;
    }
    if (!pondName.trim() || !pondLocation.trim()) {
      toast({
        variant: 'destructive',
        title: 'Data tidak lengkap',
        description: 'Nama dan lokasi kolam harus diisi.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Path to the user's root
      const userRef = ref(database, `User/${user.uid}`);
      // Path to the user's ponds
      const pondsRef = ref(database, `User/${user.uid}/Kolam`);
      const newPondRef = push(pondsRef);
      
      // 1. Set the new pond data (without location)
      await set(newPondRef, {
        Nama_kolam: pondName,
      });

      // 2. Update the user-level location
      await update(userRef, {
        lokasi: pondLocation,
      });

      toast({
        title: 'Kolam Berhasil Dibuat',
        description: `Kolam "${pondName}" telah ditambahkan.`,
      });

      router.push('/select-pond');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Gagal Membuat Kolam',
        description: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (userLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
        <Link href="/select-pond" className="absolute top-6 left-6 z-10 text-foreground hover:text-primary transition-colors" prefetch={false}>
            <ArrowLeft className="h-6 w-6" />
            <span className="sr-only">Kembali</span>
        </Link>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-primary">Tambah Kolam Baru</CardTitle>
          <CardDescription>Isi detail kolam baru Anda di bawah ini.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="pond-name">Nama Kolam</Label>
            <Input
              id="pond-name"
              placeholder="Contoh: Kolam Depan Rumah"
              value={pondName}
              onChange={(e) => setPondName(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="pond-location">Lokasi</Label>
            <Input
              id="pond-location"
              placeholder="Contoh: Semarang, Jawa Tengah"
              value={pondLocation}
              onChange={(e) => setPondLocation(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
        </CardContent>
        <CardContent>
          <Button className="w-full" onClick={handleAddPond} disabled={isSubmitting}>
            {isSubmitting ? 'Menyimpan...' : 'Simpan Kolam'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
