"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { RotateCcw, ChevronRight, Layers } from "lucide-react";
import { Range } from "react-range";
import axios from "axios";

const MIN_PRICE_LIMIT = 0;
const MAX_PRICE_LIMIT = 50000;
const STEP = 100;

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000";

const FilterProduct = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentCategory =
    searchParams.get("category") || "all";

  const currentColor =
    searchParams.get("color") || "all";

  const currentMinPrice = parseInt(
    searchParams.get("minPrice") ||
      MIN_PRICE_LIMIT,
    10
  );

  const currentMaxPrice = parseInt(
    searchParams.get("maxPrice") ||
      MAX_PRICE_LIMIT,
    10
  );

  const [priceValues, setPriceValues] =
    useState([
      currentMinPrice,
      currentMaxPrice,
    ]);

  const [categories, setCategories] =
    useState([]);

  const [availableColors, setAvailableColors] =
    useState([]);

  const [openCategories, setOpenCategories] =
    useState({});

  useEffect(() => {
    setPriceValues([
      currentMinPrice,
      currentMaxPrice,
    ]);
  }, [currentMinPrice, currentMaxPrice]);

  // ক্যাটাগরি ফেচ করা
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(
          `${API_BASE_URL}/api/v1/categories/all`
        );

        if (res.data.success) {
          setCategories(res.data.data);

          res.data.data.forEach((cat) => {
            const catSlug =
              cat.slug ||
              cat.name
                .toLowerCase()
                .replace(/\s+/g, "-");

            const hasActiveSub =
              cat.subcategories?.some((sub) => {
                const subSlug =
                  sub.slug ||
                  sub.name
                    .toLowerCase()
                    .replace(/\s+/g, "-");

                return (
                  subSlug === currentCategory
                );
              });

            if (
              currentCategory === catSlug ||
              hasActiveSub
            ) {
              setOpenCategories((prev) => ({
                ...prev,
                [cat._id || catSlug]: true,
              }));
            }
          });
        }
      } catch (error) {
        console.error(
          "Failed to fetch filter categories:",
          error
        );
      }
    };

    fetchCategories();
  }, [currentCategory]);

  useEffect(() => {
    const fetchColors = async () => {
      try {
        const res = await axios.get(
          `${API_BASE_URL}/api/products/colors/all`
        );

        if (res.data.success) {
          setAvailableColors(
            res.data.data
          );
        }
      } catch (error) {
        console.error(
          "Failed to fetch filter colors:",
          error
        );
      }
    };

    fetchColors();
  }, []);

  const handleCategoryClick = (
    cat,
    catSlug
  ) => {
    if (
      cat.subcategories &&
      cat.subcategories.length > 0
    ) {
      setOpenCategories((prev) => ({
        ...prev,
        [cat._id || catSlug]:
          !prev[cat._id || catSlug],
      }));
    }

    const params =
      new URLSearchParams(
        searchParams.toString()
      );

    params.set("category", catSlug);
    params.set("page", "1");

    router.push(
      `/products?${params.toString()}`,
      {
        scroll: false,
      }
    );
  };

  const handleSubCategoryClick = (
    subSlug
  ) => {
    const params =
      new URLSearchParams(
        searchParams.toString()
      );

    params.set("category", subSlug);
    params.set("page", "1");

    router.push(
      `/products?${params.toString()}`,
      {
        scroll: false,
      }
    );
  };

  const handleColorChange = (
    colorValue
  ) => {
    const params =
      new URLSearchParams(
        searchParams.toString()
      );

    if (colorValue === "all") {
      params.delete("color");
    } else {
      params.set("color", colorValue);
    }

    params.set("page", "1");

    router.push(
      `/products?${params.toString()}`,
      {
        scroll: false,
      }
    );
  };

  const handlePriceFilterSubmit = () => {
    const params =
      new URLSearchParams(
        searchParams.toString()
      );

    params.set(
      "minPrice",
      priceValues[0].toString()
    );

    params.set(
      "maxPrice",
      priceValues[1].toString()
    );

    params.set("page", "1");

    router.push(
      `/products?${params.toString()}`,
      {
        scroll: false,
      }
    );
  };

  const handleReset = () => {
    setPriceValues([
      MIN_PRICE_LIMIT,
      MAX_PRICE_LIMIT,
    ]);

    router.push("/products", {
      scroll: false,
    });
  };

  return (
    <div className="w-full min-w-0 overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 font-poppins shadow-sm sm:p-5 md:p-6">

      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-gray-100 pb-4">

        <h3 className="flex min-w-0 items-center gap-2 text-base font-bold tracking-tight text-gray-900 sm:text-lg">
          <Layers
            size={18}
            className="shrink-0 text-[#8a5830]"
          />

          <span>Filters</span>
        </h3>

        <button
          onClick={handleReset}
          className="flex shrink-0 cursor-pointer items-center gap-1 rounded-lg bg-gray-50 px-2 py-1.5 text-[10px] font-semibold text-gray-500 transition-colors hover:bg-red-50 hover:text-red-500 sm:gap-1.5 sm:px-3 sm:text-xs"
        >
          <RotateCcw size={13} />

          <span>Reset All</span>
        </button>

      </div>

      {/* 1. Categories & Subcategories Filter */}
      <div className="mt-5 space-y-3">

        <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
          Categories
        </h4>

        <ul className="custom-scrollbar max-h-[320px] space-y-1.5 overflow-y-auto pr-1">

          <li>
            <button
              onClick={() => {
                const params =
                  new URLSearchParams(
                    searchParams.toString()
                  );

                params.delete("category");
                params.set("page", "1");

                router.push(
                  `/products?${params.toString()}`,
                  {
                    scroll: false,
                  }
                );
              }}
              className={`flex w-full cursor-pointer items-center justify-between rounded-xl px-2.5 py-2.5 text-left text-xs font-medium transition-all sm:px-3 sm:text-sm ${
                currentCategory === "all"
                  ? "bg-black text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <span>
                All Products
              </span>

              <span className="text-[10px] opacity-60 sm:text-xs">
                Explore
              </span>
            </button>
          </li>

          {categories.map((cat) => {
            const catSlug =
              cat.slug ||
              cat.name
                .toLowerCase()
                .replace(/\s+/g, "-");

            const isMainActive =
              currentCategory === catSlug;

            const isOpen =
              openCategories[
                cat._id || catSlug
              ];

            return (
              <React.Fragment
                key={
                  cat._id || catSlug
                }
              >
                <li>
                  <button
                    onClick={() =>
                      handleCategoryClick(
                        cat,
                        catSlug
                      )
                    }
                    className={`flex w-full min-w-0 cursor-pointer items-center justify-between rounded-xl px-2.5 py-2 text-left text-xs font-medium transition-all sm:px-3 sm:text-sm ${
                      isMainActive
                        ? "bg-black text-white shadow-md"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-2">

                      {cat.icon && (
                        <img
                          src={
                            cat.icon.startsWith(
                              "http"
                            )
                              ? cat.icon
                              : `${API_BASE_URL}${cat.icon}`
                          }
                          alt={cat.name}
                          className="h-5 w-5 shrink-0 rounded-md border border-gray-200 object-cover"
                          onError={(e) => {
                            e.target.style.display =
                              "none";
                          }}
                        />
                      )}

                      <span className="truncate font-semibold">
                        {cat.name}
                      </span>
                    </div>

                    {cat.subcategories
                      ?.length > 0 && (
                      <ChevronRight
                        size={14}
                        className={`ml-2 shrink-0 transition-transform duration-200 ${
                          isOpen
                            ? "rotate-90 text-white"
                            : "text-gray-400"
                        }`}
                      />
                    )}
                  </button>
                </li>

                {cat.subcategories &&
                  cat.subcategories.length >
                    0 &&
                  isOpen &&
                  cat.subcategories.map(
                    (sub) => {
                      const subSlug =
                        sub.slug ||
                        sub.name
                          .toLowerCase()
                          .replace(
                            /\s+/g,
                            "-"
                          );

                      const isSubActive =
                        currentCategory ===
                        subSlug;

                      return (
                        <li
                          key={
                            sub._id ||
                            subSlug
                          }
                          className="animate-fadeIn pl-3 sm:pl-4"
                        >
                          <button
                            onClick={() =>
                              handleSubCategoryClick(
                                subSlug
                              )
                            }
                            className={`flex w-full cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-[11px] font-normal transition-all sm:px-3 sm:text-xs ${
                              isSubActive
                                ? "bg-[#8a5830] font-medium text-white shadow-sm"
                                : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                            }`}
                          >
                            <span className="shrink-0 text-gray-400">
                              ╰─
                            </span>

                            <span className="truncate">
                              {sub.name}
                            </span>
                          </button>
                        </li>
                      );
                    }
                  )}
              </React.Fragment>
            );
          })}
        </ul>
      </div>

      <hr className="my-5 border-gray-100" />

      {/* 2. Dynamic Color Filter */}
      <div className="space-y-3">

        <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
          Filter by Color
        </h4>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">

          {/* All Option */}
          <button
            onClick={() =>
              handleColorChange("all")
            }
            className={`flex min-w-0 cursor-pointer items-center gap-1.5 rounded-xl border px-2 py-2 text-[10px] font-medium transition-all sm:gap-2 sm:px-3 sm:text-xs ${
              currentColor === "all"
                ? "border-black bg-gray-50 font-semibold text-black ring-1 ring-black"
                : "border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50/50"
            }`}
          >
            <span className="h-3 w-3 shrink-0 rounded-full border border-gray-300 bg-gray-200 shadow-sm" />

            <span className="truncate">
              All
            </span>
          </button>

          {/* Database Dynamic Colors */}
          {availableColors.map((c) => (
            <button
              key={c.name}
              onClick={() =>
                handleColorChange(
                  c.name
                )
              }
              className={`flex min-w-0 cursor-pointer items-center gap-1.5 rounded-xl border px-2 py-2 text-[10px] font-medium transition-all sm:gap-2 sm:px-3 sm:text-xs ${
                currentColor.toLowerCase() ===
                c.name.toLowerCase()
                  ? "border-black bg-gray-50 font-semibold text-black ring-1 ring-black"
                  : "border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50/50"
              }`}
            >
              <span
                className="h-3 w-3 shrink-0 rounded-full border border-gray-300 shadow-sm"
                style={{
                  backgroundColor:
                    c.code || "#cccccc",
                }}
              />

              <span className="truncate">
                {c.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      <hr className="my-5 border-gray-100" />

      {/* 3. Price Range Slider */}
      <div className="space-y-4">

        <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
          Filter By Price
        </h4>

        <div className="px-2 pt-2">
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
            }) => (
              <div
                {...props}
                style={{
                  ...props.style,
                }}
                className="relative h-2 w-full cursor-pointer rounded-md bg-gray-200"
              >
                <div
                  ref={props.ref}
                  className="absolute h-full rounded-md bg-[#8a5830]"
                  style={{
                    left: `${
                      ((priceValues[0] -
                        MIN_PRICE_LIMIT) /
                        (MAX_PRICE_LIMIT -
                          MIN_PRICE_LIMIT)) *
                      100
                    }%`,
                    right: `${
                      100 -
                      ((priceValues[1] -
                        MIN_PRICE_LIMIT) /
                        (MAX_PRICE_LIMIT -
                          MIN_PRICE_LIMIT)) *
                        100
                    }%`,
                  }}
                />

                {children}
              </div>
            )}
            renderThumb={({ props }) => {
              const {
                key,
                ...restProps
              } = props;

              return (
                <div
                  key={key}
                  {...restProps}
                  className="flex h-5 w-5 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-[#8a5830] shadow-md focus:outline-none"
                  style={{
                    ...restProps.style,
                  }}
                />
              );
            }}
          />
        </div>

        <div className="flex flex-col gap-1.5 rounded-xl border border-gray-100 bg-gray-50 p-3 text-xs sm:flex-row sm:items-center sm:justify-between sm:text-sm">

          <span className="font-medium text-gray-500">
            Price Range:
          </span>

          <div className="font-sans font-bold text-gray-900">
            <span>
              {priceValues[0].toLocaleString()}৳
            </span>

            <span className="mx-1.5 font-normal text-gray-400">
              —
            </span>

            <span>
              {priceValues[1].toLocaleString()}৳
            </span>
          </div>

        </div>

        <button
          type="button"
          onClick={
            handlePriceFilterSubmit
          }
          className="w-full cursor-pointer rounded-xl bg-[#8a5830] py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-black"
        >
          Apply Price Filter
        </button>
      </div>

    </div>
  );
};

export default FilterProduct;

