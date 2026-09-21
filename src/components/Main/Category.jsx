"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import SectionHeading from './SectionHeading';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa6';
import CategoryCard from './CategoryCard';
import axios from 'axios';

const Category = () => {

  const router = useRouter();

  const searchParams =
    useSearchParams();

  const currentCategory =
    searchParams.get("category") ||
    "all";


  const [prevEl, setPrevEl] =
    useState(null);

  const [nextEl, setNextEl] =
    useState(null);

  const [categoryData, setCategoryData] =
    useState([]);

  const [loading, setLoading] =
    useState(true);


  useEffect(() => {

    const fetchCategories =
      async () => {

        try {

          const apiUrl =
            process.env.NEXT_PUBLIC_API_URL ||
            "http://localhost:5000";
            
          const res =
            await axios.get(
              `${apiUrl}/api/v1/categories/all`
            );


          if (res.data.success) {

            const formattedCategories = [

              {
                name:
                  "All Categories",

                slug:
                  "all",

                icon:
                  null
              },

              ...res.data.data.map(
                (cat) => ({

                  name:
                    cat.name,

                  slug:
                    cat.slug ||
                    cat.name
                      .toLowerCase()
                      .replace(
                        /\s+/g,
                        '-'
                      ),

                  // Cloudinary URL সরাসরি ব্যবহার হবে
                  icon:
                    cat.icon ||
                    null

                })
              )

            ];


            setCategoryData(
              formattedCategories
            );

          }

        } catch (error) {

          console.error(
            "Error fetching categories:",
            error
          );

        } finally {

          setLoading(false);

        }

      };


    fetchCategories();

  }, []);


  const handleCategoryClick =
    (slug) => {

      const params =
        new URLSearchParams(
          searchParams.toString()
        );


      if (slug === "all") {

        params.delete(
          "category"
        );

      } else {

        params.set(
          "category",
          slug
        );

      }


      params.set(
        "page",
        "1"
      );


      router.push(
        `/products?${params.toString()}`,
        {
          scroll: false
        }
      );

    };


  if (loading) {
    return null;
  }


  return (

    <section className="mb-4 w-full overflow-hidden sm:mb-8 md:mb-10">

      <div className="container mx-auto w-full border-b px-3 pb-5 sm:px-4 sm:pb-8 md:px-0 md:pb-12">

        <div className="mt-8 sm:mt-10 md:mt-15">

          <div className="mb-4 flex flex-col gap-4 sm:mb-6 md:ml-0 md:flex-row md:items-end md:justify-between md:gap-4">

            <div className="min-w-0">

              <SectionHeading
                subHeading={"Categories"}
                heading={"Browse By Category"}
                countDown={false}
              />

            </div>


            <div className="flex shrink-0 justify-end gap-2">

              <button
                ref={(node) =>
                  setPrevEl(node)
                }
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-[#F5F5F5] p-2 text-black transition-all hover:bg-[#8a5830] hover:text-white disabled:opacity-50 sm:h-10 sm:w-10 md:h-11 md:w-11"
              >

                <FaArrowLeft
                  className="h-3.5 w-3.5 sm:h-4 sm:w-4"
                />

              </button>


              <button
                ref={(node) =>
                  setNextEl(node)
                }
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-[#F5F5F5] p-2 text-black transition-all hover:bg-[#8a5830] hover:text-white disabled:opacity-50 sm:h-10 sm:w-10 md:h-11 md:w-11"
              >

                <FaArrowRight
                  className="h-3.5 w-3.5 sm:h-4 sm:w-4"
                />

              </button>

            </div>

          </div>


          <div className="mb-3 mt-3 w-full sm:mb-6 sm:mt-6 md:mb-[51px] md:mt-10">

            {prevEl &&
              nextEl &&
              categoryData.length > 0 && (

                <Swiper
                  modules={[Navigation]}
                  spaceBetween={32}
                  slidesPerView={5}

                  navigation={{
                    prevEl:
                      prevEl,

                    nextEl:
                      nextEl,
                  }}

                  breakpoints={{

                    320: {
                      slidesPerView:
                        2.15,

                      spaceBetween:
                        10
                    },

                    480: {
                      slidesPerView:
                        2.7,

                      spaceBetween:
                        12
                    },

                    640: {
                      slidesPerView:
                        3.2,

                      spaceBetween:
                        16
                    },

                    768: {
                      slidesPerView:
                        3.5,

                      spaceBetween:
                        20
                    },

                    1024: {
                      slidesPerView:
                        5,

                      spaceBetween:
                        28
                    },

                    1280: {
                      slidesPerView:
                        5,

                      spaceBetween:
                        32
                    },

                  }}

                  className="mySwiper !overflow-visible md:!overflow-hidden"
                >

                  {categoryData.map(
                    (
                      category,
                      index
                    ) => {

                      const isActive =
                        currentCategory ===
                          category.slug ||

                        (
                          category.slug ===
                            "all" &&

                          !searchParams.get(
                            "category"
                          )
                        );


                      return (

                        <SwiperSlide
                          key={index}
                        >

                          <div
                            onClick={() =>
                              handleCategoryClick(
                                category.slug
                              )
                            }
                            className="w-full cursor-pointer"
                          >

                            <CategoryCard
                              icon={
                                category.icon
                              }

                              text={
                                category.name
                              }

                              isActive={
                                isActive
                              }
                            />

                          </div>

                        </SwiperSlide>

                      );

                    }
                  )}

                </Swiper>

              )}

          </div>

        </div>

      </div>

    </section>

  );

};


export default Category;

