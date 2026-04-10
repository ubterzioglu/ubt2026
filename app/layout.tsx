import type { Metadata } from "next";
import Script from "next/script";

import { JsonLd } from "@/components/json-ld";
import { buildMetadata } from "@/lib/seo";
import { buildPersonSchema, buildWebSiteSchema, buildProfilePageSchema } from "@/lib/structured-data";

import "./globals.css";

export const metadata: Metadata = buildMetadata({
  canonical: "/"
});

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="text-sm leading-6 text-ink/68 sm:text-base">
        <JsonLd
          id="json-ld-global"
          schema={[buildPersonSchema(), buildWebSiteSchema(), buildProfilePageSchema()]}
        />
        {children}
      </body>
      <Script
        id="ms-clarity"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","v900wrlvts");`
        }}
      />
    </html>
  );
}
