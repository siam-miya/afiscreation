"use client"

import React, {
    useEffect,
    useState
} from "react"

import Link from "next/link"

import {
    MdOutlineKeyboardArrowRight
} from "react-icons/md"

import {
    Swiper,
    SwiperSlide
} from "swiper/react"

import "swiper/css"

import "swiper/css/pagination"

import "swiper/css/autoplay"

import {
    Pagination,
    Autoplay
} from "swiper/modules"


const Banner = () => {

    const [banners, setBanners] =
        useState([])

    const [loading, setLoading] =
        useState(true)


    const apiUrl =
        process.env.NEXT_PUBLIC_API_URL ||
        "http://localhost:5000"


    useEffect(() => {

        const fetchBanners =
            async () => {

                try {

                    const res =
                        await fetch(
                            `${apiUrl}/api/banners`,
                            {
                                cache: "no-store",
                            }
                        )


                    if (!res.ok) {

                        throw new Error(
                            `Server error: ${res.status}`
                        )

                    }


                    const result =
                        await res.json()


                    if (
                        result.success &&
                        Array.isArray(
                            result.data
                        )
                    ) {

                        setBanners(
                            result.data
                        )

                    }


                } catch (error) {

                    console.error(
                        "Error fetching banners:",
                        error
                    )

                } finally {

                    setLoading(false)

                }

            }


        fetchBanners()

    }, [])


    if (loading) {

        return (
            <div className="w-full h-[60vh] bg-gray-100 animate-pulse">
            </div>
        )

    }


    if (banners.length === 0) {

        return null

    }


    return (

        <section className="ml-0 md:px-3 lg:px-0 w-full">

            <div className="w-full">

                <div className="overflow-hidden custom-swiper relative w-full">

                    <Swiper
                        spaceBetween={20}
                        slidesPerView={1}
                        loop={
                            banners.length > 1
                        }
                        pagination={{
                            clickable: true
                        }}
                        autoplay={{
                            delay: 3000,
                            disableOnInteraction: false,
                        }}
                        modules={[
                            Pagination,
                            Autoplay
                        ]}
                        className="w-full h-full"
                    >

                        {banners.map(
                            (
                                banner,
                                index
                            ) => {

                                let imageUrl =
                                    banner.image


                                if (imageUrl) {

                                    imageUrl =
                                        imageUrl.replace(
                                            /\\/g,
                                            "/"
                                        )


                                    if (
                                        !imageUrl.startsWith(
                                            "http://"
                                        ) &&
                                        !imageUrl.startsWith(
                                            "https://"
                                        )
                                    ) {

                                        imageUrl =
                                            `${apiUrl}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`

                                    }

                                }


                                return (

                                    <SwiperSlide
                                        key={
                                            banner._id ||
                                            index
                                        }
                                        className="flex items-center justify-center font-poppins text-[16px] leading-6"
                                    >

                                        <SliderItem
                                            image={
                                                imageUrl
                                            }
                                            smallHeading={
                                                banner.smallHeading
                                            }
                                            mainHeading={
                                                banner.mainHeading
                                            }
                                            discount={
                                                banner.discountText
                                            }
                                            link={
                                                banner.link
                                            }
                                        />

                                    </SwiperSlide>

                                )

                            }
                        )}

                    </Swiper>

                </div>

            </div>

        </section>

    )

}


export default Banner


function SliderItem({
    image,
    smallHeading,
    mainHeading,
    discount,
    link
}) {

    return (

        <div

            style={{
                backgroundImage:
                    `url(${image})`
            }}

            className="w-full h-[60vh] bg-cover bg-center bg-no-repeat relative p-6 sm:p-8 lg:p-12 flex items-center justify-start bg-gray-300"
        >

            <div className="absolute inset-0 bg-black/40 z-0">
            </div>


            <div className="space-y-3 sm:space-y-4 z-10 max-w-[280px] sm:max-w-[400px] pl-2 sm:pl-6 text-left">

                {smallHeading && (

                    <p className="flex items-center gap-2 sm:gap-3 text-gray-200 font-semibold text-xs sm:text-sm tracking-widest font-poppins uppercase">

                        {smallHeading}

                    </p>

                )}


                <h1 className="text-white font-bold text-[24px] sm:text-[32px] lg:text-[40px] leading-[1.2] font-poppins">

                    {discount
                        ? `Up to ${discount} off on `
                        : ""
                    }

                    {mainHeading}

                </h1>


                <Link
                    href={
                        link ||
                        "/products"
                    }
                    className="inline-flex items-center gap-2 text-white cursor-pointer group mt-1 sm:mt-2"
                >

                    <span className="border-b border-white pb-0.5 group-hover:border-transparent transition-all text-xs sm:text-sm font-medium">

                        ShopNow

                    </span>


                    <MdOutlineKeyboardArrowRight
                        size={18}
                        className="group-hover:translate-x-1 transition-transform sm:size-[20px]"
                    />

                </Link>

            </div>

        </div>

    )

}