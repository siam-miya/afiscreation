"use client"

import Image from 'next/image'
import footer_icon from "../../../public/navbarLogo.png"
import arrow_right from "../../assets/icons/arrow_right.svg"
import Link from 'next/link'
import { useEffect, useState } from 'react'
import axios from 'axios'

const Footer = () => {

  const currentYear = new Date().getFullYear();

  const [settings, setSettings] = useState({
    siteName: "Afis Creation",
    logo: "",
    footerAddress: "Gulshan-2, Dhaka, Bangladesh",
    footerPhone: "01804673487",
    footerPhone2: "",
    footerEmail: "afiscreation@gmail.com",
    footerCopyright: "",

    // Social Links
    facebook: "",
    instagram: "",
    youtube: "",
  })

  useEffect(() => {

    const fetchSettings = async () => {

      try {

        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL ||
          "http://localhost:5000"

        const res =
          await axios.get(
            `${apiUrl}/api/settings`
          )

        if (
          res.data &&
          res.data.success &&
          res.data.data
        ) {

          const data =
            res.data.data

          setSettings(prev => ({
            ...prev,
            ...data
          }))

        }

      } catch (error) {

        console.error(
          "Failed to load footer settings:",
          error
        )

      }

    }

    fetchSettings()

  }, [])

  return (

    <footer className='bg-black pt-12 md:pt-20 pb-24 md:pb-6'>

      <div className="container px-4 sm:px-6 md:px-0">

        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 xl:gap-20'>

          {/* Footer Logo / Subscribe */}

          <div className="flex flex-col">

            <div>

              {settings.logo ? (

                <img
                  src={settings.logo}
                  height={120}
                  width={240}
                  alt={`${settings.siteName} logo`}
                  className="max-w-[200px] md:max-w-[240px] h-auto object-contain"
                />

              ) : (

                <Image
                  src={footer_icon}
                  height={120}
                  width={240}
                  alt={`${settings.siteName} logo`}
                  className="max-w-[200px] md:max-w-[240px] h-auto"
                />

              )}

            </div>

            <h2 className='text-white font-medium font-inter text-[20px] leading-7 py-4'>
              Subscribe
            </h2>

            <p className='text-white text-[16px] leading-6'>
              Get 10% off your first order
            </p>

            <div className='py-4 max-w-[280px] sm:max-w-full'>

              <form action="">

                <div className='flex items-center gap-3 border border-white rounded-md py-3 px-4'>

                  <input
                    className='focus:outline-none placeholder:text-white text-white bg-transparent w-full'
                    type="email"
                    placeholder='enter your email'
                  />

                  <span className="shrink-0">

                    <Image
                      src={arrow_right}
                      height={24}
                      width={24}
                      alt='icon'
                    />

                  </span>

                </div>

              </form>

            </div>


            {/* =====================================================
                SOCIAL LINKS - DYNAMIC FROM ADMIN SETTINGS
            ===================================================== */}

            {(settings.facebook ||
              settings.instagram ||
              settings.youtube) && (

              <div className='flex items-center justify-start gap-6 pt-2'>

                {/* =================================================
                    FACEBOOK
                ================================================= */}

                {settings.facebook && (

                  <a
                    href={settings.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                    className="inline-block"
                  >

                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="fill-white hover:fill-blue-500 transition-colors duration-300 cursor-pointer"
                    >

                      <path d="M13 10H17.5L17 12H13V21H11V12H7V10H11V8.128C11 6.345 11.186 5.698 11.534 5.046C11.875 4.40181 12.4018 3.87501 13.046 3.534C13.698 3.186 14.345 3 16.128 3C16.65 3 17.108 3.05 17.5 3.15V5H16.128C14.804 5 14.401 5.078 13.99 5.298C13.686 5.46 13.46 5.686 13.298 5.99C13.078 6.401 13 6.804 13 8.128V10Z" />

                    </svg>

                  </a>

                )}


                {/* =================================================
                    INSTAGRAM
                ================================================= */}

                {settings.instagram && (

                  <a
                    href={settings.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    className="inline-block"
                  >

                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="text-white hover:text-[#E1306C] stroke-current transition-all duration-300 ease-in-out cursor-pointer hover:scale-110"
                    >

                      <path
                        d="M17 3H7C5.93913 3 4.92172 3.42143 4.17157 4.17157C3.42143 4.92172 3 5.93913 3 7V17C3 18.0609 3.42143 19.0786 4.17157 19.8284C4.92172 20.5786 5.93913 21 7 21H17C18.0609 21 19.0786 20.5786 19.8284 19.0786 21 17V7C21 5.93913 19.0786 4.92172 19.8284 4.17157C19.0786 3.42143 18.0609 3 17 3Z"
                        strokeWidth="1.5"
                        strokeLinejoin="round"
                      />

                      <path
                        d="M12 16C13.0609 16 14.0783 15.5786 14.8284 14.8284C15.5786 14.0783 16 13.0609 16 12C16 10.9391 15.5786 9.92172 14.8284 9.17157C14.0783 8.42143 13.078 8 12 8C10.9391 8 9.92172 8.42143 9.17157 9.17157C8.42172 8.42143 8 10.9391 8 12C8 13.0609 8.42172 14.0783 8.42172 14.0783 14.8284 16 12 16Z"
                        strokeWidth="1.5"
                        strokeLinejoin="round"
                      />

                      <path
                        d="M17.5 7.5C17.7652 7.5 18.0196 7.39464 18.2071 7.20711C18.3946 7.01957 18.5 6.76522 18.5 6.5C18.5 6.23478 18.3946 5.98043 18.2071 5.79289C18.0196 5.60536 17.7652 5.5 17.5 5.5C17.2348 5.5 16.9804 5.60536 16.7929 5.79289C16.6054 5.98043 16.5 6.23478 16.5 6.5C16.5 6.76522 16.6054 7.01957 16.7929 7.20711C16.9804 7.5 17.5 7.5Z"
                        className="fill-current stroke-none"
                      />

                    </svg>

                  </a>

                )}


                {/* =================================================
                    YOUTUBE
                ================================================= */}

                {settings.youtube && (

                  <a
                    href={settings.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="YouTube"
                    className="inline-block"
                  >

                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="text-white hover:text-red-500 fill-current transition-all duration-300 ease-in-out cursor-pointer hover:scale-110"
                    >

                      <path d="M23.498 6.186a2.98 2.98 0 0 0-2.097-2.112C19.552 3.5 12 3.5 12 3.5s-7.552 0-9.401.574A2.98 2.98 0 0 0 .502 6.186C0 8.05 0 12 0 12s0 3.95.502 5.814a2.98 2.98 0 0 0 2.097 2.112C4.448 20.5 12 20.5 12 20.5s7.552 0 9.401-.574a2.98 2.98 0 0 0 2.097-2.112C24 15.95 24 12 24 12s0-3.95-.502-5.814Z" />

                      <path
                        d="M9.545 15.568L15.818 12 9.545 8.432v7.136Z"
                        fill="black"
                      />

                    </svg>

                  </a>

                )}

              </div>

            )}

          </div>


          {/* Support */}

          <div>

            <h2 className='text-white font-medium font-poppins text-[20px] leading-7 border-b border-gray-800 pb-2 md:border-b-0 md:pb-0'>
              Support
            </h2>

            <div className="pt-4 md:pt-6">

              <p className='text-[16px] leading-6 text-white pb-4 font-poppins'>
                {settings.footerAddress ||
                  "Gulshan-2, Dhaka, Bangladesh"}
              </p>

              {settings.footerEmail && (

                <a
                  className='text-[16px] leading-6 text-white font-poppins hover:text-secondary hover:font-semibold transition-all break-all'
                  href={`mailto:${settings.footerEmail}`}
                >
                  {settings.footerEmail}
                </a>

              )}

              {settings.footerPhone && (

                <a
                  href={`tel:${settings.footerPhone}`}
                  className='block text-[16px] leading-6 text-white font-poppins pt-4 hover:text-secondary hover:font-semibold transition-all cursor-pointer'
                >
                  {settings.footerPhone}
                </a>

              )}

              {settings.footerPhone2 && (

                <a
                  href={`tel:${settings.footerPhone2}`}
                  className='block text-[16px] leading-6 text-white font-poppins pt-2 hover:text-secondary hover:font-semibold transition-all cursor-pointer'
                >
                  {settings.footerPhone2}
                </a>

              )}

            </div>

          </div>


          {/* Account */}

          <div>

            <h2 className='text-white font-medium font-poppins text-[20px] leading-7 border-b border-gray-800 pb-2 md:border-b-0 md:pb-0'>
              Account
            </h2>

            <ul className="pt-4 md:pt-6">

              <li>

                <Link
                  className='text-[16px] leading-6 text-white font-poppins hover:text-secondary hover:font-semibold transition-all'
                  href={"/"}
                >
                  My Account
                </Link>

              </li>

              <div className='flex items-center gap-2 py-4'>

                <li>

                  <Link
                    className='text-[16px] leading-6 text-white font-poppins hover:text-secondary hover:font-semibold transition-all'
                    href={"/login"}
                  >
                    Login
                  </Link>

                </li>

                <span className='text-white'>
                  /
                </span>

                <li>

                  <Link
                    className='text-[16px] leading-6 text-white font-poppins hover:text-secondary hover:font-semibold transition-all'
                    href={"/login"}
                  >
                    Register
                  </Link>

                </li>

              </div>

              <li>

                <Link
                  className='text-[16px] leading-6 text-white font-poppins hover:text-secondary hover:font-semibold transition-all'
                  href={"/cart"}
                >
                  Cart
                </Link>

              </li>

              <li className='py-4'>

                <Link
                  className='text-[16px] leading-6 text-white font-poppins hover:text-secondary hover:font-semibold transition-all'
                  href={"/Wishlist"}
                >
                  Wishlist
                </Link>

              </li>

              <li>

                <Link
                  className='text-[16px] leading-6 text-white font-poppins hover:text-secondary hover:font-semibold transition-all'
                  href={"/Shop"}
                >
                  Shop
                </Link>

              </li>

            </ul>

          </div>


          {/* Quick Link */}

          <div>

            <h2 className='text-white font-medium font-poppins text-[20px] leading-7 border-b border-gray-800 pb-2 md:border-b-0 md:pb-0'>
              Quick Link
            </h2>

            <ul className="pt-4 md:pt-6">

              <li>

                <Link
                  className='text-[16px] leading-6 text-white font-poppins hover:text-secondary hover:font-semibold transition-all'
                  href={"/"}
                >
                  Privacy Policy
                </Link>

              </li>

              <li className='py-4'>

                <Link
                  className='text-[16px] leading-6 text-white font-poppins hover:text-secondary hover:font-semibold transition-all'
                  href={"/"}
                >
                  Terms Of Use
                </Link>

              </li>

              <li>

                <Link
                  className='text-[16px] leading-6 text-white hover:text-secondary hover:font-semibold transition-all'
                  href={"/"}
                >
                  FAQ
                </Link>

              </li>

              <li className='pt-4'>

                <Link
                  className='text-[16px] leading-6 text-white hover:text-secondary hover:font-semibold transition-all'
                  href={"/Contact"}
                >
                  Contact
                </Link>

              </li>

            </ul>

          </div>

        </div>


        {/* Copyright */}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-1 mt-8 md:mt-20 pt-6 border-t border-gray-900 text-center font-poppins">

          <span className='text-gray-500 hidden sm:inline'>
            &copy;
          </span>

          <span className='text-gray-500 text-[14px] sm:text-[16px] leading-6'>

            {settings.footerCopyright ? (

              settings.footerCopyright

            ) : (

              <>

                Copyright{" "}

                <span className="sm:hidden">
                  &copy;
                </span>{" "}

                <Link
                  className={'text-secondary hover:text-white'}
                  href={"/"}
                >
                  {settings.siteName ||
                    "Afis Creation"}
                </Link>{" "}

                {currentYear}.

              </>

            )}

          </span>

          {!settings.footerCopyright && (

            <span className="text-gray-500 text-[14px] sm:text-[16px] leading-6 sm:ml-1">
              All rights reserved.
            </span>

          )}

        </div>

      </div>

    </footer>

  )

}

export default Footer