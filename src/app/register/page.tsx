'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { app, db, database } from '@/lib/firebase';
import { Textarea } from '@/components/ui/textarea';
import { doc, setDoc } from 'firebase/firestore';
import { ref, set } from 'firebase/database';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const auth = getAuth(app);
  const router = useRouter();
  const { toast } = useToast();

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Registrasi Gagal',
        description: 'Password dan konfirmasi password tidak cocok.',
      });
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Save user profile to Firestore
      await setDoc(doc(db, "users", user.uid), {
        name: name,
        // The address is no longer collected here
        address: '', 
        phoneNumber: phoneNumber,
        email: email
      });

      // Create an initial entry in Realtime Database with just the owner name
      const userRef = ref(database, `User/${user.uid}`);
      await set(userRef, {
        Owner: name,
        // The 'lokasi' field is removed from here
      });

      toast({
        title: 'Registrasi Berhasil',
        description: 'Akun Anda telah dibuat. Silakan tambahkan kolam pertama Anda.',
      });
      router.push('/add-pond'); // Redirect to add-pond page
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Registrasi Gagal',
        description: error.message,
      });
    }
  };

  return (
    <div className="relative min-h-screen w-full">
      <Image
        src="https://images.pexels.com/photos/20121161/pexels-photo-20121161.jpeg"
        alt="Ocean background"
        fill
        className="object-cover object-center -z-10"
        data-ai-hint="ocean underwater"
      />
      <div className="flex min-h-screen flex-col items-center justify-center bg-black/30 py-12">
        <div className="w-full max-w-sm">
          <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader className="space-y-4 text-center">
              <div className="flex justify-center">
                  <Link href="/home" className="flex items-center gap-2 font-semibold">
                      <Image
                      src="https://res.cloudinary.com/dtnsf2etf/image/upload/v1760671820/logo1-removebg-preview_cyzktd.png"
                      alt="Crustea Logo"
                      width={120}
                      height={40}
                      />
                  </Link>
              </div>
              <CardTitle className="text-2xl">Buat Akun Baru</CardTitle>
              <CardDescription>
                Isi form di bawah ini untuk memulai dengan Crustea
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nama Lengkap</Label>
                <Input id="name" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Nomor HP</Label>
                <Input id="phone" type="tel" placeholder="081234567890" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="nama@contoh.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="********" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
               <div className="grid gap-2">
                <Label htmlFor="confirm-password">Konfirmasi Password</Label>
                <Input id="confirm-password" type="password" placeholder="********" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button className="w-full" onClick={handleRegister}>Register</Button>
               <p className="text-center text-sm text-muted-foreground">
                Sudah punya akun?{' '}
                <Link
                  href="/login"
                  className="font-semibold text-primary underline-offset-4 hover:underline"
                >
                  Login di sini
                </Link>
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
