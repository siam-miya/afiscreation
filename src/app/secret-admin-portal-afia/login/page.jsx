'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import API from '@/utils/api';
import { FiMail, FiLock, FiEye, FiEyeOff, FiShield } from 'react-icons/fi';

const AdminLoginPage = () => {
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [siteSettings, setSiteSettings] = useState({
    siteName: 'Afis Creation',
    logo: '',
  });

  React.useEffect(() => {

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
          result?.data
        ) {

          setSiteSettings({
            siteName:
              result.data.siteName ||
              'Afis Creation',

            logo:
              result.data.logo ||
              '',
          });

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

  React.useEffect(() => {

    const storedUser =
      localStorage.getItem('adminUser') ||
      localStorage.getItem('user');

    if (storedUser) {

      try {

        const u = JSON.parse(storedUser);

        if (
          u?.role === 'admin' ||
          u?.role === 'moderator'
        ) {

          router.replace(
            '/secret-admin-portal-afia/dashboard'
          );

        }

      } catch (e) {}

    }

  }, [router]);

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });

  };

  const handleSubmit = async (e) => {

    e.preventDefault();
    setLoading(true);

    try {

      const { data } =
        await API.post(
          '/auth/login',
          formData
        );

      if (data?.success) {

        const role =
          data?.user?.role;

        if (
          role === 'admin' ||
          role === 'moderator'
        ) {

          localStorage.setItem(
            'user',
            JSON.stringify(data.user)
          );

          localStorage.setItem(
            'adminUser',
            JSON.stringify(data.user)
          );

          if (data.token) {

            localStorage.setItem(
              'token',
              data.token
            );

          }

          toast.success(
            'Welcome to Admin Dashboard!'
          );

          router.push(
            '/secret-admin-portal-afia/dashboard'
          );

          router.refresh();

        } else {

          await API.post(
            '/auth/logout'
          );

          localStorage.removeItem(
            'user'
          );

          localStorage.removeItem(
            'adminUser'
          );

          localStorage.removeItem(
            'token'
          );

          toast.error(
            'Access Denied! You are not an admin or moderator.'
          );

        }

      }

    } catch (error) {

      console.error(
        'Login Error:',
        error
      );

      const errorMessage =
        error.response?.data?.message ||
        'লগইন করতে ব্যর্থ হয়েছে!';

      toast.error(
        errorMessage
      );

    } finally {

      setLoading(false);

    }

  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4 font-poppins">

      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">

        {/* Header Section */}
        <div className="text-center mb-8">

          <div className="w-14 h-14 bg-[#eb6e1b]/10 text-[#eb6e1b] rounded-2xl flex items-center justify-center mx-auto mb-3 border border-[#eb6e1b]/20 overflow-hidden">

            {siteSettings.logo ? (

              <img
                src={siteSettings.logo}
                alt={`${siteSettings.siteName} Logo`}
                className="w-full h-full object-contain p-2"
              />

            ) : (

              <FiShield size={28} />

            )}

          </div>

          <h3 className="text-lg font-bold text-gray-900 mb-1">
            {siteSettings.siteName}
          </h3>

          <h2 className="text-2xl font-bold text-gray-900">
            Admin Portal Login
          </h2>

          <p className="text-xs text-gray-500 mt-1">
            আপনার এডমিন অ্যাকাউন্টে প্রবেশ করতে লগইন করুন
          </p>

        </div>

        {/* Login Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >

          <div>

            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
              Email Address
            </label>

            <div className="relative">

              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                <FiMail size={18} />
              </span>

              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="admin@example.com"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#eb6e1b] focus:bg-white transition-all text-gray-800"
              />

            </div>

          </div>

          <div>

            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
              Password
            </label>

            <div className="relative">

              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                <FiLock size={18} />
              </span>

              <input
                type={
                  showPassword
                    ? 'text'
                    : 'password'
                }
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#eb6e1b] focus:bg-white transition-all text-gray-800"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    !showPassword
                  )
                }
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                {showPassword ? (
                  <FiEyeOff size={18} />
                ) : (
                  <FiEye size={18} />
                )}
              </button>

            </div>

          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#eb6e1b] hover:bg-[#d65f15] text-white font-semibold rounded-xl text-sm shadow-md transition-all duration-200 cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
          >

            {loading ? (

              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>

            ) : (

              'Login to Admin Portal'

            )}

          </button>

        </form>

      </div>

    </div>
  );
};

export default AdminLoginPage;

