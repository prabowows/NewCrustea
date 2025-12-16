
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/use-user";
import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { errorEmitter } from "@/lib/error-emitter";
import { FirestorePermissionError } from "@/lib/errors";

type UserProfile = {
  name: string;
  address: string;
  phoneNumber: string;
  email: string;
};

const initialFormData: Omit<UserProfile, 'email'> = {
    name: '',
    address: '',
    phoneNumber: ''
};

export default function ProfilePage() {
  const { user, loading: authLoading } = useUser();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      setLoading(true);
      const docRef = doc(db, "users", user.uid);
      
      getDoc(docRef).then(docSnap => {
        if (docSnap.exists()) {
          const profileData = docSnap.data() as UserProfile;
          setProfile(profileData);
          setFormData({
              name: profileData.name || '',
              address: profileData.address || '',
              phoneNumber: profileData.phoneNumber || ''
          });
        } else {
          console.log("No such document!");
        }
        setLoading(false);
      }).catch(serverError => {
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'get'
        });
        errorEmitter.emit('permission-error', permissionError);
        setLoading(false);
      });
    };

    fetchProfile();
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

    updateDoc(docRef, updatedData)
      .then(() => {
          setProfile(prev => prev ? { ...prev, ...formData } : null);
          setIsEditing(false);
          toast({
              title: "Profil Diperbarui",
              description: "Informasi profil Anda telah berhasil disimpan."
          });
      })
      .catch((serverError) => {
          const permissionError = new FirestorePermissionError({
            path: docRef.path,
            operation: 'update',
            requestResourceData: updatedData,
          });
          errorEmitter.emit('permission-error', permissionError);
      });
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
              <Skeleton className="h-20 w-20 rounded-full" />
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
    .join('');

  return (
    <div className="flex justify-center items-start py-8">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src={`https://i.pravatar.cc/150?u=${user.uid}`} alt={profile.name || ''} />
              <AvatarFallback>{fallback}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
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
                        <Button variant="outline" onClick={handleCancel}>Cancel</Button>
                        <Button onClick={handleSave}>Save Changes</Button>
                    </>
                ) : (
                    <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
                )}
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
