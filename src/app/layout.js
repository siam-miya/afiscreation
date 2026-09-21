
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata() {
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:5000";

  try {
    const res = await fetch(
      `${apiUrl}/api/settings`,
      {
        cache: "no-store",
      }
    );

    const result = await res.json();

    const settings = result?.data || {};

    return {
      title:
        settings.siteName ||
        "Afis Creation",

      description:
        settings.siteTagline ||
        settings.metaDescription ||
        "Best abaya in Bangladesh",

      icons: {
        icon:
          settings.favicon ||
          "/favicon.ico",
      },
    };

  } catch (error) {

    console.error(
      "Failed to load website settings for metadata:",
      error
    );

    return {
      title: "Afis Creation",

      description:
        "Best abaya in Bangladesh",

      icons: {
        icon: "/favicon.ico",
      },
    };
  }
}

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">

        <GoogleOAuthProvider
          clientId={
            process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
          }
        >

          {children}

          <Toaster
            position="top-right"
          />

        </GoogleOAuthProvider>

      </body>
    </html>
  );
}

