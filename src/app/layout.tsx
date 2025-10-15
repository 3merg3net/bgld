import "./globals.css";
import type { Metadata } from "next";

const siteName = "BASE GOLD — $BGLD";
const siteDesc = "The Digital Fort Knox of Base. Legal tender for meme value only.";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://basereserve.gold";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: siteName,
  description: siteDesc,
  openGraph: {
    title: siteName,
    description: siteDesc,
    url: siteUrl,
    siteName,
    images: ["/og/og-bgld.png"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: siteName,
    description: siteDesc,
    images: ["/og/og-bgld.png"],
  },
  icons: {
    icon: [{ url: "/favicon.ico" }],
    other: [
      { rel: "icon", url: "/icons/icon-192.png", type: "image/png", sizes: "192x192" },
      { rel: "icon", url: "/icons/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0B0F14] text-white antialiased">
       
       
       
        {/* GLOBAL TEXTURE BACKDROP */}
        <div className="fixed inset-0 -z-10 pointer-events-none">
          <img
            src="/textures/guilloche.png"
            alt=""
            aria-hidden="true"
            className="h-full w-full object-cover opacity-10 mix-blend-overlay"
          />
        </div>
        {children}
      </body>
    </html>
  );
}
