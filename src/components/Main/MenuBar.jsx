"use client";
import React, { useState, useEffect, useRef } from 'react'
import { MdOutlineKeyboardArrowDown, MdOutlineKeyboardArrowRight, MdOutlineKeyboardArrowUp, MdHelpOutline } from "react-icons/md"
import MenuSection from "./MenuSection"
import Link from "next/link"
import Image from 'next/image'
import { RxHamburgerMenu, RxCross2 } from "react-icons/rx"
import { usePathname, useRouter } from 'next/navigation'
import { useDrawerStore } from '@/store/useDrawerStore'
import logo from "../../../public/navbarLogo.png"
import wishlistIcon from "../../assets/icons/wishlist.svg"
import cartIcon from "../../assets/icons/cart.png"
import { RiUser3Line } from 'react-icons/ri'
import { useCartStore } from '@/store/useCartStore'
import { useWishlistStore } from '@/store/useWishlistStore'
import { FiUser, FiLogOut, FiHeart } from "react-icons/fi"
import { toast } from 'react-toastify'
import { Spinner } from '@heroui/react';
import { AiOutlineHome, AiOutlineAppstore, AiOutlineUser, AiOutlineInfoCircle } from "react-icons/ai"
import { FaShoppingBag } from "react-icons/fa";
import { TbTruckDelivery } from 'react-icons/tb';
import API from '../../utils/api';
import axios from "axios";

