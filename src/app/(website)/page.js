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
  title: "Premium Abaya & Borkha in Bangladesh",
  description:
    "Shop premium abayas, borkhas and modest fashion from Afis Creation. Discover elegant designs, quality fabrics and comfortable modest wear in Bangladesh.",
  alternates: {
    canonical: "https://afiscreation.com",
  },
  openGraph: {
    title: "Premium Abaya & Borkha in Bangladesh | Afis Creation",
    description:
      "Shop premium abayas, borkhas and modest fashion from Afis Creation. Discover elegant designs and comfortable modest wear in Bangladesh.",
    url: "https://afiscreation.com",
    siteName: "Afis Creation",
    type: "website",
    locale: "en_BD",
  },
}

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