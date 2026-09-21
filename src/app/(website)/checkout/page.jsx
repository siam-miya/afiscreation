import React, { Suspense } from 'react';
import CheckoutForm from '@/components/Main/CheckoutForm';
import SubBanner from '@/components/Main/SubBanner';
import { Spinner } from '@heroui/react';

export const metadata = {
  title: 'Checkout || Afis Creation',
  description: 'Provide your billing details and complete your purchase securely.',
};

const CheckoutPage = () => {
  return (
    <section className="font-sans text-black pb-10 lg:pb-20">
      <SubBanner title={"Checkout"} pageName={"Checkout"} />
      <div className='container mx-auto pt-5 px-4 lg:px-0'>
        <h1 className="text-2xl lg:text-3xl font-bold mb-6 lg:mb-10 tracking-wide">Billing Details</h1>
        
        <Suspense fallback={
          <div className="flex flex-col items-center justify-center py-20 gap-2">
            <Spinner color="danger" />
            <span className="text-xs text-gray-400">Loading checkout...</span>
          </div>
        }>
          <CheckoutForm />
        </Suspense>
      </div>
    </section>
  );
};

export default CheckoutPage;