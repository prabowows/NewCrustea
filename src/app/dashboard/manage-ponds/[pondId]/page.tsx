
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { usePond, type Pond, type Device } from '@/context/PondContext';
import { database } from '@/lib/firebase';
import { ref, update, set, get } from 'firebase/database';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, HardDrive, Edit, PlusCircle, AlertTriangle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import Image from 'next/image';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

export default function PondDetailPage() {
    const { pondId } = useParams();
    const router = useRouter();
    const { ponds, allDevices, pondDevices, loading: contextLoading, fetchInitialData } = usePond();
    const { toast } = useToast();

    const [isEditing, setIsEditing] = useState(false);
    const [pondData, setPondData] = useState<Partial<Omit<Pond, 'id'>>>({ nama: '', lokasi: '', gmaps_url: '' });
    const [isAddDeviceOpen, setIsAddDeviceOpen] = useState(false);
    const [newDeviceId, setNewDeviceId] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // State for remove device dialog
    const [isRemoveDeviceOpen, setIsRemoveDeviceOpen] = useState(false);
    const [deviceToRemove, setDeviceToRemove] = useState<Device | null>(null);


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
                gmaps_url: currentPond.gmaps_url,
            });
        }
    }, [currentPond]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        
        if (id === 'gmaps_url') {
            const iframeRegex = /<iframe src="([^"]+)"/;
            const match = value.match(iframeRegex);
            if (match && match[1]) {
                setPondData(prev => ({ ...prev, [id]: match[1] }));
            } else {
                setPondData(prev => ({ ...prev, [id]: value }));
            }
        } else {
            setPondData(prev => ({ ...prev, [id]: value }));
        }
    };

    const handleSave = async () => {
        if (!pondId) return;
        const dataToSave = {
            ...pondData,
            gmaps_url: pondData.gmaps_url || null,
        };

        try {
            const pondRef = ref(database, `ponds/${pondId}`);
            await update(pondRef, dataToSave);
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
            setPondData({ nama: currentPond.nama, lokasi: currentPond.lokasi, gmaps_url: currentPond.gmaps_url });
        }
        setIsEditing(false);
    }
    
    const handleAddDevice = async () => {
        setIsSubmitting(true);
        const pondIdStr = pondId as string;
        if (!pondIdStr || !newDeviceId) {
            toast({ variant: 'destructive', title: 'Error', description: 'ID Perangkat tidak boleh kosong.' });
            setIsSubmitting(false);
            return;
        }

        try {
            // Check if device exists in the main /devices node
            const deviceRef = ref(database, `devices/${newDeviceId}`);
            const deviceSnap = await get(deviceRef);
            if (!deviceSnap.exists()) {
                 toast({ variant: 'destructive', title: 'Error', description: `Perangkat dengan ID "${newDeviceId}" tidak ditemukan.` });
                 setIsSubmitting(false);
                 return;
            }

            // Check if device is already in a pond
            if (deviceSnap.val().pond_id) {
                 toast({ variant: 'destructive', title: 'Error', description: `Perangkat "${newDeviceId}" sudah terhubung ke kolam lain.` });
                 setIsSubmitting(false);
                 return;
            }

            // Atomically update both locations
            const updates: { [key: string]: any } = {};
            updates[`/pond_devices/${pondIdStr}/${newDeviceId}`] = true;
            updates[`/devices/${newDeviceId}/pond_id`] = pondIdStr;
            
            await update(ref(database), updates);

            toast({ title: 'Sukses', description: `Perangkat "${newDeviceId}" berhasil ditambahkan ke kolam.` });
            
            await fetchInitialData(); // Refresh all data from context
            setIsAddDeviceOpen(false); // Close dialog
            setNewDeviceId(''); // Reset input
        } catch (error: any) {
            console.error("Failed to add device to pond: ", error);
            toast({ variant: 'destructive', title: 'Gagal', description: `Gagal menambahkan perangkat: ${error.message}` });
        } finally {
            setIsSubmitting(false);
        }
    }
    
    const handleRemoveDeviceConfirmation = (device: Device) => {
        setDeviceToRemove(device);
        setIsRemoveDeviceOpen(true);
    };

    const handleRemoveDevice = async () => {
        if (!deviceToRemove || !pondId) return;

        const pondIdStr = pondId as string;
        const deviceId = deviceToRemove.id;
        
        setIsSubmitting(true);
        try {
            const updates: { [key: string]: any } = {};
            updates[`/pond_devices/${pondIdStr}/${deviceId}`] = null;
            updates[`/devices/${deviceId}/pond_id`] = null;
            
            await update(ref(database), updates);

            toast({ title: 'Sukses', description: `Perangkat "${deviceId}" berhasil dilepas dari kolam.` });
            
            await fetchInitialData(); // Refresh data
            setIsRemoveDeviceOpen(false); // Close dialog
            setDeviceToRemove(null); // Reset state
        } catch (error: any) {
            console.error("Failed to remove device from pond: ", error);
            toast({ variant: 'destructive', title: 'Gagal', description: `Gagal melepas perangkat: ${error.message}` });
        } finally {
            setIsSubmitting(false);
        }
    };


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
                             <Button size="sm" onClick={() => setIsEditing(true)}>
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
                    <div className="space-y-2">
                        <Label htmlFor="gmaps_url">URL Google Maps</Label>
                         <div className="flex items-center gap-2">
                            <Input 
                                id="gmaps_url" 
                                value={pondData.gmaps_url || ''} 
                                onChange={handleInputChange} 
                                readOnly={!isEditing} 
                                placeholder="Tempel kode <iframe> dari Google Maps di sini"
                                className="flex-grow"
                            />
                        </div>
                    </div>
                </CardContent>
                {isEditing && (
                    <CardFooter className="justify-end gap-2">
                        <Button variant="destructive" onClick={handleCancel}>Batal</Button>
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
                                <Button size="sm" onClick={() => setNewDeviceId('')}>
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Tambah Perangkat
                                </Button>
                            </DialogTrigger>
                             <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Tambah Perangkat Baru</DialogTitle>
                                    <DialogDescription>
                                        Masukkan ID unik perangkat untuk dihubungkan ke kolam ini.
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
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <DialogClose asChild>
                                        <Button type="button" variant="destructive" disabled={isSubmitting}>Batal</Button>
                                    </DialogClose>
                                    <Button type="button" onClick={handleAddDevice} disabled={isSubmitting}>
                                        {isSubmitting ? "Menyimpan..." : "Simpan"}
                                    </Button>
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
                                    <TableHead className="text-right">Aksi</TableHead>
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
                                            <TableCell className="text-right">
                                                <Button variant="destructive" size="sm" onClick={() => handleRemoveDeviceConfirmation(device)}>
                                                    Hapus
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center">
                                            Belum ada perangkat yang terhubung.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Remove Device Confirmation Dialog */}
            <Dialog open={isRemoveDeviceOpen} onOpenChange={setIsRemoveDeviceOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader className="items-center text-center">
                         <div className="rounded-full border border-destructive/20 bg-destructive/10 p-3">
                            <AlertTriangle className="h-10 w-10 text-destructive" />
                        </div>
                        <DialogTitle className="text-2xl font-bold text-destructive">
                           Konfirmasi Melepas Perangkat
                        </DialogTitle>
                        <DialogDescription className="text-base text-muted-foreground">
                            Apakah Anda yakin ingin melepas perangkat "{deviceToRemove?.id}" dari kolam ini? Tindakan ini tidak akan menghapus perangkat dari sistem.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex-row justify-center gap-4 pt-4">
                        <Button variant="outline" onClick={() => setIsRemoveDeviceOpen(false)} disabled={isSubmitting} className="w-full">
                            Batal
                        </Button>
                        <Button variant="destructive" onClick={handleRemoveDevice} disabled={isSubmitting} className="w-full">
                             {isSubmitting ? "Menghapus..." : "Ya, Lepaskan"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

    

    

    

    

    
