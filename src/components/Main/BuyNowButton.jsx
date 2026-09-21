"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/useCartStore";
import { toast } from "react-toastify";

const BuyNowButton = ({ product }) => {
  const router = useRouter();
  const addToCart = useCartStore((state) => state.addToCart);

  const handleBuyNow = (e) => {
    e.preventDefault();
    addToCart(product);
    toast.success(`Fill up the form and click the 'Order Now' button to buy the ${product.title} product.`, {
      position: "top-center",
      autoClose: 5000,
    });
    router.push("/checkout?buyNow=true");
  };

  return (
    <button
      onClick={handleBuyNow}
      className="w-full bg-primary text-white font-poppins py-2 rounded-sm text-xs sm:text-sm font-medium hover:bg-secondary transition-colors cursor-pointer h-9 sm:h-10 flex items-center justify-center"
    >
      Buy Now
    </button>
  );
};

export default BuyNowButton;