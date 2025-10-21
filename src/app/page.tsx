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
import { Droplets, Bell, Wifi, QrCode } from "lucide-react";

const partners = [
  { name: "Aqua Dynamics", logo: "https://picsum.photos/seed/p1/140/70" },
  { name: "OceanHarvest", logo: "https://picsum.photos/seed/p2/140/70" },
  { name: "Blue Water Farms", logo: "https://picsum.photos/seed/p3/140/70" },
  { name: "Shrimp Solutions", logo: "https://picsum.photos/seed/p4/140/70" },
  { name: "Marine Tech Inc.", logo: "https://picsum.photos/seed/p5/140/70" },
  { name: "Coastal Aquaculture", logo: "https://picsum.photos/seed/p6/140/70" },
  { name: "Prawn Paradise", logo: "https://picsum.photos/seed/p7/140/70" },
  { name: "DeepSea Cultivations", logo: "https://picsum.photos/seed/p8/140/70" },
  { name: "Freshwater Finest", logo: "https://picsum.photos/seed/p9/140/70" },
];

const features = [
  {
    icon: Droplets,
    title: "Real-time Water Quality",
    description: "Get live data on crucial parameters like Dissolved Oxygen (DO), pH, temperature, and salinity, ensuring optimal conditions for your shrimp.",
  },
  {
    icon: Bell,
    title: "Smart Alerts & Notifications",
    description: "Receive instant alerts on your phone when water quality parameters go outside the optimal range, allowing for immediate action.",
  },
  {
    icon: Wifi,
    title: "Remote Aerator Control",
    description: "Manage your pond's aerators from anywhere. Turn them on or off remotely to maintain ideal oxygen levels and save energy.",
  },
  {
    icon: QrCode,
    title: "Easy Device Integration",
    description: "Seamlessly connect and manage all your monitoring devices. Scan a simple QR code to add new sensors to your dashboard.",
  },
]

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-14 flex items-center">
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
          <span className="sr-only">Crustea</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link
            href="#"
            className="text-sm font-medium hover:underline underline-offset-4"
            prefetch={false}
          >
            Features
          </Link>
          <Link
            href="#"
            className="text-sm font-medium hover:underline underline-offset-4"
            prefetch={false}
          >
            Pricing
          </Link>
          <Link
            href="#"
            className="text-sm font-medium hover:underline underline-offset-4"
            prefetch={false}
          >
            About
          </Link>
          <Link
            href="#"
            className="text-sm font-medium hover:underline underline-offset-4"
            prefetch={false}
          >
            Contact
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Smart, Simple & Secure Aquaculture Monitoring
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Crustea provides a comprehensive platform for real-time water quality monitoring, remote aerator control, and data analysis to optimize your shrimp farming operations.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link
                    href="#"
                    className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                    prefetch={false}
                  >
                    Get Started
                  </Link>
                  <Link
                    href="/dashboard"
                    className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                    prefetch={false}
                  >
                    View Dashboard
                  </Link>
                </div>
              </div>
              <div className="mx-auto aspect-video overflow-hidden rounded-xl sm:w-full lg:order-last">
                <iframe
                  className="w-full h-full"
                  src="https://www.youtube.com/embed/tR9EkkuBjUI"
                  title="YouTube video player"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Trusted by Leading Aquaculture Partners</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  We partner with the most innovative companies in the aquaculture industry to bring you the best-in-class monitoring solutions.
                </p>
              </div>
            </div>
            <div className="py-12">
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
                      <div className="p-4 bg-background rounded-lg flex items-center justify-center h-24">
                        <Image src={partner.logo} alt={partner.name} width={140} height={70} className="object-contain" />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Our Core Features</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Crustea empowers shrimp farmers with cutting-edge features designed for efficiency and peace of mind.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:max-w-none lg:grid-cols-2 xl:grid-cols-2 mt-12">
              {features.map((feature, index) => (
                <Card key={index}>
                  <CardHeader className="flex flex-row items-center gap-4">
                    <feature.icon className="h-10 w-10 text-primary" />
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
      </main>
    </div>
  );
}
