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
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { auth, db } from '@/lib/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/errors';

const registerSchema = z.object({
  name: z.string().min(1, { message: 'Nama tidak boleh kosong.' }),
  email: z.string().email({ message: 'Alamat email tidak valid.' }),
  password: z.string().min(6, { message: 'Kata sandi minimal 6 karakter.' }),
});

type RegisterFormValues = z.infer<typeof registerSchema>;


export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;

      const userDocRef = doc(db, 'users', user.uid);
      const newUserProfile = {
        name: data.name,
        email: data.email,
        address: '',
        phoneNumber: '',
        createdAt: new Date(),
      };

      setDoc(userDocRef, newUserProfile)
        .then(() => {
            toast({
              title: 'Registrasi Berhasil',
              description: 'Akun Anda telah dibuat. Silakan login.',
            });
            router.push('/login');
        })
        .catch((serverError) => {
            // This is the new error handling part
            const permissionError = new FirestorePermissionError({
                path: userDocRef.path,
                operation: 'create',
                requestResourceData: newUserProfile,
            });
            errorEmitter.emit('permission-error', permissionError);
        });

    } catch (error: any) {
      // This catch block handles auth errors, not Firestore errors.
      console.error('Registration auth error:', error.code, error.message);
      let description = 'Terjadi kesalahan. Silakan coba lagi.';
      if (error.code === 'auth/email-already-in-use') {
        description = 'Alamat email ini sudah terdaftar. Silakan gunakan email lain atau login.';
      }
      toast({
        variant: 'destructive',
        title: 'Registrasi Gagal',
        description,
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
                Isi form untuk mendaftar dan mulai revolusi digital tambak Anda.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nama Lengkap</FormLabel>
                          <FormControl>
                            <Input placeholder="Nama Anda" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="email@contoh.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Kata Sandi</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                      {form.formState.isSubmitting ? 'Memproses...' : 'Daftar'}
                    </Button>
                  </form>
                </Form>
            </CardContent>
             <CardFooter className="flex flex-col gap-4">
                <p className="text-center text-sm text-muted-foreground">
                Sudah punya akun?{' '}
                <Link
                  href="/login"
                  className="font-semibold text-primary underline-offset-4 hover:underline"
                >
                  Masuk di sini
                </Link>
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
