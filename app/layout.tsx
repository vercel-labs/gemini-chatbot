import { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";

import { Navbar } from "@/components/custom/navbar";
import ThemeClientLayout from "@/components/custom/theme-client-layout";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://italiachat.vercel.ai"),
  title: "Italia Chat",
  description: "Italia Rail chatbot template for train booking.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ThemeClientLayout>
          <SessionProvider>
            <Toaster position="top-center" />
            <Navbar />
            {children}
          </SessionProvider>
        </ThemeClientLayout>
      </body>
    </html>
  );
}
