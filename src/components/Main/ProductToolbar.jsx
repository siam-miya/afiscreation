"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import { Range, getTrackBackground } from "react-range";
import { TfiLayoutGrid4Alt } from "react-icons/tfi";

const MIN_PRICE_LIMIT = 0;
const MAX_PRICE_LIMIT = 50000;
const STEP = 100;

const ProductToolbar = ({ totalProducts, currentShowing }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const currentMinPrice = parseInt(
    searchParams.get("minPrice") || MIN_PRICE_LIMIT,
    10
  );

  const currentMaxPrice = parseInt(
    searchParams.get("maxPrice") || MAX_PRICE_LIMIT,
    10
  );

  const [priceValues, setPriceValues] = useState([
    currentMinPrice,
    currentMaxPrice,
  ]);

  useEffect(() => {
    setPriceValues([currentMinPrice, currentMaxPrice]);
  }, [currentMinPrice, currentMaxPrice]);

  const currentView = searchParams.get("view") || "4";
  const popupRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target)
      ) {
        setIsFilterOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleParamChange = (key, value) => {
    const params = new URLSearchParams(searchParams.toString());

    params.set(key, value);
    params.set("page", "1");

    router.push(`?${params.toString()}`, {
      scroll: false,
    });
  };

  const handlePriceFilterSubmit = () => {
    const params = new URLSearchParams(searchParams.toString());

    params.set("minPrice", priceValues[0].toString());
    params.set("maxPrice", priceValues[1].toString());
    params.set("page", "1");

    router.push(`?${params.toString()}`, {
      scroll: false,
    });

    setIsFilterOpen(false);
  };

  return (
    <div className="relative z-30 mb-5 flex w-full min-w-0 flex-col gap-4 rounded-md bg-black px-3 py-3.5 font-poppins text-white sm:px-4 sm:py-4 md:mb-6 md:flex-row md:items-center md:justify-between md:gap-4 md:px-6">

      {/* Left Section */}
      <div className="flex min-w-0 w-full flex-col gap-3 md:w-auto md:flex-row md:items-center md:justify-start md:gap-4">

        {/* Filter + Mobile Showing */}
        <div className="flex min-w-0 w-full items-center justify-between border-b border-gray-800 pb-3 md:w-auto md:justify-start md:border-b-0 md:pb-0">

          <div
            className="relative"
            ref={popupRef}
          >
            <button
              onClick={() =>
                setIsFilterOpen(!isFilterOpen)
              }
              className={`flex items-center gap-1.5 rounded px-1.5 py-1 font-medium transition-all ${
                isFilterOpen
                  ? "text-primary"
                  : "text-white hover:text-primary"
              }`}
            >
              <SlidersHorizontal size={17} />

              <span className="text-sm font-semibold text-white hover:text-primary md:text-base">
                Filter
              </span>
            </button>

            {isFilterOpen && (
              <div className="absolute left-0 top-full z-[100] mt-3 w-[calc(100vw-32px)] max-w-80 rounded-2xl border border-gray-100 bg-white p-4 text-black shadow-2xl sm:w-80 sm:p-6">

                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-poppins text-base font-bold text-black sm:text-lg">
                    Filter By Price
                  </h3>

                  <button
                    onClick={() =>
                      setIsFilterOpen(false)
                    }
                    className="cursor-pointer text-gray-400 transition-colors hover:text-black"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="space-y-4 pb-2 pt-1">
                  <Range
                    values={priceValues}
                    step={STEP}
                    min={MIN_PRICE_LIMIT}
                    max={MAX_PRICE_LIMIT}
                    onChange={(values) =>
                      setPriceValues(values)
                    }
                    renderTrack={({
                      props,
                      children,
                    }) => {
                      const {
                        key,
                        ...restProps
                      } = props;

                      return (
                        <div
                          key={key}
                          onMouseDown={
                            restProps.onMouseDown
                          }
                          onTouchStart={
                            restProps.onTouchStart
                          }
                          className="flex h-1.5 w-full"
                        >
                          <div
                            ref={restProps.ref}
                            className="h-1.5 w-full self-center rounded-full"
                            style={{
                              background:
                                getTrackBackground({
                                  values: priceValues,
                                  colors: [
                                    "#ccc",
                                    "#8a5830",
                                    "#ccc",
                                  ],
                                  min: MIN_PRICE_LIMIT,
                                  max: MAX_PRICE_LIMIT,
                                }),
                            }}
                          >
                            {children}
                          </div>
                        </div>
                      );
                    }}
                    renderThumb={({ props }) => {
                      const {
                        key,
                        ...restProps
                      } = props;

                      return (
                        <div
                          key={key}
                          {...restProps}
                          className="h-4 w-4 cursor-pointer rounded-full border-2 border-white bg-[#8a5830] shadow focus:outline-none"
                          style={{
                            ...restProps.style,
                          }}
                        />
                      );
                    }}
                  />

                  <div className="mt-4 flex items-center gap-1 font-poppins text-xs text-gray-500 sm:text-sm">
                    <span>Price:</span>

                    <span className="font-sans font-semibold text-black">
                      {priceValues[0].toLocaleString()}৳
                    </span>

                    <span className="text-gray-400">
                      —
                    </span>

                    <span className="font-sans font-semibold text-black">
                      {priceValues[1].toLocaleString()}৳
                    </span>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-start border-t border-gray-50 pt-4">
                  <button
                    onClick={handlePriceFilterSubmit}
                    className="cursor-pointer rounded-lg bg-[#8a5830] px-5 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-black"
                  >
                    Filter
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Desktop Grid View */}
          <div className="hidden h-5 w-[1px] bg-gray-700 md:block md:mx-4" />

          <div className="hidden items-center gap-4 md:flex">

            <button
              onClick={() =>
                handleParamChange("view", "4")
              }
              className={`cursor-pointer transition-colors ${
                currentView === "4"
                  ? "text-primary"
                  : "text-white hover:text-primary"
              }`}
              title="4 Grid View"
            >
              <TfiLayoutGrid4Alt size={20} />
            </button>

            <button
              onClick={() =>
                handleParamChange("view", "5")
              }
              className={`flex cursor-pointer items-center gap-[2px] transition-colors ${
                currentView === "5"
                  ? "text-primary"
                  : "text-white hover:text-primary"
              }`}
              title="5 Grid View"
            >
              <span className="grid h-[11px] w-[11px] grid-cols-3 gap-[2px]">
                <span className="rounded-[1px] bg-current" />
                <span className="rounded-[1px] bg-current" />
                <span className="rounded-[1px] bg-current" />
                <span className="rounded-[1px] bg-current" />
                <span className="rounded-[1px] bg-current" />
                <span className="rounded-[1px] bg-current" />
              </span>

              <span className="grid h-[11px] w-[7px] grid-cols-2 gap-[2px]">
                <span className="rounded-[1px] bg-current" />
                <span className="rounded-[1px] bg-current" />
                <span className="rounded-[1px] bg-current" />
                <span className="rounded-[1px] bg-current" />
              </span>
            </button>

          </div>

          {/* Mobile Showing */}
          <div className="whitespace-nowrap text-[10px] font-medium text-primary sm:text-xs md:hidden">
            Showing 1–{currentShowing} of{" "}
            {totalProducts}
          </div>
        </div>

        {/* Desktop Showing */}
        <div className="hidden select-none whitespace-nowrap text-sm font-medium text-white md:block">
          Showing 1–{currentShowing} of{" "}
          {totalProducts} products
        </div>

      </div>

      {/* Right Section */}
      <div className="grid w-full min-w-0 grid-cols-2 gap-2.5 sm:gap-3 md:w-auto md:flex md:items-center md:gap-6">

        {/* Show */}
        <div className="flex min-w-0 items-center gap-1.5 text-xs md:justify-start md:text-sm">
          <span className="shrink-0 text-gray-300">
            Show:
          </span>

          <select
            value={searchParams.get("limit") || "16"}
            onChange={(e) =>
              handleParamChange(
                "limit",
                e.target.value
              )
            }
            className="min-w-0 w-full cursor-pointer rounded-bl-xl rounded-tr-xl bg-white px-2 py-1.5 text-center text-xs text-black focus:outline-none sm:px-2.5 md:w-16 md:text-sm"
          >
            <option value="8">8</option>
            <option value="16">16</option>
            <option value="32">32</option>
          </select>
        </div>

        {/* Sort */}
        <div className="flex min-w-0 items-center gap-1.5 text-xs md:justify-start md:text-sm">
          <span className="shrink-0 whitespace-nowrap text-gray-300">
            Sort:
          </span>

          <select
            value={
              searchParams.get("sort") || "default"
            }
            onChange={(e) =>
              handleParamChange(
                "sort",
                e.target.value
              )
            }
            className="min-w-0 w-full cursor-pointer rounded-br-xl rounded-tl-xl bg-white px-2 py-1.5 text-xs text-black focus:outline-none sm:px-2.5 md:min-w-[140px] md:text-sm"
          >
            <option value="default">
              Default
            </option>
            <option value="popularity">
              Popularity
            </option>
            <option value="latest">
              Latest
            </option>
            <option value="low-high">
              Price: Low-High
            </option>
            <option value="high-low">
              Price: High-Low
            </option>
          </select>
        </div>

      </div>
    </div>
  );
};

export default ProductToolbar;

