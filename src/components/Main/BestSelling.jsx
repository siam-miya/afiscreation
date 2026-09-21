"use client";
import React, { useEffect, useState } from 'react';
import SectionHeading from './SectionHeading';
import Button from './Button';
import ProductCard from './ProductCard';
import Link from 'next/link';

const BestSelling = () => {
  const [bestProducts, setBestProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBestSelling = async () => {
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

        // শুধু যেগুলোর isBestSelling true সেগুলো ফিল্টার করা
        const filtered = productsArray.filter(product => product.isBestSelling === true);
        setBestProducts(filtered);

      } catch (error) {
        console.error("Failed to fetch best selling products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBestSelling();
  }, []);

  // যদি লোডিং হয় অথবা কোনো বেস্ট সেলিং প্রোডাক্ট না থাকে, তবে সেকশনটি দেখাবে না
  if (loading || bestProducts.length === 0) {
    return null;
  }

  return (
    <section className="w-full py-8 md:py-12">
      <div className="container px-4 md:px-0">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <SectionHeading subHeading={"This Month"} heading={"Best Selling Products"} countDown={false} />
          </div>
          <div className="flex justify-end shrink-0">
            <Button TagName={Link} href={"/products"}>View All</Button>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mt-6 md:mt-10 mb-10">
          {bestProducts.map((product) => (
            <div key={product._id || product.id} className="w-full">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BestSelling;