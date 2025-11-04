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
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { app } from '@/lib/firebase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const auth = getAuth(app);
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: 'Login Berhasil',
        description: 'Anda akan diarahkan ke dasbor.',
      });
      router.push('/dashboard');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Login Gagal',
        description: error.message,
      });
    }
  };

  return (
    <div className="relative min-h-screen w-full">
       <Image
        src="https://images.pexels.com/photos/1483780/pexels-photo-1483780.jpeg"
        alt="Ocean background"
        fill
        className="object-cover object-center -z-10"
        data-ai-hint="ocean underwater"
      />
      <div className="flex min-h-screen flex-col items-center justify-center bg-black/30">
        <div className="w-full max-w-sm">
          <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader className="space-y-4 text-center">
              <div className="flex justify-center">
                  <Link href="/" className="flex items-center gap-2 font-semibold">
                      <Image
                      src="https://res.cloudinary.com/dtnsf2etf/image/upload/v1760671820/logo1-removebg-preview_cyzktd.png"
                      alt="Crustea Logo"
                      width={120}
                      height={40}
                      />
                  </Link>
              </div>
              <CardTitle className="text-2xl">Selamat Datang Kembali</CardTitle>
              <CardDescription>
                Masukkan email dan password Anda untuk masuk ke dasbor
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="nama@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="********" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button className="w-full" onClick={handleLogin}>Login</Button>
              <p className="text-center text-sm text-muted-foreground">
                Belum punya akun?{' '}
                <Link
                  href="/register"
                  className="font-semibold text-primary underline-offset-4 hover:underline"
                >
                  Daftar di sini
                </Link>
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
