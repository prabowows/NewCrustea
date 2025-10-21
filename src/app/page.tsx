
import { Button } from "@/components/ui/button";
import { PlusSquare, PlayCircle, ArrowRight, LogIn } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b">
        <Link href="#" className="flex items-center justify-center" prefetch={false}>
          <PlusSquare className="h-6 w-6 text-primary" />
          <span className="ml-2 text-xl font-bold">MediPass</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-sm font-medium hover:underline underline-offset-4 text-primary" prefetch={false}>
            Home
          </Link>
          <Link href="#" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>
            Contact Us
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:gap-16">
              <div className="flex flex-col justify-center space-y-6">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                  Your Health Story, Smart, Simple & Secure.
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  MediPass intelligently organizes your complete medical records and provides personalized AI
                  insights, all in a single, secure digital passport.
                </p>
                <div className="flex flex-col gap-4 sm:flex-row">
                  <Button size="lg" className="bg-primary hover:bg-primary/90">
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button size="lg" variant="secondary">
                     <LogIn className="mr-2 h-5 w-5" />
                    Login
                  </Button>
                </div>
              </div>
              <div className="relative flex items-center justify-center">
                <Image
                  src="https://picsum.photos/seed/medipass/600/400"
                  alt="Doctor using a smartphone"
                  width={600}
                  height={400}
                  className="rounded-xl object-cover"
                  data-ai-hint="doctor phone"
                />
                <div className="absolute">
                  <PlayCircle className="h-20 w-20 text-white/80 hover:text-white transition-colors cursor-pointer" />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
