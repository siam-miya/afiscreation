'use client';

import React, { useState, useEffect } from 'react';
import SectionHeading from './SectionHeading';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import ProductCard from './ProductCard';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa6';
import Button from './Button';
import Link from 'next/link';

const FlashSales = () => {
  const [flashProducts, setFlashProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFlashSales = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

        const res = await fetch(`${apiUrl}/api/products`);
        const result = await res.json();

        let productsArray = [];
        if (result.success && result.data) {
          productsArray = result.data;
        } else if (Array.isArray(result)) {
          productsArray = result;
        }

        // শুধু যেগুলোর isFlashSale true সেগুলো ফিল্টার করা
        const filtered = productsArray.filter(
          product => product.isFlashSale === true
        );

        setFlashProducts(filtered);

      } catch (error) {
        console.error("Failed to fetch flash sales:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFlashSales();
  }, []);

  // যদি লোডিং হয় অথবা ডাটাবেজে কোনো ফ্ল্যাশ সেল প্রোডাক্ট না থাকে, তবে সেকশনটি দেখাবে না
  if (loading || flashProducts.length === 0) {
    return null;
  }

  return (
    <section className="w-full">
      <div className="container mx-auto w-full border-b px-3 pb-10 sm:px-4 sm:pb-12 md:pb-16">
        <div className="mt-12 sm:mt-16 md:mt-20">

          <SectionHeading
            subHeading={"today's"}
            heading={"Flash Sales"}
            countDown={true}
            navigationButtons={
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  className="flash-prev flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#F5F5F5] text-sm transition-all hover:bg-primary hover:text-white sm:h-9 sm:w-9 md:h-10 md:w-10"
                >
                  <FaArrowLeft />
                </button>

                <button
                  className="flash-next flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#F5F5F5] text-sm transition-all hover:bg-primary hover:text-white sm:h-9 sm:w-9 md:h-10 md:w-10"
                >
                  <FaArrowRight />
                </button>
              </div>
            }
          />

          <div className="mt-7 w-full sm:mt-8 md:mt-10">
            <Swiper
              modules={[Navigation]}
              spaceBetween={20}
              slidesPerView={4}
              navigation={{
                prevEl: '.flash-prev',
                nextEl: '.flash-next'
              }}
              breakpoints={{
                320: {
                  slidesPerView: 2,
                  spaceBetween: 8
                },
                480: {
                  slidesPerView: 2,
                  spaceBetween: 10
                },
                640: {
                  slidesPerView: 2,
                  spaceBetween: 12
                },
                768: {
                  slidesPerView: 3,
                  spaceBetween: 15
                },
                1024: {
                  slidesPerView: 4,
                  spaceBetween: 20
                },
              }}
              className="!overflow-hidden"
            >
              {flashProducts.map((product) => (
                <SwiperSlide key={product._id || product.id}>
                  <ProductCard product={product} />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          <div className="mt-7 flex justify-center sm:mt-8">
            <Button
              TagName={Link}
              href={"/products"}
            >
              View All Products
            </Button>
          </div>

        </div>
      </div>
    </section>
  );
};

export default FlashSales;