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

  const p1 = products[0];
  const p2 = products[1];
  const p3 = products[2];
  const p4 = products[3];

  return (
    <div className="w-full bg-white py-4 sm:py-6 md:py-12">

      <div className="grid w-full grid-cols-2 gap-2.5 auto-rows-[180px] sm:gap-3 sm:auto-rows-[220px] md:gap-5 md:auto-rows-[280px]">

        {/* First Large Product (Main Featured Card) */}
        {p1 && (
          <div className="relative col-span-2 row-span-2 flex cursor-pointer flex-col justify-end overflow-hidden rounded-xl bg-gray-100 p-4 shadow-sm sm:rounded-2xl sm:p-5 md:p-8 group">

            <div className="absolute inset-0 z-0 h-full w-full overflow-hidden">
              <Image
                src={p1.thumbnail}
                alt={p1.title || 'Product'}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
                priority
              />
            </div>

            {/* Smooth Dark Gradient Scrim for text readability */}
            <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

            <div className="relative z-20 max-w-[92%] text-white sm:max-w-[90%]">

              <h3 className="truncate font-inter text-base font-bold leading-tight tracking-wide drop-shadow-sm sm:text-xl md:text-2xl">
                {p1.title}
              </h3>

              {p1.description && (
                <p className="mt-1.5 line-clamp-2 font-poppins text-[10px] font-light text-gray-200 opacity-90 sm:mt-2 sm:text-xs md:text-sm">
                  {p1.description}
                </p>
              )}

              <Link
                href={`/products/${p1._id || p1.id}`}
                className="group/btn mt-3 inline-flex items-center gap-1 text-[10px] font-semibold underline underline-offset-4 transition-colors hover:text-gray-200 sm:mt-4 sm:gap-1.5 sm:text-xs md:text-sm"
              >
                Shop Now

                <span className="transition-transform duration-300 group-hover/btn:translate-x-1">
                  →
                </span>
              </Link>

            </div>
          </div>
        )}

        {/* Second Product (Wide Card) */}
        {p2 && (
          <div className="relative col-span-2 row-span-1 flex cursor-pointer flex-col justify-end overflow-hidden rounded-xl bg-gray-100 p-4 shadow-sm sm:rounded-2xl sm:p-5 md:p-6 group">

            <div className="absolute inset-0 z-0 h-full w-full overflow-hidden">
              <Image
                src={p2.thumbnail}
                alt={p2.title || 'Product'}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
              />
            </div>

            <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

            <div className="relative z-20 max-w-[90%] text-white">

              <h3 className="truncate font-inter text-sm font-bold leading-tight tracking-wide drop-shadow-sm sm:text-lg md:text-xl">
                {p2.title}
              </h3>

              {p2.description && (
                <p className="mt-1 line-clamp-1 font-inter text-[10px] font-light text-gray-200 opacity-90 sm:mt-1.5 sm:text-xs">
                  {p2.description}
                </p>
              )}

              <Link
                href={`/products/${p2._id || p2.id}`}
                className="group/btn mt-2 inline-flex items-center gap-1 text-[10px] font-semibold underline underline-offset-4 transition-colors hover:text-gray-200 sm:mt-2.5 sm:text-xs"
              >
                Shop Now

                <span className="transition-transform duration-300 group-hover/btn:translate-x-1">
                  →
                </span>
              </Link>

            </div>
          </div>
        )}

        {/* Third Product (Grid Small Card 1) */}
        {p3 && (
          <div className="relative col-span-1 row-span-1 flex cursor-pointer flex-col justify-end overflow-hidden rounded-xl bg-gray-100 p-3.5 shadow-sm sm:rounded-2xl sm:p-4 md:p-6 group">

            <div className="absolute inset-0 z-0 h-full w-full overflow-hidden">
              <Image
                src={p3.thumbnail}
                alt={p3.title || 'Product'}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
              />
            </div>

            <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

            <div className="relative z-20 w-full text-white">

              <h3 className="truncate font-inter text-[11px] font-bold leading-tight tracking-wide drop-shadow-sm sm:text-sm md:text-base">
                {p3.title}
              </h3>

              <Link
                href={`/products/${p3._id || p3.id}`}
                className="group/btn mt-1.5 inline-flex items-center gap-1 text-[9px] font-semibold underline underline-offset-4 transition-colors hover:text-gray-200 sm:mt-2 sm:text-xs"
              >
                Shop Now

                <span className="transition-transform duration-300 group-hover/btn:translate-x-1">
                  →
                </span>
              </Link>

            </div>
          </div>
        )}

        {/* Fourth Product (Grid Small Card 2) */}
        {p4 && (
          <div className="relative col-span-1 row-span-1 flex cursor-pointer flex-col justify-end overflow-hidden rounded-xl bg-gray-100 p-3.5 shadow-sm sm:rounded-2xl sm:p-4 md:p-6 group">

            <div className="absolute inset-0 z-0 h-full w-full overflow-hidden">
              <Image
                src={p4.thumbnail}
                alt={p4.title || 'Product'}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
              />
            </div>

            <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

            <div className="relative z-20 w-full text-white">

              <h3 className="truncate font-inter text-[11px] font-bold leading-tight tracking-wide drop-shadow-sm sm:text-sm md:text-base">
                {p4.title}
              </h3>

              <Link
                href={`/products/${p4._id || p4.id}`}
                className="group/btn mt-1.5 inline-flex items-center gap-1 text-[9px] font-semibold underline underline-offset-4 transition-colors hover:text-gray-200 sm:mt-2 sm:text-xs"
              >
                Shop Now

                <span className="transition-transform duration-300 group-hover/btn:translate-x-1">
                  →
                </span>
              </Link>

            </div>
          </div>
        )}

      </div>

    </div>
  );
};

export default NewArrivalsProducts;