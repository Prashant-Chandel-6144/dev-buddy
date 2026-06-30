import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ShipFlow AI — The AI Operating System for Product Delivery",
  description:
    "ShipFlow AI manages the complete software delivery lifecycle — from feature request to production. AI-powered PRDs, task breakdown, code review, verification, and deployment for engineering teams.",
  keywords: [
    "AI product delivery",
    "software delivery platform",
    "AI code review",
    "PRD generator",
    "engineering automation",
    "AI deployment",
  ],
  openGraph: {
    title: "ShipFlow AI — The AI Operating System for Product Delivery",
    description:
      "From feature request to production in minutes. AI-powered PRDs, task breakdown, code review, and deployment.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        inter.variable,
        spaceGrotesk.variable,
        jetbrainsMono.variable
      )}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col relative">
        <QueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            disableTransitionOnChange
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
