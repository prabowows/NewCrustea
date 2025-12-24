
'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Settings, User, LifeBuoy, LogOut, LayoutDashboard, LineChart, Wind, ClipboardList } from "lucide-react";
import Link from "next/link";
import { ThemeSwitcher } from "../theme-switcher";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/hooks/use-user";


export function Header() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useUser();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Logout Berhasil",
        description: "Anda telah keluar dari akun.",
      });
      router.push('/login');
    } catch (error: any) {
       toast({
        variant: "destructive",
        title: "Logout Gagal",
        description: error.message,
      });
    }
  };
  
  const getAvatarFallback = () => {
    if (user?.displayName) {
      return user.displayName.charAt(0).toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  };


  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-4 md:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="flex items-center gap-2">
            <img
            src="https://res.cloudinary.com/dtnsf2etf/image/upload/v1760671820/logo1-removebg-preview_cyzktd.png"
            alt="Crustea Logo"
            className="h-8"
            />
        </Link>
      </div>
      <Dialog>
        <div className="flex items-center gap-4">
          <ThemeSwitcher />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.photoURL || `https://i.pravatar.cc/150?u=${user?.uid}`} alt="User Avatar" />
                  <AvatarFallback>{getAvatarFallback()}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Akun Saya</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <Link href="/dashboard">
                <DropdownMenuItem>
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  <span>Dashboard</span>
                </DropdownMenuItem>
              </Link>
              <Link href="/profile">
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profil</span>
                </DropdownMenuItem>
              </Link>
              <Link href="/dashboard/manage-ponds">
                  <DropdownMenuItem>
                      <ClipboardList className="mr-2 h-4 w-4" />
                      <span>Kelola Tambak</span>
                  </DropdownMenuItem>
              </Link>
              <DropdownMenuItem><LineChart className="mr-2 h-4 w-4" /><span>Monitoring</span></DropdownMenuItem>
              <Link href="/dashboard/aerator">
                <DropdownMenuItem>
                  <Wind className="mr-2 h-4 w-4" />
                  <span>Kontrol Aerator</span>
                </DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator />
              <DialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Keluar</span>
                </DropdownMenuItem>
              </DialogTrigger>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <DialogContent className="sm:max-w-sm">
            <DialogHeader className="items-center text-center">
                <div className="rounded-full border border-primary/20 bg-primary/10 p-3 mb-4">
                    <LogOut className="h-10 w-10 text-primary" />
                </div>
                <DialogTitle className="text-2xl font-bold">
                    Konfirmasi Keluar
                </DialogTitle>
                <DialogDescription className="text-base text-muted-foreground pt-2">
                    Apakah Anda yakin ingin keluar dari akun Anda? Sesi Anda akan berakhir.
                </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex-row justify-center gap-4 pt-4 sm:justify-center">
                <Button variant="destructive" onClick={() => (document.querySelector('[data-radix-dialog-close]') as HTMLElement)?.click()} className="w-full">Batal</Button>
                <Button variant="default" onClick={handleLogout} className="w-full">Yakin</Button>
            </DialogFooter>
        </DialogContent>
       </Dialog>
    </header>
  );
}
