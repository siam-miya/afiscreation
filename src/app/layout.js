import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = "https://afiscreation.com";

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

    const siteName =
      settings.siteName ||
      "Afis Creation";

    const metaTitle =
      settings.metaTitle ||
      `${siteName} | Premium Abaya & Borkha`;

    const description =
      settings.metaDescription ||
      settings.siteTagline ||
      "Shop elegant abayas, borkhas and modest fashion from Afis Creation in Bangladesh.";

    const favicon =
      settings.favicon ||
      "/favicon.ico";

    return {
      metadataBase: new URL(SITE_URL),

      title: {
        default: metaTitle,
        template: `%s | ${siteName}`,
      },

      description,

      keywords: [
        "abaya",
        "borkha",
        "burqa",
        "abaya Bangladesh",
        "borkha Bangladesh",
        "women's abaya",
        "Islamic fashion",
        "modest fashion",
        "premium abaya",
        "Afis Creation",
      ],

      authors: [
        {
          name: siteName,
        },
      ],

      creator: siteName,

      publisher: siteName,

      applicationName: siteName,

      alternates: {
        canonical: SITE_URL,
      },

      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          "max-image-preview": "large",
          "max-snippet": -1,
          "max-video-preview": -1,
        },
      },

      icons: {
        icon: favicon,
        shortcut: favicon,
        apple: favicon,
      },

      openGraph: {
        type: "website",
        locale: "en_BD",
        url: SITE_URL,
        siteName,
        title: metaTitle,
        description,
        images: [
          {
            url: `${SITE_URL}/og-image.jpg`,
            width: 1200,
            height: 630,
            alt: metaTitle,
          },
        ],
      },

      twitter: {
        card: "summary_large_image",
        title: metaTitle,
        description,
        images: [`${SITE_URL}/og-image.jpg`],
      },
    };
  } catch (error) {
    console.error(
      "Failed to load website settings for metadata:",
      error
    );

    return {
      metadataBase: new URL(SITE_URL),

      title: {
        default:
          "Afis Creation | Premium Abaya & Borkha",
        template: "%s | Afis Creation",
      },

      description:
        "Shop elegant abayas, borkhas and modest fashion from Afis Creation in Bangladesh.",

      keywords: [
        "abaya",
        "borkha",
        "burqa",
        "abaya Bangladesh",
        "borkha Bangladesh",
        "women's abaya",
        "Islamic fashion",
        "modest fashion",
        "premium abaya",
        "Afis Creation",
      ],

      authors: [
        {
          name: "Afis Creation",
        },
      ],

      creator: "Afis Creation",

      publisher: "Afis Creation",

      applicationName: "Afis Creation",

      alternates: {
        canonical: SITE_URL,
      },

      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          "max-image-preview": "large",
          "max-snippet": -1,
          "max-video-preview": -1,
        },
      },

      icons: {
        icon: "/favicon.ico",
        shortcut: "/favicon.ico",
        apple: "/favicon.ico",
      },

      openGraph: {
        type: "website",
        locale: "en_BD",
        url: SITE_URL,
        siteName: "Afis Creation",
        title:
          "Afis Creation | Premium Abaya & Borkha",
        description:
          "Shop elegant abayas, borkhas and modest fashion from Afis Creation in Bangladesh.",
        images: [
          {
            url: `${SITE_URL}/og-image.jpg`,
            width: 1200,
            height: 630,
            alt:
              "Afis Creation - Premium Abaya & Borkha",
          },
        ],
      },

      twitter: {
        card: "summary_large_image",
        title:
          "Afis Creation | Premium Abaya & Borkha",
        description:
          "Shop elegant abayas, borkhas and modest fashion from Afis Creation in Bangladesh.",
        images: [`${SITE_URL}/og-image.jpg`],
      },
    };
  }
}

export default function RootLayout({ children }) {
  return (
    <html suppressHydrationWarning
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col">

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

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  "@id":
                    `${SITE_URL}/#organization`,
                  name: "Afis Creation",
                  url: SITE_URL,
                  logo: {
                    "@type": "ImageObject",
                    url:
                      `${SITE_URL}/navbarLogo.png`,
                  },
                },
                {
                  "@type": "WebSite",
                  "@id":
                    `${SITE_URL}/#website`,
                  url: SITE_URL,
                  name: "Afis Creation",
                  publisher: {
                    "@id":
                      `${SITE_URL}/#organization`,
                  },
                },
              ],
            }),
          }}
        />

      </body>
    </html>
  );
}