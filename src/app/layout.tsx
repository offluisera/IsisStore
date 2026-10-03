import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/features/cart/context/cart-context";
import { ToastProvider } from "@/components/ui/toast-context";
import { CartDrawer } from "@/components/commerce/cart-drawer";

import { getStoreSettings } from "@/lib/settings/store-settings";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#ffffff",
};

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getStoreSettings();
  const keywords = settings.seo_keywords
    ? settings.seo_keywords
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean)
    : [];

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://isisstore.com.br";

  return {
    title: {
      default: settings.meta_title || settings.store_name,
      template: `%s — ${settings.store_name}`,
    },
    description: settings.meta_description || settings.store_description,
    keywords,
    icons: {
      icon: settings.favicon_url || "/favicon.ico",
      shortcut: settings.favicon_url || "/favicon.ico",
      apple: settings.favicon_url || "/favicon.ico",
    },
    metadataBase: new URL(appUrl),
    alternates: {
      canonical: settings.canonical_url || appUrl,
    },
    openGraph: {
      title: settings.meta_title || settings.store_name,
      description: settings.meta_description || settings.store_description,
      url: settings.canonical_url || appUrl,
      siteName: settings.store_name,
      images: [
        {
          url: settings.og_image_url || "/images/logo/logo.jpeg",
          width: 1200,
          height: 630,
          alt: settings.store_name,
        },
      ],
      locale: "pt_BR",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: settings.meta_title || settings.store_name,
      description: settings.meta_description || settings.store_description,
      images: [settings.og_image_url || "/images/logo/logo.jpeg"],
    },
  };
}


import { StoreSettingsProvider } from "@/lib/settings/store-settings-context";
import { ThemeProvider } from "@/lib/theme/theme-context";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getStoreSettings();

  return (
    <html lang="pt-BR" className={`${inter.variable} ${playfair.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-fundo text-texto-escuro font-sans selection:bg-secundaria selection:text-texto-escuro overflow-x-hidden w-full max-w-full">
        <ThemeProvider>
          <StoreSettingsProvider initialSettings={settings}>
            <ToastProvider>
              <CartProvider>
                {children}
                <CartDrawer />
              </CartProvider>
            </ToastProvider>
          </StoreSettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
