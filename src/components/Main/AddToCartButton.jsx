"use client";

import React from "react";
import { useCartStore } from "@/store/useCartStore";
import { toast } from "react-toastify";
import { FiShoppingCart } from "react-icons/fi";

const AddToCartButton = ({ product }) => {
  const addToCart = useCartStore((state) => state.addToCart);
  const cart = useCartStore((state) => state.cart);

  const handleAddToCart = (e) => {
    e.preventDefault();

    const productId = product._id || product.id;
    const selectedColor = product.selectedColor || '';
    const selectedSize = product.selectedSize || '';
    const productNote = product.productNote || '';

    const customization = product.customization || {};

    // Custom measurement সহ ইউনিক cart item ID
    const cartItemId = [
      productId,
      selectedColor,
      selectedSize,
      productNote,
      customization.length || '',
      customization.height || '',
      customization.width || '',
    ].join('-');

    const isAlreadyInCart = cart.some(
      (item) => item.cartItemId === cartItemId
    );

    if (isAlreadyInCart) {
      toast.info(
        `"${product.title}" with this customization is already in cart!`,
        {
          position: "top-center",
          autoClose: 2000,
        }
      );

      return;
    }

    addToCart({
      ...product,
      id: productId,
      cartItemId,
    });

    toast.success(
      `${product.title} added to cart!`,
      {
        position: "top-center",
        autoClose: 1500,
      }
    );
  };

  return (
    <button
      onClick={handleAddToCart}
      className="group/cart relative flex items-center justify-center w-full bg-secondary text-white transition-all duration-300 rounded-sm text-xs sm:text-sm font-medium font-poppins h-9 sm:h-10 overflow-hidden cursor-pointer"
    >
      <span className="transition-all duration-300 group-hover/cart:-translate-y-10 group-hover/cart:opacity-0">
        Add To Cart
      </span>

      <span className="absolute inset-0 flex items-center justify-center translate-y-10 opacity-0 group-hover/cart:translate-y-0 group-hover/cart:opacity-100">
        <FiShoppingCart size={18} />
      </span>
    </button>
  );
};

export default AddToCartButton;