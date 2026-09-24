"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const NewArrivalsProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNewArrivals = async () => {
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
        console.error("Failed to fetch new arrivals:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNewArrivals();
  }, []);

  if (loading || !products || products.length === 0) {
    return null;
  }

  // Show up to 4 products in a clean 2x2 grid layout
  const displayProducts = products.slice(0, 4);

  return (
    <div className="w-full bg-white py-6 md:py-12">
      <div className="grid w-full grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
        {displayProducts.map((product, index) => (
          <div
            key={product._id || product.id || index}
            className="relative flex cursor-pointer flex-col justify-end overflow-hidden rounded-xl bg-gray-100 p-5 shadow-sm sm:rounded-2xl md:p-8 h-[260px] sm:h-[300px] md:h-[360px] group"
          >
            {/* Product Image */}
            <div className="absolute inset-0 z-0 h-full w-full overflow-hidden">
              <Image
                src={product.thumbnail}
                alt={product.title || 'Product'}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                priority={index < 2}
              />
            </div>

            {/* Smooth Dark Gradient Scrim for text readability */}
            <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

            {/* Product Info */}
            <div className="relative z-20 max-w-[90%] text-white">
              <h3 className="truncate font-inter text-base font-bold leading-tight tracking-wide drop-shadow-sm sm:text-xl md:text-2xl">
                {product.title}
              </h3>

              {product.description && (
                <p className="mt-1.5 line-clamp-2 font-poppins text-xs font-light text-gray-200 opacity-90 sm:text-sm">
                  {product.description}
                </p>
              )}

              <Link
                href={`/products/${product._id || product.id}`}
                className="group/btn mt-3 inline-flex items-center gap-1 text-xs font-semibold underline underline-offset-4 transition-colors hover:text-gray-200 sm:mt-4 sm:text-sm"
              >
                Shop Now
                <span className="transition-transform duration-300 group-hover/btn:translate-x-1">
                  →
                </span>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewArrivalsProducts;