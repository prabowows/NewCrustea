'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@/hooks/use-user';
import { database } from '@/lib/firebase';
import { ref, onValue, remove } from 'firebase/database';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Search, PlusCircle, Edit, Trash2, Info, MoreHorizontal } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

type Pond = {
  id: string;
  name: string;
};

export default function ManagePondsPage() {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  const [ponds, setPonds] = useState<Pond[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [pondToDelete, setPondToDelete] = useState<Pond | null>(null);

  useEffect(() => {
    if (userLoading) {
      setLoading(true);
      return;
    }
    if (!user) {
      router.push('/login');
      return;
    }

    setLoading(true);
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
            });
          }
        });
      }
      setPonds(pondList);
      setLoading(false);
    }, (error) => {
      console.error("Firebase read failed:", error);
      toast({ variant: "destructive", title: "Gagal memuat data kolam." });
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, userLoading, router, toast]);

  const handleDeletePond = async () => {
    if (!user || !pondToDelete) return;
    
    const pondRef = ref(database, `User/${user.uid}/Kolam/${pondToDelete.id}`);
    try {
      await remove(pondRef);
      toast({
        title: 'Kolam Dihapus',
        description: `Kolam "${pondToDelete.name}" telah berhasil dihapus.`,
      });
      setPondToDelete(null);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Gagal Menghapus Kolam',
        description: error.message,
      });
    }
  };

  const filteredPonds = useMemo(() => {
    return ponds.filter(pond =>
      pond.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [ponds, searchTerm]);
  
  if (userLoading || loading) {
     return (
        <div>
            <Card>
                <CardHeader>
                    <CardTitle>Daftar Kolam</CardTitle>
                    <CardDescription>Kelola semua kolam Anda di satu tempat.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-2">
                        <Skeleton className="h-10 w-full sm:w-64" />
                        <Skeleton className="h-10 w-full sm:w-40" />
                    </div>
                    <div className="border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead><Skeleton className="h-5 w-32" /></TableHead>
                                    <TableHead className="w-[100px] text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {Array(3).fill(0).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                                        <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
  }

  return (
    <AlertDialog>
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Daftar Kolam</CardTitle>
            <CardDescription>Kelola semua kolam Anda di satu tempat.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Cari nama kolam..."
                  className="pl-10 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button asChild className="w-full sm:w-auto flex-shrink-0">
                <Link href="/add-pond">
                  <PlusCircle className="mr-2 h-5 w-5" />
                  Tambah Kolam
                </Link>
              </Button>
            </div>
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Kolam</TableHead>
                    <TableHead className="text-right w-[100px]">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPonds.length > 0 ? (
                    filteredPonds.map((pond) => (
                      <TableRow key={pond.id}>
                        <TableCell className="font-medium">{pond.name}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-5 w-5" />
                                <span className="sr-only">Menu Aksi</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onSelect={() => router.push('/dashboard')}>
                                <Info className="mr-2 h-4 w-4" />
                                Detail
                              </DropdownMenuItem>
                              <DropdownMenuItem onSelect={() => toast({ title: "Fitur 'Edit' belum tersedia."})}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                               <AlertDialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => {e.preventDefault(); setPondToDelete(pond);}}>
                                    <Trash2 className="mr-2 h-4 w-4 text-destructive" />
                                    <span className="text-destructive">Hapus</span>
                                </DropdownMenuItem>
                               </AlertDialogTrigger>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={2} className="h-24 text-center text-muted-foreground">
                        {searchTerm ? 'Kolam tidak ditemukan.' : 'Anda belum memiliki kolam.'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

       <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Apakah Anda Yakin?</AlertDialogTitle>
          <AlertDialogDescription>
            Tindakan ini tidak dapat dibatalkan. Ini akan menghapus kolam
            <span className="font-bold"> {pondToDelete?.name} </span>
            secara permanen beserta semua datanya.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setPondToDelete(null)}>Batal</AlertDialogCancel>
          <AlertDialogAction onClick={handleDeletePond}>Ya, Hapus</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
