
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
import { ArrowLeft, HardDrive, Edit, PlusCircle, Info } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import Image from 'next/image';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

const tutorialSteps = [
    {
        title: "Langkah 1: Buka Google Maps & Cari Lokasi",
        description: "Buka Google Maps di browser Anda dan cari lokasi spesifik dari kolam atau tambak Anda.",
        image: "https://picsum.photos/seed/gmaps1/1280/720",
        hint: "google maps search"
    },
    {
        title: "Langkah 2: Klik 'Bagikan'",
        description: "Setelah pin lokasi muncul, klik tombol 'Bagikan' (Share) yang ada di panel informasi lokasi.",
        image: "https://picsum.photos/seed/gmaps2/1280/720",
        hint: "google maps share"
    },
    {
        title: "Langkah 3: Pilih 'Sematkan Peta'",
        description: "Sebuah jendela pop-up akan muncul. Pilih tab 'Sematkan peta' (Embed a map).",
        image: "https://picsum.photos/seed/gmaps3/1280/720",
        hint: "google maps embed"
    },
    {
        title: "Langkah 4: Salin Kode HTML",
        description: "Klik tombol 'SALIN HTML' (COPY HTML) untuk menyalin kode <iframe> ke clipboard Anda.",
        image: "https://picsum.photos/seed/gmaps4/1280/720",
        hint: "copy html code"
    },
    {
        title: "Langkah 5: Tempel di Sini",
        description: "Kembali ke aplikasi ini dan tempel (paste) seluruh kode yang sudah disalin ke dalam kotak input URL.",
        image: "https://picsum.photos/seed/gmaps5/1280/720",
        hint: "paste code"
    },
];


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
        if (!pondId || !newDeviceId) {
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

            // Add device to pond_devices and update the pond_id in devices
            const updates: { [key: string]: any } = {};
            updates[`/pond_devices/${pondId}/${newDeviceId}`] = true;
            
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
                             {isEditing && (
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button variant="ghost" size="icon" className="shrink-0">
                                            <Info className="h-5 w-5 text-muted-foreground" />
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-lg w-[90vw]">
                                        <DialogHeader>
                                            <DialogTitle>Cara Mendapatkan Kode Semat Peta</DialogTitle>
                                            <DialogDescription>
                                                Ikuti langkah-langkah berikut untuk mendapatkan dan menempelkan kode dari Google Maps.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <Carousel className="w-full p-4 relative">
                                            <CarouselContent>
                                                {tutorialSteps.map((step, index) => (
                                                    <CarouselItem key={index}>
                                                        <div className="flex flex-col items-center justify-center text-center">
                                                            <Card className="overflow-hidden border-0 w-full max-w-md">
                                                                <CardContent className="p-0">
                                                                    <div className="aspect-video w-full relative">
                                                                        <Image
                                                                            src={step.image}
                                                                            alt={step.title}
                                                                            fill
                                                                            className="object-contain rounded-md"
                                                                            data-ai-hint={step.hint}
                                                                        />
                                                                    </div>
                                                                </CardContent>
                                                            </Card>
                                                            <div className="mt-4">
                                                                <h3 className="font-semibold text-lg">{step.title}</h3>
                                                                <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">{step.description}</p>
                                                            </div>
                                                        </div>
                                                    </CarouselItem>
                                                ))}
                                            </CarouselContent>
                                            <div className="absolute bottom-[-20px] left-1/2 -translate-x-1/2 flex gap-4 md:hidden">
                                                <CarouselPrevious variant="default" />
                                                <CarouselNext variant="default" />
                                            </div>
                                             <CarouselPrevious className="absolute left-[-20px] top-1/2 -translate-y-1/2 hidden md:inline-flex" />
                                             <CarouselNext className="absolute right-[-20px] top-1/2 -translate-y-1/2 hidden md:inline-flex" />
                                        </Carousel>
                                        <DialogFooter className="mt-4">
                                            <DialogClose asChild>
                                                <Button type="button">Tutup</Button>
                                            </DialogClose>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            )}
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


    