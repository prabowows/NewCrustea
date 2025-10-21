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
import { Droplets, Bell, Wifi, QrCode, CheckCircle2, LineChart, Cpu } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useState } from "react";

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
];

const comparisonFeatures = [
    {
        icon: CheckCircle2,
        title: "Centralized Data Platform",
        description: "All your farm data, from water quality history to device status, is gathered in one accessible digital platform."
    },
    {
        icon: LineChart,
        title: "Smart Analytics & Insights",
        description: "Receive intelligent notifications, predictive analysis on crop cycles, and recommendations relevant to your farm's profile."
    },
    {
        icon: Cpu,
        title: "Automated & Remote Control",
        description: "Automate and control your devices like aerators and feeders remotely, saving time and operational costs."
    }
];

const testimonials = [
    {
      name: "Budi Santoso",
      role: "Shrimp Farm Owner",
      avatar: "https://picsum.photos/seed/t1/100/100",
      avatarFallback: "BS",
      quote:
        "Crustea has been a game-changer for my farm. The real-time data and remote control features have simplified my daily operations. Now I can manage my ponds from anywhere, giving me incredible peace of mind.",
    },
    {
      name: "Dr. Anisa Putri",
      role: "Aquaculture Consultant",
      quote:
        "As a consultant, getting accurate and quick data is crucial. Crustea's smart analytics provide deep insights into pond health, allowing me to give better, data-driven advice to my clients. It's a huge step forward for sustainable aquaculture.",
      avatar: "https://picsum.photos/seed/t2/100/100",
      avatarFallback: "AP",
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
        <nav className="ml-auto flex items-center gap-4 sm:gap-6">
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
          <ThemeSwitcher />
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-8 md:py-10">
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
        <section className="w-full py-8 md:py-10 bg-muted">
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
        <section className="w-full py-8 md:py-10">
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
                <Card key={index} className="group">
                  <CardHeader className="flex flex-row items-center gap-4">
                    <feature.icon className="h-10 w-10 text-primary transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-1" />
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
                <TabsTrigger value="with">With Crustea</TabsTrigger>
                <TabsTrigger value="without">Without Crustea</TabsTrigger>
              </TabsList>
              <TabsContent value="with">
                <div className="grid gap-12 lg:grid-cols-2 mt-8 items-center">
                  <div className="rounded-lg overflow-hidden border shadow-lg [perspective:2000px]">
                    <Image
                      src="https://picsum.photos/seed/dashboard/600/400"
                      width={600}
                      height={400}
                      alt="Crustea Dashboard"
                      className="w-full animate-rotate-y-3d"
                      data-ai-hint="dashboard analytics"
                    />
                  </div>
                  <div className="flex flex-col justify-center space-y-6">
                    <h3 className="text-2xl font-bold tracking-tighter sm:text-3xl">Centralized Data, Smarter Decisions</h3>
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
              <TabsContent value="without">
                <div className="grid gap-12 lg:grid-cols-2 mt-8 items-center">
                   <div className="rounded-lg overflow-hidden border bg-background p-4 shadow-lg">
                     <Image
                       src="https://picsum.photos/seed/manual/600/400"
                       width={600}
                       height={400}
                       alt="Manual Labor"
                       className="w-full grayscale"
                       data-ai-hint="manual labor farm"
                     />
                   </div>
                   <div className="flex flex-col justify-center space-y-6">
                     <h3 className="text-2xl font-bold tracking-tighter sm:text-3xl">Manual Operations, Scattered Data</h3>
                     <p className="text-muted-foreground max-w-prose">
                        Relying on manual checks, handwritten logs, and guesswork leads to inefficiencies, higher risks, and potential for crop failure. Data is scattered, difficult to analyze, and real-time decision-making is nearly impossible.
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
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">What Our Users Say</h2>
              <p className="max-w-[900px] mx-auto text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Hear from real farm owners and consultants who have transformed their aquaculture experience.
              </p>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-1 md:grid-cols-2 lg:max-w-none">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="text-left">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center gap-4">
                      <Avatar className="w-20 h-20 border-2 border-primary">
                        <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                        <AvatarFallback>{testimonial.avatarFallback}</AvatarFallback>
                      </Avatar>
                      <blockquote className="text-lg italic text-muted-foreground mt-4">
                        "{testimonial.quote}"
                      </blockquote>
                      <div className="mt-4">
                        <p className="font-semibold">{testimonial.name}</p>
                        <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                      </div>
                    </div>
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
