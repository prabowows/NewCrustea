
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/use-user";
import { useEffect, useState, useRef } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db, storage, database } from "@/lib/firebase";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { ref as databaseRef, update as updateDatabase } from "firebase/database";
import { updateProfile as updateAuthProfile } from "firebase/auth";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { errorEmitter } from "@/lib/error-emitter";
import { FirestorePermissionError } from "@/lib/errors";
import { Camera, Loader2 } from "lucide-react";

type UserProfile = {
  name: string;
  address: string;
  phoneNumber: string;
  email: string;
  photoURL?: string;
};

const initialFormData: Omit<UserProfile, 'email' | 'photoURL'> = {
    name: '',
    address: '',
    phoneNumber: ''
};

// Helper function to compress and resize the image
const compressImage = (file: File, maxSize: number = 512): Promise<Blob> => {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.src = URL.createObjectURL(file);
        image.onload = () => {
            const canvas = document.createElement('canvas');
            let { width, height } = image;

            if (width > height) {
                if (width > maxSize) {
                    height = Math.round((height * maxSize) / width);
                    width = maxSize;
                }
            } else {
                if (height > maxSize) {
                    width = Math.round((width * maxSize) / height);
                    height = maxSize;
                }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                return reject(new Error('Could not get canvas context'));
            }
            ctx.drawImage(image, 0, 0, width, height);

            canvas.toBlob((blob) => {
                if (blob) {
                    resolve(blob);
                } else {
                    reject(new Error('Canvas to Blob conversion failed'));
                }
            }, 'image/jpeg', 0.8); // Compress to JPEG with 80% quality
        };
        image.onerror = (error) => {
            reject(error);
        };
    });
};


export default function ProfilePage() {
  const { user, loading: authLoading, setUser } = useUser();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchProfile = async (currentUser: any) => {
    if (!currentUser) return;
    setLoading(true);
    const docRef = doc(db, "users", currentUser.uid);
    try {
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const profileData = {
          ...docSnap.data(),
          photoURL: currentUser.photoURL, // Ensure photoURL is from auth state
        } as UserProfile;
        setProfile(profileData);
        setFormData({
          name: profileData.name || '',
          address: profileData.address || '',
          phoneNumber: profileData.phoneNumber || ''
        });
      } else {
        console.log("No such document!");
      }
    } catch (serverError) {
      const permissionError = new FirestorePermissionError({ path: docRef.path, operation: 'get' });
      errorEmitter.emit('permission-error', permissionError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }
    fetchProfile(user);
  }, [user, authLoading]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({...prev, [id]: value}));
  }

  const handleSave = async () => {
    if (!user) return;
    
    const docRef = doc(db, "users", user.uid);
    const updatedData = {
        name: formData.name,
        address: formData.address,
        phoneNumber: formData.phoneNumber
    };

    const rtdbRef = databaseRef(database, `users/${user.uid}`);
    const rtdbUpdates = { name: formData.name };

    Promise.all([
      updateDoc(docRef, updatedData),
      updateDatabase(rtdbRef, rtdbUpdates),
      user.displayName !== formData.name ? updateAuthProfile(user, { displayName: formData.name }) : Promise.resolve(),
    ]).then(() => {
      setProfile(prev => prev ? { ...prev, ...updatedData } : null);
      setIsEditing(false);
      toast({
        title: "Profil Diperbarui",
        description: "Informasi profil Anda telah berhasil disimpan."
      });
    }).catch((serverError) => {
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'update',
          requestResourceData: updatedData,
        });
        errorEmitter.emit('permission-error', permissionError);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !user) return;
    const file = e.target.files[0];
    
    setIsUploading(true);

    try {
      const compressedBlob = await compressImage(file);
      
      const fileStorageRef = storageRef(storage, `profile_images/${user.uid}`);
      const snapshot = await uploadBytes(fileStorageRef, compressedBlob);
      const downloadURL = await getDownloadURL(snapshot.ref);

      const docRef = doc(db, "users", user.uid);
      const rtdbRef = databaseRef(database, `users/${user.uid}`);

      await Promise.all([
        updateAuthProfile(user, { photoURL: downloadURL }),
        updateDoc(docRef, { photoURL: downloadURL }),
        updateDatabase(rtdbRef, { photoURL: downloadURL })
      ]);
      
      setProfile(p => p ? { ...p, photoURL: downloadURL } : null);
      
      toast({
        title: "Foto Profil Diperbarui",
        description: "Gambar profil baru Anda telah disimpan.",
      });

    } catch (error) {
      console.error("Image upload error:", error);
      toast({
        variant: "destructive",
        title: "Unggah Gagal",
        description: "Tidak dapat mengunggah gambar profil baru. Pastikan file adalah gambar.",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleCancel = () => {
    if (profile) {
        setFormData({
            name: profile.name || '',
            address: profile.address || '',
            phoneNumber: profile.phoneNumber || '',
        });
    }
    setIsEditing(false);
  }

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-start py-8">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <div className="flex items-center gap-6">
              <Skeleton className="h-24 w-24 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-5 w-64" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user || !profile) {
    return (
        <div className="flex justify-center items-start py-8">
            <Card className="w-full max-w-2xl">
                <CardHeader>
                    <CardTitle>Profil tidak ditemukan</CardTitle>
                    <CardDescription>
                        Silakan login untuk melihat profil Anda.
                    </CardDescription>
                </CardHeader>
            </Card>
      </div>
    )
  }

  const fallback = (profile.name || '')
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();

  return (
    <div className="flex justify-center items-start py-8">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative group">
              <Avatar className="h-24 w-24 border-2 border-primary">
                <AvatarImage src={profile.photoURL} alt={profile.name || ''} />
                <AvatarFallback className="text-3xl">{fallback}</AvatarFallback>
              </Avatar>
              <Button
                size="icon"
                className="absolute bottom-0 right-0 rounded-full h-8 w-8 group-hover:bg-primary/90"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                aria-label="Change profile picture"
              >
                {isUploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <Camera className="h-4 w-4" />
                )}
              </Button>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                onChange={handleImageUpload}
                accept="image/png, image/jpeg, image/webp"
              />
            </div>
            <div className="space-y-1 text-center sm:text-left">
                <CardTitle className="text-3xl">{profile.name || 'User'}</CardTitle>
                <CardDescription>{profile.email || ''}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
            <div className="space-y-2">
                <Label htmlFor="name">Nama Lengkap</Label>
                <Input id="name" value={formData.name} readOnly={!isEditing} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="address">Alamat</Label>
                <Input id="address" value={formData.address} readOnly={!isEditing} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="phoneNumber">Nomor HP</Label>
                <Input id="phoneNumber" value={formData.phoneNumber} readOnly={!isEditing} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={profile.email || ''} readOnly />
            </div>
            <div className="flex justify-end pt-4 gap-2">
                {isEditing ? (
                    <>
                        <Button variant="outline" onClick={handleCancel}>Batal</Button>
                        <Button onClick={handleSave}>Simpan Perubahan</Button>
                    </>
                ) : (
                    <Button onClick={() => setIsEditing(true)}>Ubah Profil</Button>
                )}
            </div>
        </CardContent>
      </Card>
    </div>
  );
}

    