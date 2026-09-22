import Image from "next/image";
import Link from "next/link";
import AddToCartButton from "./AddToCartButton";
import { IoEyeOutline } from "react-icons/io5";
import WishListButton from "./WishListButton";

export default function ProductCard({ product }) {
  const imageSrc = product?.thumbnail || null;
  if (!imageSrc) return null;

  const hasDiscount =
    product.discountPrice &&
    product.discountPrice > 0 &&
    product.discountPrice < product.price;

  const discountPercentage = hasDiscount
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  return (
    <div className="group mx-auto flex h-full w-full min-w-0 flex-col justify-between overflow-hidden rounded-xl border border-gray-100 bg-[#FAFAFA] font-poppins transition-all duration-300 hover:border-gray-200 hover:shadow-xl sm:hover:-translate-y-1.5 md:hover:-translate-y-2 md:hover:shadow-2xl">

      <Link
        href={`/products/${product._id || product.id}`}
        className="block min-w-0 flex-1"
      >
        <div className="relative flex h-[190px] w-full items-center justify-center overflow-hidden bg-white p-1.5 xs:h-[220px] sm:h-[270px] md:h-[320px] lg:h-[360px] xl:h-[380px]">

          {hasDiscount && (
            <span className="absolute left-2 top-2 z-10 rounded-md bg-red-600 px-2 py-1 text-[9px] font-semibold text-white shadow-md sm:left-3 sm:top-3 sm:px-2.5 sm:text-[10px] md:text-xs">
              -{discountPercentage}%
            </span>
          )}

          {/* Wishlist & Quick View Buttons */}
          <div className="absolute right-2 top-2 z-10 flex flex-col items-center gap-1.5 sm:right-3 sm:top-3 sm:gap-2 md:translate-x-4 md:opacity-0 md:group-hover:translate-x-0 md:group-hover:opacity-100 transition-all duration-300 ease-in-out">

            <WishListButton product={product} />

            <span className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white/90 shadow-md backdrop-blur-sm transition-colors hover:bg-white sm:h-8 sm:w-8 md:h-9 md:w-9">
              <IoEyeOutline
                className="h-3.5 w-3.5 text-black sm:h-4 sm:w-4"
                strokeWidth={1.5}
              />
            </span>

          </div>

          <Image
            src={imageSrc}
            alt={product.title || "fashion item"}
            fill
            sizes="(max-width: 480px) 50vw, (max-width: 640px) 310px, (max-width: 768px) 340px, (max-width: 1024px) 300px, 380px"
            className="object-contain object-center p-0 transition-transform duration-500 group-hover:scale-105"
          />

        </div>

        {/* Content Section */}
        <div className="flex flex-col space-y-1 px-2.5 pb-2.5 pt-3 sm:space-y-1.5 sm:px-3 sm:pb-3 sm:pt-3.5 md:px-4 md:pb-2.5">

          <h3 className="line-clamp-1 font-poppins text-[11px] font-medium tracking-wide text-gray-800 sm:text-xs md:text-sm lg:text-base">
            {product.title}
          </h3>

          <div className="flex min-w-0 items-center">

            {hasDiscount ? (
              <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">

                <span className="text-xs font-bold text-gray-900 sm:text-sm md:text-base">
                  <span className="mr-0.5 font-inter text-[10px] font-semibold sm:text-xs md:text-sm">
                    ৳
                  </span>
                  {product.discountPrice}
                </span>

                <span className="text-[10px] text-gray-400 line-through sm:text-xs md:text-sm">
                  ৳{product.price}
                </span>

              </div>
            ) : (
              <span className="text-xs font-bold text-gray-900 sm:text-sm md:text-base">
                <span className="mr-0.5 font-inter text-[10px] font-semibold sm:text-xs md:text-sm">
                  ৳
                </span>
                {product.price}
              </span>
            )}

          </div>

          <div className="flex items-center pt-0.5">

            {product?.stock > 0 ? (
              <span className="rounded border border-emerald-200/60 bg-emerald-50 px-1.5 py-0.5 text-[8px] font-medium text-emerald-600 sm:px-2 sm:text-[10px] md:text-xs">
                In Stock
              </span>
            ) : (
              <span className="rounded border border-rose-200/60 bg-rose-50 px-1.5 py-0.5 text-[8px] font-medium text-rose-600 sm:px-2 sm:text-[10px] md:text-xs">
                Out of Stock
              </span>
            )}

          </div>

        </div>

      </Link>

      {/* Button Section */}
      <div className="flex flex-col gap-1.5 px-2.5 pb-2.5 sm:gap-2 sm:px-3 sm:pb-3 md:px-4 md:pb-4">
        <AddToCartButton product={product} />
      </div>

    </div>
  );
}

