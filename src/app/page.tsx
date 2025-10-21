
"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Droplets, Wifi, BrainCircuit, DollarSign, CheckCircle2, LineChart, Cpu, Zap, Wind, Battery } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useState } from "react";

const partners = [
  { name: "Aqua Dynamics", logo: "https://res.cloudinary.com/dtnsf2etf/image/upload/v1760677133/download_1_etf80y.png" },
  { name: "OceanHarvest", logo: "https://res.cloudinary.com/dtnsf2etf/image/upload/v1760677133/download_2_i3qwn5.png" },
  { name: "Blue Water Farms", logo: "https://res.cloudinary.com/dtnsf2etf/image/upload/v1760677133/download_3_e0h0ea.png" },
  { name: "Shrimp Solutions", logo: "https://res.cloudinary.com/dtnsf2etf/image/upload/v1760677134/download_4_y5g5sg.png" },
  { name: "Marine Tech Inc.", logo: "https://res.cloudinary.com/dtnsf2etf/image/upload/v1760677134/download_5_rslpda.png" },
  { name: "Coastal Aquaculture", logo: "https://res.cloudinary.com/dtnsf2etf/image/upload/v1760677134/download_6_t0j8la.png" },
];

const features = [
  {
    icon: Droplets,
    title: "Pantau Kualitas Air Real-time",
    description: "Monitor parameter kunci seperti DO, pH, suhu, dan salinitas untuk memastikan kondisi optimal untuk udang Anda.",
  },
  {
    icon: Wifi,
    title: "Kontrol Kincir & Pompa",
    description: "Nyalakan dan matikan perangkat dari jarak jauh, atur jadwal, atau biarkan sistem bekerja otomatis sesuai target parameter.",
  },
  {
    icon: BrainCircuit,
    title: "Analisa & Rekomendasi Cerdas",
    description: "Dapatkan notifikasi cerdas, prediksi siklus, dan rekomendasi yang relevan dengan profil tambak Anda.",
  },
  {
    icon: DollarSign,
    title: "Manajemen Pakan & Finansial",
    description: "Catat dan analisis penggunaan pakan serta biaya operasional untuk meningkatkan efisiensi dan profitabilitas.",
  },
];

const comparisonFeatures = [
    {
        icon: CheckCircle2,
        title: "Platform Data Terpusat",
        description: "Semua data tambak Anda, dari riwayat kualitas air hingga status perangkat, terkumpul dalam satu platform digital yang dapat diakses."
    },
    {
        icon: LineChart,
        title: "Analitik & Wawasan Cerdas",
        description: "Terima notifikasi cerdas, analisis prediktif pada siklus panen, dan rekomendasi yang relevan dengan profil tambak Anda."
    },
    {
        icon: Cpu,
        title: "Kontrol Otomatis & Jarak Jauh",
        description: "Otomatiskan dan kontrol perangkat Anda seperti kincir dan feeder dari jarak jauh, menghemat waktu dan biaya operasional."
    }
];

const testimonials = [
    {
      name: "Bapak H. Sugianto",
      role: "Pemilik Tambak, Indramayu",
      avatar: "https://crustea.id/wp-content/uploads/2023/11/Pak-Sugianto-150x150.webp",
      avatarFallback: "HS",
      quote:
        "Crustea sangat membantu dalam efisiensi tenaga kerja dan waktu, terutama dalam monitoring kualitas air. Saya bisa memantau kondisi tambak kapan saja dan di mana saja, bahkan saat sedang tidak di lokasi.",
    },
    {
      name: "Bapak Azis",
      role: "Manajer Tambak, Subang",
      quote:
        "Dengan Crustea, kontrol terhadap kualitas air jadi lebih presisi. Notifikasi real-time memungkinkan kami mengambil tindakan cepat jika ada parameter yang tidak sesuai, sehingga risiko gagal panen bisa diminimalisir.",
      avatar: "https://crustea.id/wp-content/uploads/2023/11/Pak-Azis-150x150.webp",
      avatarFallback: "AZ",
    },
  ];

