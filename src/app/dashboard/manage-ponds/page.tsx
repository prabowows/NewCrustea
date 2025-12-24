
'use client';

import { useState } from 'react';
import { usePond, type Pond } from '@/context/PondContext';
import { useUser } from '@/hooks/use-user';
import { database } from '@/lib/firebase';
import { ref, push, set, update, remove } from 'firebase/database';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, MoreHorizontal, AlertTriangle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';

const initialPondState: Omit<Pond, 'id'> = {
    nama: '',
    lokasi: ''
};

export default function ManagePondsPage() {
    const { ponds, loading, fetchInitialData } = usePond();
    const { user } = useUser();
    const { toast } = useToast();
    const router = useRouter();

    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [formData, setFormData] = useState<Omit<Pond, 'id'>>(initialPondState);
    const [pondToDelete, setPondToDelete] = useState<Pond | null>(null);

    const handleAddDialogOpen = () => {
        setFormData(initialPondState);
        setIsAddDialogOpen(true);
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async () => {
        if (!user) {
            toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in.' });
            return;
        }

        if (!formData.nama || !formData.lokasi) {
            toast({ variant: 'destructive', title: 'Error', description: 'Nama dan Lokasi tidak boleh kosong.' });
            return;
        }

        try {
            // Create new pond
            const pondsRef = ref(database, 'ponds');
            const newPondRef = push(pondsRef);
            const newPondId = newPondRef.key;

            if (!newPondId) throw new Error("Failed to generate new pond ID.");

            const updates: { [key: string]: any } = {};
            updates[`/ponds/${newPondId}`] = formData;
            updates[`/user_ponds/${user.uid}/${newPondId}`] = true;

            await update(ref(database), updates);
            toast({ title: 'Sukses', description: 'Kolam baru berhasil ditambahkan.' });
            
            await fetchInitialData();
            setIsAddDialogOpen(false);
        } catch (error: any) {
            console.error("Failed to save pond: ", error);
            toast({ variant: 'destructive', title: 'Gagal', description: error.message });
        }
    };
    
    const handleDeleteConfirmation = (pond: Pond) => {
        setPondToDelete(pond);
        setIsDeleteOpen(true);
    };

    const handleDelete = async () => {
        if (!pondToDelete || !user) return;
        try {
            const updates: { [key: string]: any } = {};
            updates[`/ponds/${pondToDelete.id}`] = null;
            updates[`/user_ponds/${user.uid}/${pondToDelete.id}`] = null;
            // Also remove from pond_devices and potentially other related nodes
            updates[`/pond_devices/${pondToDelete.id}`] = null;

            await update(ref(database), updates);

            toast({ title: 'Sukses', description: `Kolam "${pondToDelete.nama}" telah dihapus.` });
            await fetchInitialData();
            setIsDeleteOpen(false);
            setPondToDelete(null);
        } catch (error: any) {
            console.error("Failed to delete pond: ", error);
            toast({ variant: 'destructive', title: 'Gagal', description: error.message });
        }
    };

    return (
        <div className="space-y-4">
            <Card className="border-primary">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-primary">Kelola Tambak</CardTitle>
                        <CardDescription>Tambah, ubah, atau hapus data kolam Anda.</CardDescription>
                    </div>
                    <Button onClick={handleAddDialogOpen}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Tambah Kolam
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nama Kolam</TableHead>
                                    <TableHead>Lokasi</TableHead>
                                    <TableHead className="text-right w-[80px]">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    Array(3).fill(0).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                            <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                                            <TableCell className="text-right">
                                                <Skeleton className="h-8 w-8 inline-block" />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : ponds && ponds.length > 0 ? (
                                    ponds.map((pond) => (
                                        <TableRow 
                                            key={pond.id} 
                                            onClick={() => router.push(`/dashboard/manage-ponds/${pond.id}`)}
                                            className="cursor-pointer"
                                        >
                                            <TableCell className="font-medium">
                                                {pond.nama}
                                            </TableCell>
                                            <TableCell>{pond.lokasi}</TableCell>
                                            <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <span className="sr-only">Buka menu</span>
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => router.push(`/dashboard/manage-ponds/${pond.id}`)}>
                                                            Lihat/Ubah Detail
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => handleDeleteConfirmation(pond)}
                                                            className="text-destructive focus:text-destructive focus:bg-destructive/10"
                                                        >
                                                            Hapus Kolam
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center">
                                            Tidak ada data kolam ditemukan.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Add Dialog */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Tambah Kolam Baru</DialogTitle>
                        <DialogDescription>
                            Isi detail di bawah ini. Klik simpan jika sudah selesai.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="nama" className="text-right">
                                Nama
                            </Label>
                            <Input id="nama" value={formData.nama} onChange={handleFormChange} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="lokasi" className="text-right">
                                Lokasi
                            </Label>
                            <Input id="lokasi" value={formData.lokasi} onChange={handleFormChange} className="col-span-3" />
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="destructive">Batal</Button>
                        </DialogClose>
                        <Button type="button" onClick={handleSubmit}>Simpan</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            
            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader className="items-center text-center">
                        <div className="rounded-full border border-destructive/20 bg-destructive/10 p-3">
                            <AlertTriangle className="h-10 w-10 text-destructive" />
                        </div>
                        <DialogTitle className="text-2xl font-bold text-destructive">
                            Konfirmasi Hapus
                        </DialogTitle>
                        <DialogDescription className="text-base text-muted-foreground">
                            Apakah Anda yakin ingin menghapus kolam "{pondToDelete?.nama}"? Tindakan ini bersifat permanen dan tidak dapat diurungkan.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex-row justify-center gap-4 pt-4">
                        <Button variant="outline" onClick={() => setIsDeleteOpen(false)} className="w-full">Batal</Button>
                        <Button variant="destructive" onClick={handleDelete} className="w-full">Ya, Hapus Kolam</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
