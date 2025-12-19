
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
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const initialPondState: Omit<Pond, 'id'> = {
    nama: '',
    lokasi: ''
};

export default function ManagePondsPage() {
    const { ponds, loading, fetchInitialData } = usePond();
    const { user } = useUser();
    const { toast } = useToast();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [currentPond, setCurrentPond] = useState<Partial<Pond> | null>(null);
    const [formData, setFormData] = useState<Omit<Pond, 'id'>>(initialPondState);
    const [pondToDelete, setPondToDelete] = useState<Pond | null>(null);

    const handleDialogOpen = (pond: Partial<Pond> | null) => {
        setCurrentPond(pond);
        if (pond && 'id' in pond) {
            setFormData({ nama: pond.nama || '', lokasi: pond.lokasi || '' });
        } else {
            setFormData(initialPondState);
        }
        setIsDialogOpen(true);
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
            if (currentPond && 'id' in currentPond && currentPond.id) {
                // Update existing pond
                const pondRef = ref(database, `ponds/${currentPond.id}`);
                await update(pondRef, formData);
                toast({ title: 'Sukses', description: 'Data kolam berhasil diperbarui.' });
            } else {
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
            }
            await fetchInitialData();
            setIsDialogOpen(false);
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
                    <Button onClick={() => handleDialogOpen(null)}>
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
                                    <TableHead className="text-right w-[120px]">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    Array(3).fill(0).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                            <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                                            <TableCell className="text-right space-x-2">
                                                <Skeleton className="h-8 w-8 inline-block" />
                                                <Skeleton className="h-8 w-8 inline-block" />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : ponds && ponds.length > 0 ? (
                                    ponds.map((pond) => (
                                        <TableRow key={pond.id}>
                                            <TableCell className="font-medium">{pond.nama}</TableCell>
                                            <TableCell>{pond.lokasi}</TableCell>
                                            <TableCell className="text-right space-x-2">
                                                <Button variant="outline" size="icon" onClick={() => handleDialogOpen(pond)}>
                                                    <Edit className="h-4 w-4" />
                                                    <span className="sr-only">Ubah</span>
                                                </Button>
                                                <Button variant="destructive" size="icon" onClick={() => handleDeleteConfirmation(pond)}>
                                                    <Trash2 className="h-4 w-4" />
                                                    <span className="sr-only">Hapus</span>
                                                </Button>
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

            {/* Add/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{currentPond && currentPond.id ? 'Ubah Kolam' : 'Tambah Kolam Baru'}</DialogTitle>
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
                            <Button type="button" variant="secondary">Batal</Button>
                        </DialogClose>
                        <Button type="button" onClick={handleSubmit}>Simpan</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            
            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Konfirmasi Hapus</DialogTitle>
                        <DialogDescription>
                            Apakah Anda yakin ingin menghapus kolam "{pondToDelete?.nama}"? Tindakan ini tidak dapat diurungkan.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Batal</Button>
                        <Button variant="destructive" onClick={handleDelete}>Hapus</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
