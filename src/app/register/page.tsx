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

export default function RegisterPage() {
  const router = useRouter();

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
              <CardTitle className="text-2xl">Registrasi Dinonaktifkan</CardTitle>
              <CardDescription>
                Fitur registrasi pengguna dinonaktifkan sementara.
              </CardDescription>
            </CardHeader>
            <CardContent>
                <Button className="w-full" variant="outline" onClick={() => router.back()}>Kembali</Button>
            </CardContent>
             <CardFooter className="flex flex-col gap-4">
                <p className="text-center text-sm text-muted-foreground">
                Sudah punya akun?{' '}
                <Link
                  href="/dashboard"
                  className="font-semibold text-primary underline-offset-4 hover:underline"
                >
                  Masuk ke Dasbor
                </Link>
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
