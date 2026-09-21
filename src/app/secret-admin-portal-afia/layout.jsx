'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import AdminSidebar from "@/components/Admin/AdminSidebar";
import AdminTopbar from "@/components/Admin/AdminTopbar";

export default function SecretAdminLayout({ children }) {

  const router = useRouter();
  const pathname = usePathname();

  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  const [sidebarOpen, setSidebarOpen] =
    useState(false);


  const isLoginPage =
    pathname.includes('/secret-admin-portal-afia/login');


  useEffect(() => {

    const savedTheme =
      localStorage.getItem('adminTheme');

    if (savedTheme === 'dark') {

      document.documentElement.classList.add('dark');

    } else {

      document.documentElement.classList.remove('dark');

    }

  }, []);


  useEffect(() => {

    // ১. লগইন পেজে থাকলে কোনো পারমিশন চেক হবে না

    if (isLoginPage) {

      setLoading(false);

      return;

    }


    // ২. ড্যাশবোর্ড ও অন্য সব সাব-পেজের জন্য Auth চেক

    const checkAuth = () => {

      const storedUser =
        localStorage.getItem('adminUser') ||
        localStorage.getItem('user');


      if (!storedUser) {

        router.replace(
          '/secret-admin-portal-afia/login'
        );

        return;

      }


      try {

        const user =
          JSON.parse(storedUser);


        if (
          user.role === 'admin' ||
          user.role === 'moderator'
        ) {

          setIsAuthorized(true);

        } else {

          router.replace(
            '/secret-admin-portal-afia/login'
          );

        }

      } catch (error) {

        localStorage.removeItem('adminUser');

        localStorage.removeItem('user');

        router.replace(
          '/secret-admin-portal-afia/login'
        );

      } finally {

        setLoading(false);

      }

    };


    checkAuth();

  }, [
    pathname,
    isLoginPage,
    router
  ]);


  // ================================
  // MOBILE SIDEBAR CLOSE
  // ================================

  useEffect(() => {

    // Page change হলে mobile sidebar automatically close হবে

    setSidebarOpen(false);

  }, [pathname]);


  // ================================
  // BODY SCROLL LOCK
  // ================================

  useEffect(() => {

    if (sidebarOpen) {

      document.body.style.overflow = 'hidden';

    } else {

      document.body.style.overflow = '';

    }


    return () => {

      document.body.style.overflow = '';

    };

  }, [sidebarOpen]);


  // ৩. লগইন পেজ হলে শুধু ফর্ম দেখাবে

  if (isLoginPage) {

    return <>{children}</>;

  }


  // ৪. অথেন্টিকেশন প্রসেস হওয়ার সময় লোডার দেখাবে

  if (loading) {

    return (

      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-slate-900">

        <div className="w-10 h-10 border-4 border-[#eb6e1b] border-t-transparent rounded-full animate-spin"></div>

      </div>

    );

  }


  // ৫. অনুমতি না থাকলে রিডাইরেক্ট হওয়ার আগ পর্যন্ত ফাঁকা রাখবে

  if (!isAuthorized) {

    return null;

  }


  // ৬. এডমিন লগইন করা থাকলে Sidebar ও Topbar সহ ড্যাশবোর্ড রেন্ডার করবে

  return (

    <div className="flex h-screen overflow-hidden bg-gray-100 font-poppins dark:bg-slate-950">


      {/* ================================= */}
      {/* ADMIN SIDEBAR */}
      {/* ================================= */}

      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() =>
          setSidebarOpen(false)
        }
      />


      {/* ================================= */}
      {/* MAIN ADMIN AREA */}
      {/* ================================= */}

      <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden">


        {/* ================================= */}
        {/* ADMIN TOPBAR */}
        {/* ================================= */}

        <AdminTopbar
          onMenuClick={() =>
            setSidebarOpen(true)
          }
        />


        {/* ================================= */}
        {/* PAGE CONTENT */}
        {/* ================================= */}

        <main className="admin-main min-w-0 flex-1 overflow-y-auto bg-gray-50 p-3 transition-colors duration-200 dark:bg-slate-900 sm:p-4 md:p-6">

          {children}

        </main>

      </div>

    </div>

  );

}

