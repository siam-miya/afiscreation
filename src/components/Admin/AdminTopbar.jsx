'use client'

import React, { useState, useEffect, useRef } from 'react';
import {
  Sun,
  Moon,
  Bell,
  ChevronDown,
  User,
  LogOut,
  Settings,
  Menu
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { LuMessageCircleMore } from 'react-icons/lu';

const AdminTopbar = ({ onMenuClick }) => {

  const router = useRouter();

  const [darkMode, setDarkMode] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const dropdownRef = useRef(null);

  const [adminData, setAdminData] = useState({
    name: 'MD Siam Miya',
    role: 'Super Admin',
    avatar: ''
  });


  const loadAdminData = () => {

    const stored =
      localStorage.getItem('adminUser') ||
      localStorage.getItem('user');

    if (stored) {

      try {

        const parsed =
          JSON.parse(stored);

        setAdminData({
          name: parsed.name || 'Admin',
          role: parsed.role || 'Super Admin',
          avatar:
            parsed.picture ||
            parsed.avatar ||
            parsed.image ||
            ''
        });

      } catch (err) {

        console.error(
          "Error parsing admin user",
          err
        );

      }

    }

  };


  useEffect(() => {

    const savedTheme =
      localStorage.getItem('adminTheme');

    if (savedTheme === 'dark') {

      document.documentElement.classList.add('dark');

      setDarkMode(true);

    } else {

      document.documentElement.classList.remove('dark');

      setDarkMode(false);

    }


    loadAdminData();


    const handleUserLoginSync = () => {

      loadAdminData();

    };


    window.addEventListener(
      'userLogin',
      handleUserLoginSync
    );


    return () => {

      window.removeEventListener(
        'userLogin',
        handleUserLoginSync
      );

    };

  }, []);


  useEffect(() => {

    const handleClickOutside = (event) => {

      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {

        setDropdownOpen(false);

      }

    };


    document.addEventListener(
      'mousedown',
      handleClickOutside
    );


    return () => {

      document.removeEventListener(
        'mousedown',
        handleClickOutside
      );

    };

  }, []);


  // ================================
  // DARK / LIGHT THEME TOGGLE
  // ================================

  const toggleTheme = () => {

    const newDarkMode =
      !darkMode;

    setDarkMode(newDarkMode);


    if (newDarkMode) {

      document.documentElement.classList.add('dark');

      localStorage.setItem(
        'adminTheme',
        'dark'
      );

    } else {

      document.documentElement.classList.remove('dark');

      localStorage.setItem(
        'adminTheme',
        'light'
      );

    }

  };


  const handleAdminLogout = () => {

    localStorage.removeItem('adminUser');

    localStorage.removeItem('user');

    toast.success(
      "Successfully logged out!"
    );

    router.push(
      '/secret-admin-portal-afia/login'
    );

  };


  const getInitials = (name) => {

    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);

  };


  return (

    <header className="flex h-16 w-full shrink-0 items-center justify-between border-b border-gray-200 bg-white px-3 shadow-sm transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900 sm:px-4 md:px-6">


      {/* ================================= */}
      {/* LEFT SIDE */}
      {/* ================================= */}

      <div className="flex min-w-0 items-center gap-2 sm:gap-3">


        {/* Mobile Hamburger */}

        <button
          type="button"
          onClick={onMenuClick}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-600 transition-all hover:bg-gray-200 hover:text-gray-900 dark:bg-slate-800 dark:text-gray-300 dark:hover:bg-slate-700 dark:hover:text-white md:hidden"
          aria-label="Open admin menu"
        >

          <Menu size={21} />

        </button>


        {/* Welcome Message */}

        <h2 className="truncate text-sm font-semibold text-gray-800 dark:text-white sm:text-base">
          Welcome to Admin Dashboard
        </h2>

      </div>


      {/* ================================= */}
      {/* RIGHT SIDE */}
      {/* ================================= */}

      <div className="flex shrink-0 items-center gap-2 sm:gap-4">


        {/* ================================= */}
        {/* DARK / LIGHT MODE */}
        {/* ================================= */}

        <button
          onClick={toggleTheme}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-gray-600 transition-all hover:bg-gray-200 dark:bg-slate-800 dark:text-yellow-400 dark:hover:bg-slate-700 sm:h-auto sm:w-auto sm:p-2"
          title={
            darkMode
              ? "Switch to Light Mode"
              : "Switch to Dark Mode"
          }
        >

          {darkMode ? (
            <Sun size={20} />
          ) : (
            <Moon size={20} />
          )}

        </button>


        {/* ================================= */}
        {/* MESSAGE / NOTIFICATION */}
        {/* ================================= */}

        <div className="relative">

          <Link
            href="/secret-admin-portal-afia/dashboard/contact"
          >

            <button
              type="button"
              className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-gray-600 transition-all hover:bg-gray-200 dark:bg-slate-800 dark:text-gray-300 dark:hover:bg-slate-700 sm:h-auto sm:w-auto sm:p-2"
            >

              <LuMessageCircleMore
                size={20}
              />

              <span className="absolute right-1.5 top-1.5 h-2 w-2 animate-pulse rounded-full bg-orange-500"></span>

            </button>

          </Link>

        </div>


        {/* ================================= */}
        {/* ADMIN PROFILE */}
        {/* ================================= */}

        <div
          className="relative"
          ref={dropdownRef}
        >

          <button
            onClick={() =>
              setDropdownOpen(!dropdownOpen)
            }
            className="flex items-center gap-1.5 rounded-xl py-1.5 pl-1.5 transition-all hover:bg-gray-100 dark:hover:bg-slate-800 sm:gap-3 sm:pl-2"
          >

            {/* Avatar */}

            {adminData.avatar ? (

              <img
                src={adminData.avatar}
                alt="Admin"
                className="h-9 w-9 rounded-xl border border-orange-500 object-cover shadow-md"
              />

            ) : (

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500 font-bold text-white shadow-md">
                {getInitials(
                  adminData.name
                )}
              </div>

            )}


            {/* Name / Role */}

            <div className="hidden text-left md:block">

              <h4 className="text-xs font-semibold text-gray-800 dark:text-white">
                {adminData.name}
              </h4>

              <span className="text-[10px] text-gray-500 dark:text-slate-400">
                {adminData.role}
              </span>

            </div>


            <ChevronDown
              size={16}
              className="ml-0.5 text-gray-500 dark:text-slate-400 sm:ml-1"
            />

          </button>


          {/* ================================= */}
          {/* DROPDOWN */}
          {/* ================================= */}

          {dropdownOpen && (

            <div className="absolute right-0 z-50 mt-2 w-48 animate-in overflow-hidden rounded-2xl border border-gray-200 bg-white py-2 shadow-xl fade-in zoom-in-95 dark:border-slate-800 dark:bg-slate-900">


              {/* Mobile Admin Info */}

              <div className="border-b border-gray-100 px-4 py-2 dark:border-slate-800 md:hidden">

                <p className="text-xs font-semibold text-gray-800 dark:text-white">
                  {adminData.name}
                </p>

                <p className="text-[10px] text-gray-500 dark:text-slate-400">
                  {adminData.role}
                </p>

              </div>


              {/* Profile */}

              <Link
                href="/secret-admin-portal-afia/dashboard/profile"
                onClick={() =>
                  setDropdownOpen(false)
                }
                className="flex items-center gap-2.5 px-4 py-2 text-xs text-gray-700 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-800"
              >

                <User size={15} />

                My Profile

              </Link>


              {/* Settings */}

              <Link
                href="/secret-admin-portal-afia/dashboard/settings"
                onClick={() =>
                  setDropdownOpen(false)
                }
                className="flex items-center gap-2.5 px-4 py-2 text-xs text-gray-700 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-800"
              >

                <Settings size={15} />

                Settings

              </Link>


              <div className="my-1 border-t border-gray-100 dark:border-slate-800"></div>


              {/* Logout */}

              <button
                onClick={handleAdminLogout}
                className="flex w-full cursor-pointer items-center gap-2.5 px-4 py-2 text-left text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
              >

                <LogOut size={15} />

                Logout

              </button>

            </div>

          )}

        </div>

      </div>

    </header>

  );

};

export default AdminTopbar;

