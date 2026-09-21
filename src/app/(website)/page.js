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
  title: "Afis Creation",
  description: "best abaya in bangladesh",
};

const HomePage = () => {
  return (
   <>
   <Banner/>
 <FlashSales/>
 <Category/>
 <BestSelling/>
 <RadioExprience/>
 <OurProducts/>
 <Featured/>
 <OurSupport/>
   </>
  )
}

export default HomePage
