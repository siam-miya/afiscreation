import Banner from '@/components/Main/Banner'
import BestSelling from '@/components/Main/BestSelling'
import Category from '@/components/Main/Category'
import Featured from '@/components/Main/Featured'
import FlashSales from '@/components/Main/FlashSales'
import OurProducts from '@/components/Main/OurProduct'
import OurSupport from '@/components/Main/OurSupport'
import RadioExprience from '@/components/Main/RadioExprience'
import React from 'react'


export const metadata = {
  title: "Premium Abaya & Borkha | Customization & Online Shop in Bangladesh",

  description:
    "Shop premium abayas and borkhas or customize your own design with your preferred color, size and measurements. Discover elegant modest fashion and ready-to-wear collections from Afis Creation in Bangladesh.",

  alternates: {
    canonical: "https://afiscreation.com",
  },

  openGraph: {
    title:
      "Premium Abaya & Borkha | Customization & Online Shop in Bangladesh",

    description:
      "Shop ready-to-wear abayas and borkhas or create your own customized design with your preferred color, size and measurements. Explore elegant modest fashion from Afis Creation in Bangladesh.",

    url: "https://afiscreation.com",

    siteName: "Afis Creation",

    type: "website",

    locale: "en_BD",
  },
};

const HomePage = () => {
  return (
    <>
      <Banner />
      <FlashSales />
      <Category />
      <BestSelling />
      <RadioExprience />
      <OurProducts />
      <Featured />
      <OurSupport />
    </>
  )
}

export default HomePage