import type { Metadata } from "next";

import { siteMeta } from "@/content/site";

import "./globals.css";

export const metadata: Metadata = {
  title: `${siteMeta.fullName} | ${siteMeta.role}`,
  description: siteMeta.headline,
  metadataBase: new URL("https://ubterzioglu.de"),
  openGraph: {
    title: `${siteMeta.fullName} | ${siteMeta.role}`,
    description: siteMeta.headline,
    siteName: siteMeta.fullName,
    type: "website"
  },
  alternates: {
    canonical: "/"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className="text-sm leading-6 text-ink/68 sm:text-base">{children}</body>
    </html>
  );
}