const MenuBar = () => {
    const pathname = usePathname();
    const router = useRouter();
    const cart = useCartStore((state) => state.cart);
    const wishlist = useWishlistStore((state) => state.wishlist);
    const { isDrawerOpen, closeDrawer, toggleDrawer } = useDrawerStore();

    // User state
    const [user, setUser] = useState(null);

    const [isMounted, setIsMounted] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    // Dynamic Site Settings
    const [siteSettings, setSiteSettings] = useState({
        logo: "",
        siteName: ""
    });

    // ক্যাটেগরি ড্রপডাউন টগল করার জন্য স্টেট
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);

    const drawerRef = useRef(null);
    const categoryRef = useRef(null);

    const checkUserSession = () => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (error) {
                console.error("Failed to parse user data", error);
                setUser(null);
            }
        } else {
            setUser(null);
        }
    };

    useEffect(() => {
        setIsMounted(true);
        checkUserSession();

        const handleStorageChange = () => {
            checkUserSession();
        };

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('userLogin', handleStorageChange);

        // Dynamic Site Settings Fetch
      const fetchSiteSettings = async () => {
    try {
        const apiBase =
            process.env.NEXT_PUBLIC_API_URL ||
            "http://localhost:5000";

        const res = await axios.get(
            `${apiBase.replace(/\/+$/, "")}/api/settings`,
            {
                withCredentials: true,
            }
        );

        if (
            res.data &&
            res.data.success &&
            res.data.data
        ) {
            setSiteSettings({
                logo: res.data.data.logo || "",
                siteName: res.data.data.siteName || ""
            });
        }
    } catch (error) {
        console.error("Failed to fetch site settings:", error);
    }
};

        fetchSiteSettings();
        const fetchCategories = async () => {
            try {
                const res = await API.get('/categories/all');
                if (res.data && res.data.success) {
                    setCategories(res.data.data);
                }
            } catch (error) {
                console.error("Failed to fetch categories:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();

        const handleScroll = () => {
            if (window.scrollY > 120) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener("scroll", handleScroll);

        return () => {
            window.removeEventListener("scroll", handleScroll);
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('userLogin', handleStorageChange);
        };
    }, []);

    // বাইরে ক্লিক করলে ক্যাটেগরি ড্রপডাউন বন্ধ হয়ে যাওয়ার জন্য
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (categoryRef.current && !categoryRef.current.contains(event.target)) {
                setIsCategoryOpen(false);
            }

            if (drawerRef.current && !drawerRef.current.contains(event.target)) {
                closeDrawer();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [closeDrawer]);

    useEffect(() => {
        closeDrawer();
        setIsCategoryOpen(false);
    }, [pathname, closeDrawer]);

    const cartCount = isMounted
        ? cart.reduce((total, item) => total + item.quantity, 0)
        : 0;

    const wishlistCount = isMounted
        ? wishlist.length
        : 0;

    const handleLogOut = () => {
        localStorage.removeItem('user');
        setUser(null);
        window.dispatchEvent(new Event('userLogin'));
        toast.success("Successfully logged out your account");
        router.push('/login');
    }

    // প্রফাইলের ছবির সম্ভাব্য প্রপার্টিগুলো চেক করার একটি ছোট ফাংশন
    const getUserImage = () => {
        return user?.picture ||
            user?.avatar ||
            user?.photo ||
            user?.image ||
            user?.profilePic;
    };

    return (
        <>
            <section className="hidden lg:block bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm transition-all duration-300">

                <div className="container mx-auto px-4 md:px-0">

                    <div
                        className={`flex items-center justify-between relative transition-all duration-300 ${
                            isScrolled ? "py-2.5" : ""
                        }`}
                    >

                        <div className="w-[220px] lg:w-[270px] flex-shrink-0 flex items-center">

                            {!isScrolled ? (

                                <div
                                    ref={categoryRef}
                                    className="w-full z-25 relative self-start"
                                >

                                    <h2
                                        onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                                        className="bg-primary text-white py-3.5 px-4 flex items-center justify-between gap-2 font-bold text-sm select-none cursor-pointer rounded-t-md"
                                    >

                                        <span className="flex items-center gap-2 font-poppins">
                                            <RxHamburgerMenu size={18} />
                                            Browse Categories
                                        </span>

                                        <span>
                                            {isCategoryOpen
                                                ? <MdOutlineKeyboardArrowUp size={20} />
                                                : <MdOutlineKeyboardArrowDown size={20} />
                                            }
                                        </span>

                                    </h2>

                                    <ul
                                        className={`w-full bg-white border border-gray-200 shadow-xl p-2 flex-col transition-all duration-200 rounded-b-md absolute left-0 top-[48px] z-[999] ${
                                            isCategoryOpen ? 'flex' : 'hidden'
                                        }`}
                                    >

                                        {loading ? (

                                            <div className="flex flex-col items-center py-5 gap-2">

                                                <Spinner
                                                    size="md"
                                                    color="danger"
                                                />

                                                <span className="text-xs text-primary">
                                                    Categories Loading....
                                                </span>

                                            </div>

                                        ) : (

                                            categories.map((cat, index) => {

                                                const subs =
                                                    cat.subcategories ||
                                                    cat.subCategory ||
                                                    cat.children ||
                                                    [];

                                                return (

                                                    <ListItems
                                                        key={cat._id || index}
                                                        text={cat.name}
                                                        slug={cat.slug}
                                                        subcategories={subs}
                                                        categoryIcon={
                                                            cat.icon ? (
                                                                <Image
                                                                    src={cat.icon}
                                                                    alt={cat.name}
                                                                    width={18}
                                                                    height={18}
                                                                    className="object-contain w-[18px] h-[18px]"
                                                                />
                                                            ) : (
                                                                <FaShoppingBag size={18} />
                                                            )
                                                        }
                                                        rightIcon={subs.length > 0}
                                                        onClick={() => setIsCategoryOpen(false)}
                                                    />

                                                );

                                            })

                                        )}

                                    </ul>

                                </div>

                            ) : (

                                <Link
                                    href={"/"}
                                    className="flex items-center gap-2 animate-fadeIn"
                                >

                                    {/* FIXED LOGO SIZE */}
                                    <div className="w-[140px] h-[30px] flex items-center">

                                        <Image
                                            className="object-contain max-w-full max-h-full w-auto h-auto"
                                            src={siteSettings.logo || logo}
                                            width={150}
                                            height={38}
                                            alt={siteSettings.siteName || 'logo'}
                                            priority
                                        />

                                    </div>

                                </Link>

                            )}

                        </div>

                        <div className="flex-1 flex justify-center">
                            <MenuSection />
                        </div>

                        <div className="flex-shrink-0 min-w-[120px] flex justify-end items-center">

                            {!isScrolled ? (

                                <Link href={"/order/ordertrack"}>

                                    <button
                                        className="text-white font-bold text-sm hover:bg-secondary transition-colors cursor-pointer py-2.5 px-5 bg-primary rounded-md animate-fadeIn font-poppins"
                                    >
                                        Order Track
                                    </button>

                                </Link>

                            ) : (

                                <div className="flex items-center gap-6 text-black animate-fadeIn relative z-[999]">

                                    <Link
                                        href={"/wishlist"}
                                        className='cursor-pointer relative group'
                                    >

                                        <Image
                                            src={wishlistIcon}
                                            height={22}
                                            width={22}
                                            alt="wishlist"
                                        />

                                        <span className='absolute -top-2.5 -right-2 bg-primary text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center'>
                                            {wishlistCount}
                                        </span>

                                    </Link>

                                    <Link
                                        href={"/cart"}
                                        className='cursor-pointer relative group'
                                    >

                                        <Image
                                            src={cartIcon}
                                            height={23}
                                            width={23}
                                            alt="cart"
                                        />

                                        <span className='absolute -top-2.5 -right-2 bg-primary text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center'>
                                            {cartCount}
                                        </span>

                                    </Link>

                                    <div className='relative group pt-2 pb-2 -my-2'>

                                        <Link
                                            href={user ? "/user/profile" : "/login"}
                                            className='cursor-pointer flex items-center justify-center rounded-full hover:bg-secondary hover:text-white transition-all border overflow-hidden w-9 h-9 bg-gray-100 text-black font-bold'
                                        >

                                            {getUserImage() ? (

                                                <Image
                                                    src={getUserImage()}
                                                    alt="User"
                                                    width={36}
                                                    height={36}
                                                    className="rounded-full object-cover w-full h-full"
                                                />

                                            ) : user?.name ? (

                                                <span className="text-xs uppercase">
                                                    {user.name.charAt(0)}
                                                </span>

                                            ) : (

                                                <RiUser3Line size={18} />

                                            )}

                                        </Link>

                                        {user && (

                                            <div className='absolute right-0 top-full mt-2 w-64 bg-black/80 backdrop-blur-md text-white rounded-lg p-4 shadow-xl opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto transition-all duration-200 z-[999] flex flex-col gap-3'>

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
                                                    <FiUser size={18} />
                                                    <span>Manage My Account</span>
                                                </Link>

                                                <button
                                                    onClick={handleLogOut}
                                                    className='flex items-center gap-3 py-1.5 px-2 hover:bg-white/10 rounded-md transition-colors text-sm font-light w-full text-left cursor-pointer'
                                                >
                                                    <FiLogOut size={18} />
                                                    <span>Logout</span>
                                                </button>

                                            </div>

                                        )}

                                    </div>

                                </div>

                            )}

                        </div>

                    </div>

                </div>

            </section>

            {/* MOBILE DRAWER */}

            <div
                className={`fixed inset-0 bg-black/60 z-[99999] transition-opacity duration-300 lg:hidden ${
                    isDrawerOpen
                        ? "opacity-100 pointer-events-auto"
                        : "opacity-0 pointer-events-none"
                }`}
            >

                <div
                    ref={drawerRef}
                    className={`fixed top-0 left-0 bottom-0 w-[290px] bg-[#F7F7F7] z-[999999] shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
                        isDrawerOpen
                            ? "translate-x-0"
                            : "-translate-x-full"
                    }`}
                >

                    <div className="p-4 bg-white relative">

                        <button
                            onClick={closeDrawer}
                            className="absolute right-4 top-4 text-gray-500 hover:text-black p-1 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                        >
                            <RxCross2 size={20} />
                        </button>

                        <div className="mt-6 bg-primary rounded-2xl p-4 text-white flex items-center gap-4 shadow-md">

                            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white border border-white/30 overflow-hidden font-bold flex-shrink-0">

                                {getUserImage() ? (

                                    <Image
                                        src={getUserImage()}
                                        alt="User"
                                        width={48}
                                        height={48}
                                        className="rounded-full object-cover w-full h-full"
                                    />

                                ) : user?.name ? (

                                    <span className="text-sm uppercase">
                                        {user.name.charAt(0)}
                                    </span>

                                ) : (

                                    <RiUser3Line size={26} />

                                )}

                            </div>

                            <div className="min-w-0">

                                <h3 className="font-bold text-base font-poppins truncate">
                                    {user?.name
                                        ? user.name
                                        : "Hello there!"
                                    }
                                </h3>

                                {user ? (

                                    <p className="text-xs text-white/90 truncate">
                                        {user.email}
                                    </p>

                                ) : (

                                    <Link
                                        href="/login"
                                        onClick={closeDrawer}
                                        className="text-xs text-white/90 underline hover:text-white"
                                    >
                                        Login / Register
                                    </Link>

                                )}

                            </div>

                        </div>

                    </div>

                    <div className="flex-1 overflow-y-auto px-4 py-2">

                        <div className="bg-white rounded-2xl p-2 shadow-sm border border-gray-100">

                            <ul className="flex flex-col divide-y divide-gray-50">

                                {loading ? (

                                    <div className="flex flex-col items-center py-10 gap-2">

                                        <Spinner
                                            size="md"
                                            color="danger"
                                        />

                                        <span className="text-sm text-primary">
                                            Categories Loading...
                                        </span>

                                    </div>

                                ) : (

                                    categories.map((cat, index) => {

                                        const subs =
                                            cat.subcategories ||
                                            cat.subCategory ||
                                            cat.children ||
                                            [];

                                        return (

                                            <ListItems
                                                key={cat._id || index}
                                                text={cat.name}
                                                slug={cat.slug}
                                                subcategories={subs}
                                                categoryIcon={
                                                    cat.icon ? (

                                                        <Image
                                                            src={cat.icon}
                                                            alt={cat.name}
                                                            width={18}
                                                            height={18}
                                                            className="object-contain w-[18px] h-[18px]"
                                                        />

                                                    ) : (

                                                        <FaShoppingBag size={18} />

                                                    )
                                                }
                                                rightIcon={subs.length > 0}
                                                onClick={closeDrawer}
                                            />

                                        );

                                    })

                                )}

                            </ul>

                        </div>

                        <div className="mt-5 mb-4">

                            <h4 className="text-xs font-bold text-gray-400 px-2 mb-2 tracking-wider">
                                QUICK LINKS
                            </h4>

                            <div className="bg-white rounded-2xl p-2 shadow-sm border border-gray-100 flex flex-col gap-1">

                                <Link
                                    href="/about"
                                    onClick={closeDrawer}
                                    className="flex items-center gap-3 py-2.5 px-3 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-colors font-poppins"
                                >
                                    <AiOutlineInfoCircle
                                        size={18}
                                        className="text-gray-500"
                                    />
                                    <span>About Us</span>
                                </Link>

                                <Link
                                    href="/wishlist"
                                    onClick={closeDrawer}
                                    className="flex items-center gap-3 py-2.5 px-3 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-colors font-poppins"
                                >
                                    <FiHeart
                                        size={18}
                                        className="text-gray-500"
                                    />
                                    <span>Wishlists</span>
                                </Link>

                                <Link
                                    href="/faq"
                                    onClick={closeDrawer}
                                    className="flex items-center gap-3 py-2.5 px-3 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-colors font-poppins"
                                >
                                    <MdHelpOutline
                                        size={18}
                                        className="text-gray-500"
                                    />
                                    <span>Faqs</span>
                                </Link>

                                {user && (

                                    <button
                                        onClick={() => {
                                            closeDrawer();
                                            handleLogOut();
                                        }}
                                        className="flex items-center gap-3 py-2.5 px-3 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors font-poppins w-full text-left"
                                    >
                                        <FiLogOut size={18} />
                                        <span>Logout</span>
                                    </button>

                                )}

                            </div>

                        </div>

                    </div>

                </div>

            </div>

            {/* MOBILE BOTTOM NAV */}

            <div className="lg:hidden fixed bottom-0 left-0 right-0 h-14 bg-primary text-white grid grid-cols-5 items-center justify-items-center z-[9999] shadow-[0_-2px_10px_rgba(0,0,0,0.1)] font-poppins px-1">

                <Link
                    href="/"
                    className={`flex flex-col items-center justify-center w-full text-center gap-0.5 text-[10px] ${
                        pathname === '/'
                            ? "text-black font-semibold"
                            : ""
                    }`}
                >
                    <AiOutlineHome size={22} />
                    <span>HOME</span>
                </Link>

                <Link
                    href="/wishlist"
                    className={`flex flex-col items-center justify-center w-full text-center gap-0.5 text-[10px] relative ${
                        pathname === '/wishlist'
                            ? "text-black font-semibold"
                            : ""
                    }`}
                >

                    <div className="relative flex items-center justify-center">

                        <FiHeart
                            size={22}
                            className={
                                pathname === '/wishlist'
                                    ? "text-black"
                                    : "text-white"
                            }
                        />

                        <span className="absolute -top-1.5 -right-2 bg-white text-primary font-bold rounded-full text-[9px] w-4.5 h-4.5 flex items-center justify-center">
                            {wishlistCount}
                        </span>

                    </div>

                    <span>WISHLIST</span>

                </Link>

                <button
                    onClick={toggleDrawer}
                    className="flex flex-col items-center justify-center w-full text-center gap-0.5 text-[10px]"
                >
                    <AiOutlineAppstore size={22} />
                    <span>CATEGORIES</span>
                </button>

                <Link
                    href="/order/ordertrack"
                    className={`flex flex-col items-center justify-center w-full text-center gap-0.5 text-[10px] relative ${
                        pathname === '/ordertrack'
                            ? "text-black font-semibold"
                            : ""
                    }`}
                >

                    <div className="relative flex items-center justify-center">

                        <TbTruckDelivery
                            size={22}
                            className={
                                pathname === '/ordertrack'
                                    ? "text-black"
                                    : "text-white"
                            }
                        />

                    </div>

                    <span className="whitespace-nowrap">
                        ORDER TRACK
                    </span>

                </Link>

                <Link
                    href={user ? "/user/profile" : "/login"}
                    className={`flex flex-col items-center justify-center w-full text-center gap-0.5 text-[10px] ${
                        pathname.startsWith('/user')
                            ? "text-black font-semibold"
                            : ""
                    }`}
                >

                    <div className="w-[22px] h-[22px] rounded-full overflow-hidden flex items-center justify-center bg-white/20 border border-white/30 text-white font-bold">

                        {getUserImage() ? (

                            <Image
                                src={getUserImage()}
                                alt="User"
                                width={22}
                                height={22}
                                className="rounded-full object-cover w-full h-full"
                            />

                        ) : user?.name ? (

                            <span className="text-[10px] uppercase">
                                {user.name.charAt(0)}
                            </span>

                        ) : (

                            <AiOutlineUser size={22} />

                        )}

                    </div>

                    <span>ACCOUNT</span>

                </Link>

            </div>

        </>
    )
}

export default MenuBar


function ListItems({
    rightIcon = false,
    categoryIcon,
    text,
    slug,
    subcategories = [],
    onClick
}) {

    const [isOpen, setIsOpen] = useState(false);

    return (

        <li
            className="w-full text-black hover:bg-secondary rounded-xl transition-all relative"

            onMouseEnter={() => {
                if (subcategories.length > 0) {
                    setIsOpen(true);
                }
            }}

            onMouseLeave={() => setIsOpen(false)}
        >

            <Link
                href={`/products?category=${slug}`}
                className="grid grid-cols-[24px_1fr_24px] gap-2 items-center py-2.5 px-3"
                onClick={onClick}
            >

                <span className="flex items-center justify-center text-gray-500">
                    {categoryIcon}
                </span>

                <span className="text-xs sm:text-sm capitalize font-poppins font-medium text-gray-700">
                    {text}
                </span>

                {rightIcon && (

                    <MdOutlineKeyboardArrowRight
                        size={18}
                        className="text-gray-400 justify-self-end"
                    />

                )}

            </Link>

            {/* SUBCATEGORY DROPDOWN */}

            {subcategories.length > 0 && (

                <div
                    className={`absolute left-full top-0 w-60 bg-white border border-gray-200 shadow-2xl rounded-xl p-2 z-[99999] transition-all duration-200 ${
                        isOpen
                            ? "opacity-100 visible translate-x-0"
                            : "opacity-0 invisible -translate-x-2 pointer-events-none"
                    }`}
                >

                    <ul className="flex flex-col gap-1">

                        {subcategories.map((sub, idx) => (

                            <li key={sub._id || idx}>

                                <Link
                                    href={`/products?category=${sub.slug || sub._id}`}
                                    onClick={onClick}
                                    className="block py-2 px-3 text-xs sm:text-sm text-gray-600 hover:bg-gray-100 hover:text-secondary rounded-lg transition-colors capitalize font-poppins font-medium"
                                >
                                    {sub.name || sub}
                                </Link>

                            </li>

                        ))}

                    </ul>

                </div>

            )}

        </li>

    );

}