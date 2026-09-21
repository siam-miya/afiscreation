'use client'

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FolderTree,
  Package,
  ShoppingCart,
  Users,
  ChevronDown,
  ChevronUp,
  Zap,
  Sparkles,
  Flame,
  Layers,
  Info,
  Mail,
  User,
  Settings,
  Truck,
  MapPin,
  Wrench,
  Image as ImageIcon,
  X
} from 'lucide-react';

export default function AdminSidebar({
  isOpen = false,
  onClose = () => {}
}) {
  const pathname = usePathname();

  const [siteName, setSiteName] = useState('Afis Creation');

  const [isProductOpen, setIsProductOpen] = useState(
    pathname.includes('/dashboard/products')
  );

  const [isSettingsOpen, setIsSettingsOpen] = useState(
    pathname.includes('/dashboard/settings')
  );

  useEffect(() => {

    const fetchSettings = async () => {

      try {

        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL ||
          "http://localhost:5000";

        const res = await fetch(
          `${apiUrl}/api/settings`
        );

        const result = await res.json();

        if (
          result?.success &&
          result?.data?.siteName
        ) {

          setSiteName(
            result.data.siteName
          );

        }

      } catch (error) {

        console.error(
          "Failed to load site settings:",
          error
        );

      }

    };

    fetchSettings();

  }, []);

  const productSubMenus = [
    {
      name: 'All Products',
      href: '/secret-admin-portal-afia/dashboard/products',
      icon: Layers
    },
    {
      name: 'Flash Sales',
      href: '/secret-admin-portal-afia/dashboard/products/flash-sales',
      icon: Zap
    },
    {
      name: 'New Arrival',
      href: '/secret-admin-portal-afia/dashboard/products/new-arrival',
      icon: Sparkles
    },
    {
      name: 'Best Selling',
      href: '/secret-admin-portal-afia/dashboard/products/best-selling',
      icon: Flame
    },
  ];

  const settingsSubMenus = [
    {
      name: 'Pathao Setting',
      href: '/secret-admin-portal-afia/dashboard/settings/pathao',
      icon: Truck
    },
    {
      name: 'Steadfast Setting',
      href: '/secret-admin-portal-afia/dashboard/settings/steadfast',
      icon: Truck
    },
    {
      name: 'Shipping Zones',
      href: '/secret-admin-portal-afia/dashboard/settings/shipping-zones',
      icon: MapPin
    },
    {
      name: 'Website Settings',
      href: '/secret-admin-portal-afia/dashboard/settings/website-settings',
      icon: Wrench
    },
  ];

  return (

    <>
      {/* Mobile Overlay */}

      {isOpen && (

        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px] md:hidden"
        />

      )}


      <aside
        className={`
          fixed left-0 top-0 z-50
          flex h-screen w-64 flex-col
          overflow-y-auto
          border-r border-gray-200
          bg-white
          p-6
          font-poppins
          transition-all duration-300 ease-in-out
          dark:border-slate-800
          dark:bg-slate-900

          md:static
          md:z-auto
          md:translate-x-0
          md:shadow-none

          ${isOpen
            ? 'translate-x-0 shadow-2xl'
            : '-translate-x-full'
          }
        `}
      >

        {/* Sidebar Header */}

        <div className="mb-8 flex items-center justify-between">

          <div className="flex min-w-0 items-center gap-2 text-xl font-bold text-gray-800 dark:text-white">

            <span className="truncate">
              {siteName}
            </span>

          </div>


          {/* Mobile Close Button */}

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white md:hidden"
          >
            <X size={20} />
          </button>

        </div>


        <nav className="flex-1 space-y-2">


          {/* Dashboard */}

          <Link
            href="/secret-admin-portal-afia/dashboard"
            onClick={onClose}
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
              pathname === '/secret-admin-portal-afia/dashboard'
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
            }`}
          >
            <LayoutDashboard size={20} />

            <span>
              Dashboard
            </span>

          </Link>


          {/* Categories */}

          <Link
            href="/secret-admin-portal-afia/dashboard/categories"
            onClick={onClose}
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
              pathname.startsWith('/secret-admin-portal-afia/dashboard/categories')
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
            }`}
          >
            <FolderTree size={20} />

            <span>
              Categories
            </span>

          </Link>


          {/* Products Dropdown Menu */}

          <div>

            <button
              onClick={() =>
                setIsProductOpen(!isProductOpen)
              }
              className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                pathname.startsWith('/secret-admin-portal-afia/dashboard/products')
                  ? 'bg-gray-100 text-gray-900 dark:bg-slate-800 dark:text-white'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
              }`}
            >

              <div className="flex items-center gap-3">

                <Package size={20} />

                <span>
                  Products
                </span>

              </div>


              {isProductOpen ? (
                <ChevronUp size={16} />
              ) : (
                <ChevronDown size={16} />
              )}

            </button>


            {isProductOpen && (

              <div className="ml-4 mt-2 space-y-1 border-l border-gray-200 pl-4 dark:border-slate-700">

                {productSubMenus.map((sub) => {

                  const SubIcon = sub.icon;

                  const isSubActive =
                    pathname === sub.href;

                  return (

                    <Link
                      key={sub.href}
                      href={sub.href}
                      onClick={onClose}
                      className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                        isSubActive
                          ? 'bg-orange-500/10 font-semibold text-orange-500'
                          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-white'
                      }`}
                    >

                      <SubIcon size={14} />

                      <span>
                        {sub.name}
                      </span>

                    </Link>

                  );

                })}

              </div>

            )}

          </div>


          {/* Orders */}

          <Link
            href="/secret-admin-portal-afia/dashboard/orders"
            onClick={onClose}
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
              pathname.startsWith('/secret-admin-portal-afia/dashboard/orders')
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
            }`}
          >
            <ShoppingCart size={20} />

            <span>
              Orders
            </span>

          </Link>


          {/* Users & Roles */}

          <Link
            href="/secret-admin-portal-afia/dashboard/users"
            onClick={onClose}
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
              pathname.startsWith('/secret-admin-portal-afia/dashboard/users')
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
            }`}
          >
            <Users size={20} />

            <span>
              Users & Roles
            </span>

          </Link>


          {/* About */}

          <Link
            href="/secret-admin-portal-afia/dashboard/about"
            onClick={onClose}
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
              pathname.startsWith('/secret-admin-portal-afia/dashboard/about')
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
            }`}
          >
            <Info size={20} />

            <span>
              About Page
            </span>

          </Link>


          {/* Contact */}

          <Link
            href="/secret-admin-portal-afia/dashboard/contact"
            onClick={onClose}
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
              pathname.startsWith('/secret-admin-portal-afia/dashboard/contact')
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
            }`}
          >
            <Mail size={20} />

            <span>
              Contact Page
            </span>

          </Link>


          {/* Banners */}

          <Link
            href="/secret-admin-portal-afia/dashboard/banners"
            onClick={onClose}
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
              pathname.startsWith('/secret-admin-portal-afia/dashboard/banners')
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
            }`}
          >
            <ImageIcon size={20} />

            <span>
              Banners
            </span>

          </Link>


          {/* Profile */}

          <Link
            href="/secret-admin-portal-afia/dashboard/profile"
            onClick={onClose}
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
              pathname.startsWith('/secret-admin-portal-afia/dashboard/profile')
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
            }`}
          >
            <User size={20} />

            <span>
              Profile
            </span>

          </Link>


          {/* Settings Dropdown Menu */}

          <div>

            <button
              onClick={() =>
                setIsSettingsOpen(!isSettingsOpen)
              }
              className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                pathname.startsWith('/secret-admin-portal-afia/dashboard/settings')
                  ? 'bg-gray-100 text-gray-900 dark:bg-slate-800 dark:text-white'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
              }`}
            >

              <div className="flex items-center gap-3">

                <Settings size={20} />

                <span>
                  Settings
                </span>

              </div>


              {isSettingsOpen ? (
                <ChevronUp size={16} />
              ) : (
                <ChevronDown size={16} />
              )}

            </button>


            {isSettingsOpen && (

              <div className="ml-4 mt-2 space-y-1 border-l border-gray-200 pl-4 dark:border-slate-700">

                {settingsSubMenus.map((sub) => {

                  const SubIcon = sub.icon;

                  const isSubActive =
                    pathname === sub.href;

                  return (

                    <Link
                      key={sub.href}
                      href={sub.href}
                      onClick={onClose}
                      className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                        isSubActive
                          ? 'bg-orange-500/10 font-semibold text-orange-500'
                          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-white'
                      }`}
                    >

                      <SubIcon size={14} />

                      <span>
                        {sub.name}
                      </span>

                    </Link>

                  );

                })}

              </div>

            )}

          </div>

        </nav>

      </aside>

    </>
  );
}

