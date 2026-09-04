import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export function generateMetadata(): Metadata {
  const origin = process.env.NEXT_PUBLIC_SITE_ORIGIN ?? "https://my-gentle-aviary.yuan-salene.chatgpt.site";
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const image = `${origin}${basePath}/og.png`;
  const icon = `${origin}${basePath}/favicon.svg`;
  const title = "The Aviary — Birds I’ve met along the way";
  const description = "A field journal of 51 real encounters, 28 species, and six regions—grown from Merlin and eBird.";
  return { title, description, icons:{icon,shortcut:icon}, openGraph:{title,description,images:[{url:image,width:1730,height:909,alt:"The Aviary field journal"}]}, twitter:{card:"summary_large_image",title,description,images:[image]} };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
