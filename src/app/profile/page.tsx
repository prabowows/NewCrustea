'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Placeholder user data
const user = {
  name: "Budi Petambak",
  address: "Jl. Tambak Udang No. 1, Indramayu, Jawa Barat",
  phone: "081234567890",
  email: "budi.petambak@example.com",
  avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
  fallback: "BP",
};

export default function ProfilePage() {
  return (
    <div className="flex justify-center items-start py-8">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{user.fallback}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
                <CardTitle className="text-3xl">{user.name}</CardTitle>
                <CardDescription>{user.email}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
            <div className="space-y-2">
                <Label htmlFor="name">Nama Lengkap</Label>
                <Input id="name" value={user.name} readOnly />
            </div>
            <div className="space-y-2">
                <Label htmlFor="address">Alamat</Label>
                <Input id="address" value={user.address} readOnly />
            </div>
            <div className="space-y-2">
                <Label htmlFor="phone">Nomor HP</Label>
                <Input id="phone" value={user.phone} readOnly />
            </div>
            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={user.email} readOnly />
            </div>
            <div className="flex justify-end pt-4">
                <Button>Edit Profile</Button>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
