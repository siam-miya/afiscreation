'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useDrawerStore } from '@/store/useDrawerStore';
import logo from "./../../../public/navbarLogo.png";
import wishlistIcon from "../../assets/icons/wishlist.svg";
import cartIcon from "../../assets/icons/cart.png";
import { FiUser, FiLogOut } from "react-icons/fi";
import { toast } from 'react-toastify';
import { RiUser3Line } from 'react-icons/ri';
import { RxHamburgerMenu } from 'react-icons/rx';
import MenuSection from './MenuSection';

const Navbar = () => {
    const router = useRouter();
    const cart = useCartStore((state) => state.cart);
    const wishlist = useWishlistStore((state) => state.wishlist);
    const openDrawer = useDrawerStore((state) => state.openDrawer);

    const [isMounted, setIsMounted] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [user, setUser] = useState(null);
    const [siteSettings, setSiteSettings] = useState({
        logo: "",
        siteName: ""
    });

    const dropdownRef = useRef(null);

    const checkUserSession = () => {
        const storedUser = localStorage.getItem('user');

        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                const userProfilePic =
                    parsedUser.picture ||
                    parsedUser.avatar ||
                    parsedUser.image;

                setUser({
                    ...parsedUser,
                    picture: userProfilePic
                });

            } catch (error) {
                console.error(
                    "Failed to parse user data",
                    error
                );
                setUser(null);
            }

        } else {
            setUser(null);
        }
    };

    useEffect(() => {

        setIsMounted(true);
        checkUserSession();

        // Site Settings fetch
        const fetchSiteSettings = async () => {

            try {

                const apiUrl =
                    process.env.NEXT_PUBLIC_API_URL ||
                    "http://localhost:5000";

                const res =
                    await axios.get(
                        `${apiUrl}/api/settings`
                    );

                if (
                    res.data &&
                    res.data.success &&
                    res.data.data
                ) {

                    setSiteSettings({
                        logo:
                            res.data.data.logo || "",
                        siteName:
                            res.data.data.siteName || ""
                    });

                }

            } catch (error) {

                console.error(
                    "Failed to fetch site settings:",
                    error
                );

            }

        };

        fetchSiteSettings();

        const handleStorageChange = () => {
            checkUserSession();
        };

        window.addEventListener(
            'storage',
            handleStorageChange
        );

        window.addEventListener(
            'userLogin',
            handleStorageChange
        );

        window.addEventListener(
            'userStateChanged',
            handleStorageChange
        );

        const handleScroll = () => {

            if (window.scrollY > 30) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }

        };

        window.addEventListener(
            'scroll',
            handleScroll
        );

        return () => {

            window.removeEventListener(
                'scroll',
                handleScroll
            );

            window.removeEventListener(
                'storage',
                handleStorageChange
            );

            window.removeEventListener(
                'userLogin',
                handleStorageChange
            );

            window.removeEventListener(
                'userStateChanged',
                handleStorageChange
            );

        };

    }, []);

    // =====================================================
    // Product Search
    // =====================================================

    useEffect(() => {

        const searchProducts = async () => {

            const searchText =
                searchQuery.trim();

            if (searchText.length <= 1) {

                setSearchResults([]);
                setIsOpen(false);
                setLoading(false);

                return;
            }

            setLoading(true);
            setIsOpen(true);

            try {

                const apiUrl =
                    process.env.NEXT_PUBLIC_API_URL ||
                    "http://localhost:5000";

                const res =
                    await axios.get(
                        `${apiUrl}/api/products`,
                        {
                            params: {
                                search: searchText,
                                limit: 6,
                                page: 1
                            }
                        }
                    );

                if (
                    res.data &&
                    res.data.success
                ) {

                    setSearchResults(
                        Array.isArray(
                            res.data.data
                        )
                            ? res.data.data
                            : []
                    );

                } else {

                    setSearchResults([]);

                }

            } catch (error) {

                console.error(
                    "Search fetch error:",
                    error
                );

                setSearchResults([]);

            } finally {

                setLoading(false);

            }

        };

        searchProducts();

    }, [searchQuery]);

    // =====================================================
    // Close Search Dropdown
    // =====================================================

    useEffect(() => {

        const handleClickOutside = (
            event
        ) => {

            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(
                    event.target
                )
            ) {

                setIsOpen(false);

            }

        };

        document.addEventListener(
            'mousedown',
            handleClickOutside
        );

        return () =>
            document.removeEventListener(
                'mousedown',
                handleClickOutside
            );

    }, []);

    // =====================================================
    // Search Submit
    // =====================================================

    const handleSearchSubmit = (e) => {

        e.preventDefault();

        if (searchQuery.trim()) {

            setIsOpen(false);

            router.push(
                `/search?q=${encodeURIComponent(
                    searchQuery.trim()
                )}`
            );

        }

    };

    const handleProfileClick = (e) => {

        e.preventDefault();

        if (user) {
            router.push('/user/profile');
        } else {
            router.push('/login');
        }

    };

    const cartCount =
        isMounted
            ? cart.reduce(
                (total, item) =>
                    total + item.quantity,
                0
            )
            : 0;

    const wishlistCount =
        isMounted
            ? wishlist.length
            : 0;

    const handleLogOut = async () => {

        try {

            localStorage.removeItem('user');

            setUser(null);

            window.dispatchEvent(
                new Event('userLogin')
            );

            window.dispatchEvent(
                new Event('userStateChanged')
            );

            toast.success(
                "Successfully logged out your account"
            );

            router.push('/login');

        } catch (error) {

            console.error(
                "Logout error",
                error
            );

        }

    };

    return (

        <nav
            className={`sticky top-0 w-full border-b border-b-[rgba(0,0,0,0.1)] bg-white/95 backdrop-blur-md z-[99] shadow-sm transition-all duration-300 ${
                isScrolled
                    ? 'py-1.5 md:py-2'
                    : 'py-3 md:py-5'
            }`}
        >

            <div className='container mx-auto px-4 md:px-0'>

                <div
                    className={`flex flex-col md:flex-row items-center justify-between transition-all duration-300 ${
                        isScrolled
                            ? 'gap-0'
                            : 'gap-4'
                    } md:gap-8`}
                >

                    <div className="relative flex items-center justify-between w-full px-1 mr-1 md:w-auto min-h-[45px] md:min-h-0">

                        <button
                            onClick={openDrawer}
                            className="block lg:hidden text-black p-1 hover:bg-gray-100 rounded-md transition-colors z-10"
                        >
                            <RxHamburgerMenu size={26} />
                        </button>

                        <Link
                            href={"/"}
                            className="absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0 flex-shrink-0 z-10"
                        >

                            {/* Dynamic Logo */}
                            <div className="relative w-[150px] h-[40px] sm:w-[170px] sm:h-[44px] md:w-[200px] md:h-[55px] flex items-center justify-center">

                                <Image
                                    src={
                                        siteSettings.logo ||
                                        logo
                                    }
                                    alt={
                                        siteSettings.siteName ||
                                        "Afis Creation"
                                    }
                                    fill
                                    sizes="(max-width: 640px) 150px, (max-width: 768px) 170px, 200px"
                                    className="object-contain"
                                    priority
                                />

                            </div>

                        </Link>

                        <div className="flex items-center gap-4 md:hidden z-10">

                            <Link
                                href={"/cart"}
                                className='relative p-1'
                            >

                                <div className="relative w-[22px] h-[22px]">

                                    <Image
                                        src={cartIcon}
                                        fill
                                        sizes="22px"
                                        alt="cart"
                                        className="object-contain"
                                    />

                                </div>

                                <span className='absolute -top-1 -right-1 bg-primary text-white text-[9px] font-bold rounded-full w-4.5 h-4.5 flex items-center justify-center'>
                                    {cartCount}
                                </span>

                            </Link>

                        </div>

                    </div>

                    <div
                        ref={dropdownRef}
                        className={`relative w-full md:flex-1 px-1 md:max-w-[650px] transition-all duration-300 ${
                            isScrolled
                                ? 'block md:hidden'
                                : 'block'
                        }`}
                    >

                        <form onSubmit={handleSearchSubmit}>

                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) =>
                                    setSearchQuery(
                                        e.target.value
                                    )
                                }
                                onFocus={() =>
                                    searchQuery.trim().length > 1 &&
                                    setIsOpen(true)
                                }
                                placeholder="Search for product..."
                                className="w-full bg-[#F5F5F5] text-xs md:text-sm text-black pl-4 pr-10 py-2.5 md:py-3 rounded-xl focus:outline-primary placeholder:text-[rgba(0,0,0,0.5)] placeholder:font-semibold font-poppins border-2"
                            />

                            <button
                                type="submit"
                                className="absolute cursor-pointer right-2 top-1/2 -translate-y-1/2 bg-primary text-white hover:bg-black font-bold p-1.5 md:p-2 rounded-full transition-colors"
                            >

                                <svg
                                    className="w-4 h-4 md:w-5 md:h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                    viewBox="0 0 24 24"
                                >

                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                    />

                                </svg>

                            </button>

                        </form>

                        {isOpen && (

                            <div className="absolute left-0 right-0 top-full mt-2 bg-white text-black border border-gray-200 rounded-xl shadow-2xl z-[9999] overflow-hidden max-h-[400px] flex flex-col">

                                {loading ? (

                                    <div className="p-5 text-center text-sm text-gray-500 font-poppins">
                                        Searching products...
                                    </div>

                                ) : searchResults.length > 0 ? (

                                    <>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-gray-100 p-2 overflow-y-auto">

                                            {searchResults.map(
                                                (product) => (

                                                    <Link
                                                        key={
                                                            product._id ||
                                                            product.id
                                                        }
                                                        href={`/products/${
                                                            product._id ||
                                                            product.id
                                                        }`}
                                                        onClick={() =>
                                                            setIsOpen(false)
                                                        }
                                                        className="flex items-center gap-3 p-2 bg-white hover:bg-gray-50 transition-colors rounded-lg group"
                                                    >

                                                        <div className="relative w-10 h-10 flex-shrink-0 bg-[#F5F5F5] rounded-md overflow-hidden flex items-center justify-center">

                                                            <Image
                                                                src={
                                                                    product.thumbnail
                                                                }
                                                                fill
                                                                sizes="40px"
                                                                alt={
                                                                    product.title ||
                                                                    "Product"
                                                                }
                                                                className="object-contain"
                                                            />

                                                        </div>

                                                        <div className="flex flex-col min-w-0">

                                                            <span className="text-xs font-semibold text-gray-800 line-clamp-1 group-hover:text-[#ff6308] transition-colors font-poppins">
                                                                {
                                                                    product.title
                                                                }
                                                            </span>

                                                            <span className="text-xs text-primary font-bold mt-0.5">
                                                                ৳{" "}
                                                                {
                                                                    product.discountPrice > 0
                                                                        ? product.discountPrice
                                                                        : product.price
                                                                }
                                                            </span>

                                                        </div>

                                                    </Link>

                                                )
                                            )}

                                        </div>

                                        <button
                                            onClick={
                                                handleSearchSubmit
                                            }
                                            className="w-full text-center py-2.5 bg-gray-50 border-t text-xs font-bold text-gray-700 hover:text-white hover:bg-secondary transition-all font-poppins cursor-pointer"
                                        >
                                            View All Results (
                                            {searchQuery}
                                            )
                                        </button>

                                    </>

                                ) : (

                                    <div className="p-5 text-center text-sm text-gray-500 font-poppins">
                                        No products found for &quot;
                                        {searchQuery}
                                        &quot;
                                    </div>

                                )}

                            </div>

                        )}

                    </div>

                    {isScrolled && (

                        <div className="hidden md:flex items-center justify-center flex-1">
                            <MenuSection />
                        </div>

                    )}

                    <div className='hidden md:flex items-center gap-6 lg:gap-8 text-black flex-shrink-0'>

                        <Link
                            href={"/wishlist"}
                            className='cursor-pointer relative group'
                        >

                            <div className="relative w-6 h-6">

                                <Image
                                    src={wishlistIcon}
                                    fill
                                    sizes="24px"
                                    alt="wishlist"
                                    className="object-contain"
                                />

                            </div>

                            <span className='absolute -top-3 -right-3 bg-primary text-white text-[10px] font-bold rounded-full w-4.5 h-4.5 flex items-center justify-center'>
                                {wishlistCount}
                            </span>

                        </Link>

                        <Link
                            href={"/cart"}
                            className='cursor-pointer relative group'
                        >

                            <div className="relative w-[25px] h-[25px]">

                                <Image
                                    src={cartIcon}
                                    fill
                                    sizes="25px"
                                    alt="cart"
                                    className="object-contain"
                                />

                            </div>

                            <span className='absolute -top-3 -right-3 bg-primary text-white text-[10px] font-bold rounded-full w-4.5 h-4.5 flex items-center justify-center'>
                                {cartCount}
                            </span>

                        </Link>

                        <div className='relative group pt-2 pb-2 -my-2'>

                            <button
                                onClick={handleProfileClick}
                                className='cursor-pointer flex items-center justify-center rounded-full hover:bg-secondary hover:text-white transition-all border overflow-hidden w-10 h-10 bg-gray-100 text-black font-bold'
                            >

                                {user?.picture ? (

                                    <Image
                                        src={user.picture}
                                        alt="User Photo"
                                        width={40}
                                        height={40}
                                        className="rounded-full object-cover w-full h-full"
                                    />

                                ) : user?.name ? (

                                    <span className="text-sm font-semibold uppercase">
                                        {user.name.charAt(0)}
                                    </span>

                                ) : (

                                    <RiUser3Line size={22} />

                                )}

                            </button>

                            {user && (

                                <div className='absolute right-0 top-10 mt-1 w-64 bg-black/80 backdrop-blur-md text-white rounded-lg p-4 shadow-xl opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto transition-all duration-200 z-[999] flex flex-col gap-3'>

                                    <div className="px-2 py-1 border-b border-white/10 text-xs text-gray-300">

                                        <p className="font-bold text-white">
                                            {user.name}
                                        </p>

                                        <p className="truncate">
                                            {user.email}
                                        </p>

                                    </div>

                                    <Link
                                        href={"/user/profile"}
                                        className='flex items-center gap-3 py-1.5 px-2 hover:bg-white/10 rounded-md transition-colors text-sm font-light cursor-pointer'
                                    >

                                        <FiUser size={20} />

                                        <span>
                                            Manage My Account
                                        </span>

                                    </Link>

                                    <button
                                        onClick={handleLogOut}
                                        className='flex items-center gap-3 py-1.5 px-2 hover:bg-white/10 rounded-md transition-colors text-sm font-light w-full text-left cursor-pointer'
                                    >

                                        <FiLogOut size={20} />

                                        <span>
                                            Logout
                                        </span>

                                    </button>

                                </div>

                            )}

                        </div>

                    </div>

                </div>

            </div>

        </nav>

    );
};

export default Navbar;