export default function HomePage() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-14 flex items-center sticky top-0 bg-background/80 backdrop-blur-sm z-50">
        <Link
          href="#"
          className="flex items-center justify-center"
          prefetch={false}
        >
          <img
            src="https://res.cloudinary.com/dtnsf2etf/image/upload/v1760671820/logo1-removebg-preview_cyzktd.png"
            alt="Crustea Logo"
            className="h-8"
          />
          <span className="font-bold text-xl ml-2">Crustea</span>
        </Link>
        <nav className="ml-auto flex items-center gap-4 sm:gap-6">
          <Link
            href="#"
            className="text-sm font-medium hover:underline underline-offset-4"
            prefetch={false}
          >
            Solusi
          </Link>
          <Link
            href="#"
            className="text-sm font-medium hover:underline underline-offset-4"
            prefetch={false}
          >
            Harga
          </Link>
          <Link
            href="#"
            className="text-sm font-medium hover:underline underline-offset-4"
            prefetch={false}
          >
            Tentang Kami
          </Link>
          <Button asChild>
            <Link href="#">Hubungi Kami</Link>
          </Button>
          <ThemeSwitcher />
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-8 md:py-10">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_500px] lg:gap-12 xl:grid-cols-[1fr_600px] items-center">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Revolusi Digital untuk Budidaya Udang Anda
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Tingkatkan produktivitas, efisiensi, dan keberlanjutan tambak udang Anda dengan teknologi monitoring dan manajemen terintegrasi dari Crustea.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link
                    href="#"
                    className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                    prefetch={false}
                  >
                    Jadwalkan Demo
                  </Link>
                  <Link
                    href="/dashboard"
                    className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                    prefetch={false}
                  >
                    Lihat Dashboard
                  </Link>
                </div>
              </div>
              <div className="mx-auto aspect-video overflow-hidden rounded-lg sm:w-full lg:order-last">
                <iframe 
                  className="w-full h-full"
                  src="https://www.youtube.com/embed/tR9EkkuBjUI" 
                  title="YouTube video player" 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen>
                </iframe>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-8 md:py-10 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-sm font-bold tracking-widest text-primary uppercase">DIDUKUNG OLEH</h2>
              </div>
            </div>
            <div className="py-8">
              <Carousel
                plugins={[
                  Autoplay({
                    delay: 2000,
                    stopOnInteraction: true,
                    stopOnMouseEnter: true,
                  }),
                ]}
                opts={{
                  align: "start",
                  loop: true,
                }}
                className="w-full"
              >
                <CarouselContent>
                  {partners.map((partner, index) => (
                    <CarouselItem key={index} className="basis-1/3 md:basis-1/4 lg:basis-1/6">
                      <div className="p-4 flex items-center justify-center h-24">
                        <Image src={partner.logo} alt={partner.name} width={140} height={70} className="object-contain grayscale hover:grayscale-0 transition-all" />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            </div>
          </div>
        </section>

        <section className="w-full py-8 md:py-10">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Produk Unggulan Kami</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Implementasi Eco-Aerator: Aerator Cerdas dan Ramah Lingkungan untuk Akuakultur.
                </p>
              </div>
            </div>
            <div className="grid gap-8 lg:grid-cols-1">
              <Card>
                <CardContent className="grid md:grid-cols-2 gap-6 items-center p-6">
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden">
                    <Image src="https://picsum.photos/seed/aerator/600/400" alt="Eco-Aerator" layout="fill" objectFit="cover" data-ai-hint="eco-aerator aquaculture"/>
                  </div>
                  <div>
                    <CardTitle className="flex items-center gap-2 mb-4"><Wind className="w-6 h-6 text-primary" /> Eco-Aerator</CardTitle>
                    <ul className="list-disc list-inside text-muted-foreground space-y-2">
                      <li>Meningkatkan kualitas dan ukuran udang/ikan hingga 200%.</li>
                      <li>Impeller menghasilkan gelembung lebih kecil untuk kadar oksigen lebih tinggi.</li>
                      <li>Didukung oleh energi terbarukan (Photovoltaic).</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="grid md:grid-cols-2 gap-6 items-center p-6">
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden">
                     <Image src="https://picsum.photos/seed/sensor/600/400" alt="EBII System" layout="fill" objectFit="cover" data-ai-hint="water sensor aquaculture"/>
                  </div>
                  <div>
                    <CardTitle className="flex items-center gap-2 mb-4"><Droplets className="w-6 h-6 text-primary" /> EBII System</CardTitle>
                    <ul className="list-disc list-inside text-muted-foreground space-y-2">
                      <li>Mengukur 4 parameter: pH, DO, salinitas, dan suhu.</li>
                      <li>Terhubung dengan aplikasi mobile untuk pemantauan mudah.</li>
                      <li>Mengurangi emisi GHG hingga 23.044 tCO2e.</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="grid md:grid-cols-2 gap-6 items-center p-6">
                   <div className="relative w-full aspect-video rounded-lg overflow-hidden">
                      <Image src="https://picsum.photos/seed/control/600/400" alt="Smart Energy" layout="fill" objectFit="cover" data-ai-hint="smart energy control"/>
                   </div>
                  <div>
                    <CardTitle className="flex items-center gap-2 mb-4"><Zap className="w-6 h-6 text-primary" /> Smart Energy & Control</CardTitle>
                    <ul className="list-disc list-inside text-muted-foreground space-y-2">
                      <li>Monitor dan kontrol penggunaan energi setiap aerator melalui ponsel.</li>
                      <li>Kontrol otomatis on/off aerator berdasarkan pengukuran EBII System.</li>
                      <li>Meningkatkan efisiensi dan mengurangi biaya operasional.</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="w-full py-8 md:py-10 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Solusi Lengkap Budidaya Udang</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Crustea menyediakan solusi end-to-end untuk membantu Anda mengelola setiap aspek budidaya udang secara efisien dan cerdas.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:max-w-none lg:grid-cols-2 xl:grid-cols-4 mt-12">
              {features.map((feature, index) => (
                <Card key={index} className="group text-center">
                  <CardHeader className="flex flex-col items-center gap-4">
                    <div className="bg-primary/10 p-3 rounded-full">
                       <feature.icon className="h-10 w-10 text-primary transition-transform duration-300 group-hover:scale-110" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>

                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
        <section className="w-full pb-8 md:pb-10">
          <div className="container px-4 md:px-6">
            <Tabs defaultValue="with" className="w-full">
              <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
                <TabsTrigger value="with">Dengan Crustea</TabsTrigger>
                <TabsTrigger value="without">Tanpa Crustea</TabsTrigger>
              </TabsList>
              <TabsContent value="with" className="mt-6">
                <div className="grid gap-12 lg:grid-cols-2 items-center">
                  <div className="relative rounded-lg overflow-hidden border shadow-lg group [perspective:1000px] aspect-video animate-rotate-y-3d">
                     <Image
                       src="https://www.bluelifehub.com/wp-content/uploads/2022/12/Egypt-fish-farming.png"
                       width={600}
                       height={370}
                       alt="Modern Fish Farming"
                       className="w-full h-full object-cover"
                       data-ai-hint="modern aquaculture farm"
                     />
                  </div>
                  <div className="flex flex-col justify-center space-y-6">
                    <h3 className="text-2xl font-bold tracking-tighter sm:text-3xl">Manajemen Budidaya Jadi Lebih Mudah</h3>
                    <ul className="space-y-4">
                      {comparisonFeatures.map((feature, index) => (
                        <li key={index} className="flex items-start gap-4">
                          <feature.icon className="h-8 w-8 text-primary mt-1 flex-shrink-0" />
                          <div>
                            <h4 className="font-semibold text-lg">{feature.title}</h4>
                            <p className="text-muted-foreground">{feature.description}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="without" className="mt-6">
                <div className="grid gap-12 lg:grid-cols-2 items-center">
                   <div className="rounded-lg overflow-hidden border bg-background p-4 shadow-lg">
                     <Image
                       src="https://crustea.id/wp-content/uploads/2023/10/Frame-9-1024x631.webp"
                       width={600}
                       height={370}
                       alt="Manual Labor"
                       className="w-full"
                       data-ai-hint="manual labor farm"
                     />
                   </div>
                   <div className="flex flex-col justify-center space-y-6">
                     <h3 className="text-2xl font-bold tracking-tighter sm:text-3xl">Operasional Manual, Data Terpencar</h3>
                     <p className="text-muted-foreground max-w-prose">
                        Mengandalkan pengecekan manual, pencatatan di buku, dan intuisi menyebabkan inefisiensi, risiko lebih tinggi, dan potensi kegagalan panen. Data tersebar, sulit dianalisis, dan pengambilan keputusan real-time hampir mustahil.
                     </p>
                   </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>
        <section className="w-full py-8 md:py-10 bg-muted">
          <div className="container px-4 md:px-6 text-center">
            <div className="space-y-2 mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Cerita Sukses dari Petambak</h2>
              <p className="max-w-[900px] mx-auto text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Dengarkan langsung dari para pemilik dan manajer tambak yang telah merasakan transformasi bersama Crustea.
              </p>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-1 md:grid-cols-2 lg:max-w-none">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="text-left bg-background">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <blockquote className="text-lg italic text-muted-foreground">
                        "{testimonial.quote}"
                      </blockquote>
                      <div className="flex items-center gap-4 pt-4">
                        <Avatar className="w-16 h-16 border-2 border-primary">
                            <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                            <AvatarFallback>{testimonial.avatarFallback}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-semibold">{testimonial.name}</p>
                            <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
      <footer className="bg-foreground text-background">
        <div className="container px-4 md:px-6 py-8">
            <div className="grid gap-8 md:grid-cols-4">
                <div>
                    <h3 className="font-bold text-lg mb-2">Crustea</h3>
                    <p className="text-sm text-muted-foreground">Revolusi Digital untuk Budidaya Udang Anda.</p>
                </div>
                <div>
                    <h3 className="font-bold text-lg mb-2">Navigasi</h3>
                    <ul className="space-y-2 text-sm">
                        <li><Link href="#" className="text-muted-foreground hover:text-background">Solusi</Link></li>
                        <li><Link href="#" className="text-muted-foreground hover:text-background">Harga</Link></li>
                        <li><Link href="#" className="text-muted-foreground hover:text-background">Tentang Kami</Link></li>
                    </ul>
                </div>
                 <div>
                    <h3 className="font-bold text-lg mb-2">Hubungi Kami</h3>
                    <ul className="space-y-2 text-sm">
                        <li className="text-muted-foreground">Gedung Wisti Sabha, Lt. 3</li>
                        <li className="text-muted-foreground">Universitas Udayana, Jimbaran</li>
                        <li className="text-muted-foreground">info@crustea.com</li>
                    </ul>
                </div>
                 <div>
                    <h3 className="font-bold text-lg mb-2">Ikuti Kami</h3>
                    <div className="flex gap-4">
                         <Link href="#" className="text-muted-foreground hover:text-background">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-instagram"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                         </Link>
                         <Link href="#" className="text-muted-foreground hover:text-background">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-linkedin"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
                         </Link>
                    </div>
                </div>
            </div>
            <div className="border-t border-muted-foreground/20 mt-8 pt-6 text-center text-sm text-muted-foreground">
                <p>&copy; 2024 Crustea. All rights reserved.</p>
            </div>
        </div>
      </footer>
    </div>
  );
}
