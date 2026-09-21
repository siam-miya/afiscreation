"use client";
import React, { useState, useEffect } from 'react';
import SectionHeading from './SectionHeading';
import 'swiper/css';
import 'swiper/css/navigation';
import ProductCard from './ProductCard';
import Button from './Button';
import Link from 'next/link';

const OurProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOurProducts = async () => {
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

        setProducts(productsArray);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOurProducts();
  }, []);

  if (loading) {
    return null; // অথবা লোডিং স্পিনার দেখাতে পারো
  }

  return (
    <section className="max-w-full">
      <div className="container mx-auto px-4 md:px-0 border-b pb-5 md:pb-2">
        <div className='mt-10 md:mt-20 md:mb-13'>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
            <SectionHeading subHeading={"Our Products"} heading={"Explore Our Products"} countDown={false} />
          </div>
          <div className='mt-6 md:mt-10 mb-8 md:mb-13 grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8'>
            {products.slice(0, 8).map((product) => (
              <div key={product._id || product.id} className="w-full">
                <ProductCard product={product} />
              </div>
            ))}
          </div>

          <div className='text-center mt-15 md:mt-28'>
            <Button TagName={Link} href={"/products"}>View All Products</Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OurProducts;