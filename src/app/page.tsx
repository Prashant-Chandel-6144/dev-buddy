import Link from "next/link";
import Image from "next/image";
import { BackgroundGrid } from "@/components/ui/background-grid";

export default function Home() {
  return (
    <div className="relative flex flex-col min-h-screen items-center justify-center bg-background text-foreground">
      <BackgroundGrid className="fixed inset-0 -z-10" />
      <main className="z-10 flex flex-col items-center gap-8 px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-5xl font-bold tracking-tighter text-primary sm:text-6xl">
          Welcome to Dev Buddy
        </h1>
        <p className="max-w-xl text-center text-lg text-muted-foreground">
          A modern development companion powered by AI. Explore, code, and collaborate with a sleek UI built on shadcn/ui and Tailwind.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Get Started
          </Link>
          <Link
            href="/about"
            className="inline-flex items-center justify-center rounded-md border border-primary px-6 py-3 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
          >
            Learn More
          </Link>
        </div>
        <div className="mt-8 flex items-center gap-4">
          <Image src="/next.svg" alt="Next.js" width={100} height={24} className="dark:invert" priority />
          <Image src="/vercel.svg" alt="Vercel" width={24} height={24} className="dark:invert" priority />
        </div>
      </main>
    </div>
  );
}
