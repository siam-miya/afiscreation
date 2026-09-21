"use client";
import React, { useState, useEffect } from 'react';
import Image from "next/image";
import CountdownTwo from "./CountDownTwo";
import Link from "next/link";

const RadioExprience = () => {
    const [featuredProduct, setFeaturedProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHotBanner = async () => {
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

                const found = productsArray.find(product => product.isHotProductBanner === true);
                setFeaturedProduct(found || null);
            } catch (error) {
                console.error("Failed to fetch hot product banner:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHotBanner();
    }, []);

    if (loading || !featuredProduct) {
        return null;
    }

    return (
        <section className="w-full px-4 md:px-0 mb-12">
            <div className="container mx-auto bg-black rounded-2xl md:rounded-3xl overflow-hidden">
                <div className="py-10 px-6 sm:p-12 md:py-16 md:px-14 flex flex-col md:grid md:grid-cols-2 gap-8 md:gap-12 items-center">
                    <div className="w-full flex flex-col items-center text-center md:items-start md:text-left md:pl-6 lg:pl-12">
                        <p className="text-secondary font-semibold text-sm md:text-base uppercase tracking-wider">
                            Categories
                        </p>
                        <h1 className="text-white text-2xl sm:text-3xl md:text-[40px] lg:text-[48px] leading-tight md:leading-[56px] font-bold py-4 md:py-6 font-poppins max-w-[600px] break-words">
                            {featuredProduct.title}
                        </h1>
                        <div className="my-4 md:my-6 w-full flex justify-center md:justify-start">
                            <CountdownTwo />
                        </div>

                        <div className="pt-6 md:pt-8 w-full md:w-auto">
                            <Link href={`/products/${featuredProduct._id || featuredProduct.id}`} className="block w-full md:w-auto">
                                <button className="w-full md:w-auto bg-secondary text-white hover:bg-primary font-semibold py-3.5 px-10 md:py-4 md:px-12 rounded-[4px] cursor-pointer transition-all duration-300 transform active:scale-95 shadow-lg shadow-[#00ff66]/20">
                                    Buy Now!
                                </button>
                            </Link>
                        </div>
                    </div>
                    <div className="relative flex justify-center items-center w-full mt-4 md:mt-0">
                        <div className="absolute w-[140px] h-[140px] sm:w-[220px] sm:h-[220px] bg-white/10 blur-[60px] md:blur-[80px] rounded-full pointer-events-none"></div>
                        <div className="relative w-[180px] h-[180px] sm:w-[240px] sm:h-[240px] md:w-[320px] md:h-[320px] lg:w-[380px] lg:h-[350px]">
                            <Image
                                src={featuredProduct.thumbnail}
                                fill
                                alt={featuredProduct.title}
                                className="object-contain transform hover:scale-105 transition-transform duration-500"
                                priority
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default RadioExprience;