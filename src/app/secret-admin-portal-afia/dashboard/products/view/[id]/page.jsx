"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Edit,
  Package,
  Tag,
  Boxes,
  Zap,
  CheckCircle2,
  XCircle,
  Image as ImageIcon,
  Loader2,
  CalendarDays,
  Hash,
  Palette,
  Ruler,
  FileText,
  Search,
  Globe,
} from "lucide-react";

const Page = () => {
  const params = useParams();
  const router = useRouter();

  const productId = params?.id;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!productId) return;

    const fetchProduct = async () => {
      try {
        setLoading(true);
        setErrorMsg("");

        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

        const res = await fetch(`${apiUrl}/api/products/${productId}`, {
          cache: "no-store",
        });

        const result = await res.json();

        if (!res.ok) {
          throw new Error(
            result?.message || "Failed to load product details."
          );
        }

        /*
          Backend response support:
          {
            success: true,
            data: {...}
          }

          অথবা সরাসরি product object
        */
        const productData =
          result?.data && !Array.isArray(result.data)
            ? result.data
            : result?.product && !Array.isArray(result.product)
            ? result.product
            : result;

        if (!productData || !productData._id) {
          throw new Error("Product data not found.");
        }

        setProduct(productData);
      } catch (error) {
        console.error("Error fetching product:", error);
        setErrorMsg(error.message || "Failed to load product.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const getImageUrl = (image) => {
    if (!image) return "";

    if (typeof image === "string") return image;

    return image?.url || image?.secure_url || image?.path || "";
  };

  const getPrice = () => {
    if (!product) return 0;

    return Number(
      product.discountPrice ?? product.price ?? 0
    );
  };

  const getOriginalPrice = () => {
    if (!product) return 0;

    return Number(product.price ?? 0);
  };

  const formatPrice = (price) => {
    return `৳${Number(price || 0).toLocaleString("en-BD")}`;
  };

  const getStockStatus = () => {
    const stock = Number(product?.stock ?? 0);

    if (stock <= 0) {
      return {
        label: "Out of Stock",
        className: "bg-red-50 text-red-600 border-red-100",
        icon: XCircle,
      };
    }

    if (stock <= 5) {
      return {
        label: "Low Stock",
        className: "bg-yellow-50 text-yellow-700 border-yellow-100",
        icon: Zap,
      };
    }

    return {
      label: "In Stock",
      className: "bg-green-50 text-green-600 border-green-100",
      icon: CheckCircle2,
    };
  };

  const getColors = () => {
    if (!product?.colors) return [];

    if (Array.isArray(product.colors)) {
      return product.colors;
    }

    return [];
  };

  const getSizes = () => {
    if (!product?.sizes) return [];

    if (Array.isArray(product.sizes)) {
      return product.sizes;
    }

    return [];
  };

  const getImages = () => {
    const images = [];

    if (product?.thumbnail) {
      images.push(getImageUrl(product.thumbnail));
    }

    if (Array.isArray(product?.images)) {
      product.images.forEach((image) => {
        const imageUrl = getImageUrl(image);

        if (imageUrl && !images.includes(imageUrl)) {
          images.push(imageUrl);
        }
      });
    }

    return images;
  };

  const formatDate = (date) => {
    if (!date) return "N/A";

    try {
      return new Date(date).toLocaleDateString("en-BD", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  const stockStatus = product ? getStockStatus() : null;
  const StockIcon = stockStatus?.icon;

  const images = getImages();
  const colors = getColors();
  const sizes = getSizes();

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />

          <p className="text-sm text-gray-500">
            Loading product details...
          </p>
        </div>
      </div>
    );
  }

  if (errorMsg || !product) {
    return (
      <div className="min-h-[70vh] bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-orange-500 mb-6"
          >
            <ArrowLeft size={17} />
            Back
          </button>

          <div className="bg-white border border-red-100 rounded-2xl p-10 text-center">
            <XCircle className="w-12 h-12 mx-auto text-red-400 mb-4" />

            <h2 className="text-lg font-semibold text-gray-900">
              Product Not Found
            </h2>

            <p className="text-sm text-gray-500 mt-2">
              {errorMsg || "This product could not be loaded."}
            </p>

            <Link
              href="/secret-admin-portal-afia/dashboard/products"
              className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 rounded-lg bg-orange-500 text-white text-sm font-medium hover:bg-orange-600 transition"
            >
              <ArrowLeft size={16} />
              Back to Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-[1400px] mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-orange-500 transition mb-3"
            >
              <ArrowLeft size={17} />
              Back
            </button>

            <h1 className="text-2xl font-semibold text-gray-900">
              Product Details
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              View complete information about this product.
            </p>
          </div>

          <Link
            href={`/secret-admin-portal-afia/dashboard/products/edit/${product._id}`}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium transition"
          >
            <Edit size={17} />
            Edit Product
          </Link>
        </div>

        {/* Main Product Card */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">

          <div className="grid grid-cols-1 lg:grid-cols-[480px_1fr]">

            {/* Product Images */}
            <div className="p-5 md:p-7 border-b lg:border-b-0 lg:border-r border-gray-200">
              <div className="aspect-square bg-gray-50 rounded-xl overflow-hidden border border-gray-100 flex items-center justify-center">
                {images.length > 0 ? (
                  <img
                    src={images[0]}
                    alt={product.title || "Product"}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-gray-400">
                    <ImageIcon size={45} />
                    <p className="text-sm mt-2">No image available</p>
                  </div>
                )}
              </div>

              {/* Image Gallery */}
              {images.length > 1 && (
                <div className="grid grid-cols-5 gap-3 mt-4">
                  {images.slice(0, 5).map((image, index) => (
                    <div
                      key={`${image}-${index}`}
                      className={`aspect-square rounded-lg overflow-hidden border ${
                        index === 0
                          ? "border-orange-500"
                          : "border-gray-200"
                      } bg-gray-50`}
                    >
                      <img
                        src={image}
                        alt={`${product.title || "Product"} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Product Basic Information */}
            <div className="p-5 md:p-7">

              <div className="flex flex-wrap items-center gap-2 mb-4">
                {product.isFlashSale && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-50 text-orange-600 border border-orange-100 text-xs font-medium">
                    <Zap size={13} />
                    Flash Sale Active
                  </span>
                )}

                {stockStatus && (
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium ${stockStatus.className}`}
                  >
                    <StockIcon size={13} />
                    {stockStatus.label}
                  </span>
                )}
              </div>

              <h2 className="text-2xl md:text-3xl font-semibold text-gray-900">
                {product.title || "Untitled Product"}
              </h2>

              {product.shortDescription && (
                <p className="text-sm text-gray-500 leading-6 mt-3 max-w-3xl">
                  {product.shortDescription}
                </p>
              )}

              {/* Price */}
              <div className="mt-6 flex items-end gap-3">
                <span className="text-3xl font-bold text-gray-900">
                  {formatPrice(getPrice())}
                </span>

                {product.discountPrice &&
                  Number(product.discountPrice) < getOriginalPrice() && (
                    <span className="text-base text-gray-400 line-through mb-1">
                      {formatPrice(getOriginalPrice())}
                    </span>
                  )}
              </div>

              {/* Quick Information */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-7">

                <div className="border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Hash size={16} />
                    <span className="text-xs">SKU</span>
                  </div>

                  <p className="text-sm font-semibold text-gray-900 mt-2 break-all">
                    {product.sku || "N/A"}
                  </p>
                </div>

                <div className="border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Boxes size={16} />
                    <span className="text-xs">Stock</span>
                  </div>

                  <p className="text-sm font-semibold text-gray-900 mt-2">
                    {Number(product.stock ?? 0)} units
                  </p>
                </div>

                <div className="border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Tag size={16} />
                    <span className="text-xs">Category</span>
                  </div>

                  <p className="text-sm font-semibold text-gray-900 mt-2">
                    {typeof product.category === "object"
                      ? product.category?.name || "N/A"
                      : product.category || "N/A"}
                  </p>
                </div>

              </div>

              {/* Product Flags */}
              <div className="mt-7">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Product Status
                </h3>

                <div className="flex flex-wrap gap-2">

                  {[
                    ["Flash Sale", product.isFlashSale],
                    ["Best Selling", product.isBestSelling],
                    ["Hot Product Banner", product.isHotProductBanner],
                    ["Hot Product Section", product.isHotProductSection2],
                    ["Explore Product", product.isExploreProduct],
                    ["Custom Size", product.hasCustomSize],
                  ].map(([label, active]) => (
                    <span
                      key={label}
                      className={`px-3 py-1.5 rounded-lg text-xs border ${
                        active
                          ? "bg-green-50 text-green-600 border-green-100"
                          : "bg-gray-50 text-gray-400 border-gray-100"
                      }`}
                    >
                      {active ? "✓" : "—"} {label}
                    </span>
                  ))}

                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Product Specifications */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">

          {/* Category & Inventory */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 md:p-6">

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Package size={19} />
              </div>

              <div>
                <h3 className="font-semibold text-gray-900">
                  Product Information
                </h3>

                <p className="text-xs text-gray-500 mt-0.5">
                  Basic product details
                </p>
              </div>
            </div>

            <div className="space-y-4">

              <div className="flex items-start justify-between gap-5 py-3 border-b border-gray-100">
                <span className="text-sm text-gray-500">
                  Product ID
                </span>

                <span className="text-sm font-medium text-gray-900 break-all text-right">
                  {product._id}
                </span>
              </div>

              <div className="flex items-start justify-between gap-5 py-3 border-b border-gray-100">
                <span className="text-sm text-gray-500">
                  Slug
                </span>

                <span className="text-sm font-medium text-gray-900 break-all text-right">
                  {product.slug || "N/A"}
                </span>
              </div>

              <div className="flex items-start justify-between gap-5 py-3 border-b border-gray-100">
                <span className="text-sm text-gray-500">
                  Category
                </span>

                <span className="text-sm font-medium text-gray-900 text-right">
                  {typeof product.category === "object"
                    ? product.category?.name || "N/A"
                    : product.category || "N/A"}
                </span>
              </div>

              <div className="flex items-start justify-between gap-5 py-3 border-b border-gray-100">
                <span className="text-sm text-gray-500">
                  Stock
                </span>

                <span className="text-sm font-medium text-gray-900">
                  {Number(product.stock ?? 0)} units
                </span>
              </div>

              <div className="flex items-start justify-between gap-5 py-3">
                <span className="text-sm text-gray-500">
                  Cost Price
                </span>

                <span className="text-sm font-medium text-gray-900">
                  {product.costPrice != null
                    ? formatPrice(product.costPrice)
                    : "N/A"}
                </span>
              </div>

            </div>
          </div>

          {/* Colors & Sizes */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 md:p-6">

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <Palette size={19} />
              </div>

              <div>
                <h3 className="font-semibold text-gray-900">
                  Variations
                </h3>

                <p className="text-xs text-gray-500 mt-0.5">
                  Available colors and sizes
                </p>
              </div>
            </div>

            {/* Colors */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Palette size={15} className="text-gray-400" />
                <span className="text-sm font-medium text-gray-700">
                  Colors
                </span>
              </div>

              {colors.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {colors.map((color, index) => {
                    const colorName =
                      typeof color === "object"
                        ? color?.name || color?.value || "Color"
                        : color;

                    const colorCode =
                      typeof color === "object"
                        ? color?.code || color?.hex
                        : "";

                    return (
                      <div
                        key={`${colorName}-${index}`}
                        className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg"
                      >
                        {colorCode && (
                          <span
                            className="w-4 h-4 rounded-full border border-gray-200"
                            style={{ backgroundColor: colorCode }}
                          />
                        )}

                        <span className="text-xs text-gray-700">
                          {colorName}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-400">
                  No colors added.
                </p>
              )}
            </div>

            {/* Sizes */}
            <div className="mt-6">
              <div className="flex items-center gap-2 mb-3">
                <Ruler size={15} className="text-gray-400" />
                <span className="text-sm font-medium text-gray-700">
                  Sizes
                </span>
              </div>

              {sizes.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {sizes.map((size, index) => {
                    const sizeName =
                      typeof size === "object"
                        ? size?.name || size?.value || "Size"
                        : size;

                    return (
                      <span
                        key={`${sizeName}-${index}`}
                        className="px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-xs font-medium text-gray-700"
                      >
                        {sizeName}
                      </span>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-400">
                  No sizes added.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 md:p-6 mt-6">

          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
              <FileText size={19} />
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Product Description
              </h3>

              <p className="text-xs text-gray-500 mt-0.5">
                Full product description
              </p>
            </div>
          </div>

          {product.description ? (
            <div
              className="text-sm text-gray-600 leading-7 whitespace-pre-wrap"
              dangerouslySetInnerHTML={{
                __html: product.description,
              }}
            />
          ) : (
            <p className="text-sm text-gray-400">
              No description available.
            </p>
          )}
        </div>

        {/* SEO Information */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 md:p-6 mt-6">

          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
              <Search size={19} />
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                SEO Information
              </h3>

              <p className="text-xs text-gray-500 mt-0.5">
                Search engine optimization details
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            <div className="border border-gray-200 rounded-xl p-4">
              <div className="flex items-center gap-2 text-gray-400 mb-2">
                <Globe size={15} />
                <span className="text-xs">
                  Meta Title
                </span>
              </div>

              <p className="text-sm text-gray-800">
                {product.metaTitle || "N/A"}
              </p>
            </div>

            <div className="border border-gray-200 rounded-xl p-4">
              <div className="flex items-center gap-2 text-gray-400 mb-2">
                <Search size={15} />
                <span className="text-xs">
                  Meta Description
                </span>
              </div>

              <p className="text-sm text-gray-800 leading-6">
                {product.metaDescription || "N/A"}
              </p>
            </div>

            <div className="border border-gray-200 rounded-xl p-4 md:col-span-2">
              <div className="flex items-center gap-2 text-gray-400 mb-2">
                <Hash size={15} />
                <span className="text-xs">
                  Meta Keywords
                </span>
              </div>

              <p className="text-sm text-gray-800">
                {Array.isArray(product.metaKeywords)
                  ? product.metaKeywords.join(", ")
                  : product.metaKeywords || "N/A"}
              </p>
            </div>

          </div>
        </div>

        {/* Dates */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 md:p-6 mt-6 mb-8">

          <div className="flex flex-wrap gap-8">

            <div className="flex items-center gap-3">
              <CalendarDays
                size={18}
                className="text-gray-400"
              />

              <div>
                <p className="text-xs text-gray-400">
                  Created
                </p>

                <p className="text-sm font-medium text-gray-800 mt-1">
                  {formatDate(product.createdAt)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <CalendarDays
                size={18}
                className="text-gray-400"
              />

              <div>
                <p className="text-xs text-gray-400">
                  Last Updated
                </p>

                <p className="text-sm font-medium text-gray-800 mt-1">
                  {formatDate(product.updatedAt)}
                </p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Page;