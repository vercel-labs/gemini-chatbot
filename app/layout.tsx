import { Suspense } from "react";
import { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Toaster } from "sonner";

import { Navbar } from "@/components/custom/navbar";
import { ThemeProvider } from "@/components/custom/theme-provider";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://gemini.vercel.ai"),
  title: "Gemini Reasoning",
  description:
    "Reasoning and image generation demo powered by Google Gemini 3 models, built with Next.js and the AI SDK.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          rel="preload"
          href="/fonts/geist.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Toaster position="top-center" />
          <Suspense>
            <Navbar />
          </Suspense>
          {children}
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
