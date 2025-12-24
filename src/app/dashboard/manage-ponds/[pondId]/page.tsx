
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { usePond, type Pond, type Device } from '@/context/PondContext';
import { database } from '@/lib/firebase';
import { ref, update, set } from 'firebase/database';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, HardDrive, Edit, PlusCircle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';


export default function PondDetailPage() {
    const { pondId } = useParams();
    const router = useRouter();
    const { ponds, allDevices, pondDevices, loading: contextLoading, fetchInitialData } = usePond();
    const { toast } = useToast();

    const [isEditing, setIsEditing] = useState(false);
    const [pondData, setPondData] = useState<Partial<Omit<Pond, 'id'>>>({ nama: '', lokasi: '' });
    const [isAddDeviceOpen, setIsAddDeviceOpen] = useState(false);
    const [newDeviceId, setNewDeviceId] = useState('');


    const currentPond = useMemo(() => {
        return ponds.find(p => p.id === pondId);
    }, [ponds, pondId]);
    
    const devicesInPond = useMemo(() => {
        if (!pondId || !pondDevices[pondId as string] || !allDevices) return [];
        const deviceKeys = Object.keys(pondDevices[pondId as string]);
        return deviceKeys.map(key => allDevices[key]).filter(Boolean); // filter(Boolean) removes undefined/null
    }, [pondId, pondDevices, allDevices]);

    useEffect(() => {
        if (currentPond) {
            setPondData({
                nama: currentPond.nama,
                lokasi: currentPond.lokasi,
            });
        }
    }, [currentPond]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setPondData(prev => ({ ...prev, [id]: value }));
    };

    const handleSave = async () => {
        if (!pondId) return;

        try {
            const pondRef = ref(database, `ponds/${pondId}`);
            await update(pondRef, pondData);
            toast({ title: 'Sukses', description: 'Data kolam berhasil diperbarui.' });
            setIsEditing(false);
            await fetchInitialData(); // Refresh context data
        } catch (error: any) {
            console.error("Failed to update pond: ", error);
            toast({ variant: 'destructive', title: 'Gagal', description: error.message });
        }
    };
    
    const handleCancel = () => {
        if (currentPond) {
            setPondData({ nama: currentPond.nama, lokasi: currentPond.lokasi });
        }
        setIsEditing(false);
    }
    
    const handleAddDevice = async () => {
        if (!pondId || !newDeviceId) {
            toast({ variant: 'destructive', title: 'Error', description: 'ID Perangkat tidak boleh kosong.' });
            return;
        }

        if (!allDevices[newDeviceId]) {
            toast({ variant: 'destructive', title: 'Error', description: 'ID Perangkat tidak ditemukan di database utama.' });
            return;
        }

        try {
            const deviceInPondRef = ref(database, `/pond_devices/${pondId}/${newDeviceId}`);
            await set(deviceInPondRef, true);
            toast({ title: 'Sukses', description: 'Perangkat baru berhasil ditambahkan ke kolam.' });
            
            await fetchInitialData(); // Refresh all data
            setIsAddDeviceOpen(false); // Close dialog
            setNewDeviceId(''); // Reset input
        } catch (error: any) {
            console.error("Failed to add device to pond: ", error);
            toast({ variant: 'destructive', title: 'Gagal', description: `Gagal menambahkan perangkat: ${error.message}` });
        }
    }


    if (contextLoading) {
        return (
             <Card className="border-primary">
                <CardHeader>
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-48" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </CardContent>
                <CardFooter>
                    <Skeleton className="h-10 w-24" />
                </CardFooter>
            </Card>
        );
    }

    if (!currentPond) {
        return (
            <Card className="border-primary text-center">
                <CardHeader>
                    <CardTitle className="text-destructive">Kolam Tidak Ditemukan</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Data untuk kolam ini tidak dapat ditemukan. Mungkin telah dihapus.</p>
                    <Button asChild variant="link" className="mt-4">
                        <Link href="/dashboard/manage-ponds">Kembali ke Daftar Kolam</Link>
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                    <span className="sr-only">Kembali</span>
                </Button>
                <h1 className="text-2xl font-bold tracking-tight">Detail Kolam</h1>
            </div>

            <Card className="border-primary">
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-primary">{currentPond.nama}</CardTitle>
                            <CardDescription>Lihat dan ubah detail untuk kolam ini.</CardDescription>
                        </div>
                        {!isEditing && (
                             <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                                <Edit className="mr-2 h-4 w-4"/>
                                Ubah Data
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="space-y-2">
                        <Label htmlFor="nama">Nama Kolam</Label>
                        <Input id="nama" value={pondData.nama || ''} onChange={handleInputChange} readOnly={!isEditing} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="lokasi">Lokasi Kolam</Label>
                        <Input id="lokasi" value={pondData.lokasi || ''} onChange={handleInputChange} readOnly={!isEditing} />
                    </div>
                </CardContent>
                {isEditing && (
                    <CardFooter className="justify-end gap-2">
                        <Button variant="ghost" onClick={handleCancel}>Batal</Button>
                        <Button onClick={handleSave}>Simpan Perubahan</Button>
                    </CardFooter>
                )}
            </Card>
            
            <Card className="border-primary">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <HardDrive className="h-5 w-5 text-primary"/>
                            <div>
                                <CardTitle className="text-primary">Perangkat Terhubung</CardTitle>
                                <CardDescription>Daftar perangkat yang terpasang di kolam ini.</CardDescription>
                            </div>
                        </div>
                        <Dialog open={isAddDeviceOpen} onOpenChange={setIsAddDeviceOpen}>
                            <DialogTrigger asChild>
                                <Button size="sm">
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Tambah Perangkat
                                </Button>
                            </DialogTrigger>
                             <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Tambah Perangkat ke Kolam</DialogTitle>
                                    <DialogDescription>
                                        Masukkan ID perangkat yang ingin Anda hubungkan ke kolam ini.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="deviceId" className="text-right">
                                            ID Perangkat
                                        </Label>
                                        <Input
                                            id="deviceId"
                                            value={newDeviceId}
                                            onChange={(e) => setNewDeviceId(e.target.value)}
                                            className="col-span-3"
                                            placeholder="Contoh: EBII_XXXXXXXX"
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <DialogClose asChild>
                                        <Button type="button" variant="secondary">Batal</Button>
                                    </DialogClose>
                                    <Button type="button" onClick={handleAddDevice}>Simpan</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardHeader>
                <CardContent>
                     <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID Perangkat</TableHead>
                                    <TableHead>Tipe</TableHead>
                                    <TableHead>Nama</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {devicesInPond.length > 0 ? (
                                    devicesInPond.map(device => (
                                        <TableRow key={device.id}>
                                            <TableCell className="font-mono text-xs">{device.id}</TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">{device.tipe}</Badge>
                                            </TableCell>
                                            <TableCell>{device.name || '-'}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center">
                                            Belum ada perangkat yang terhubung.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
