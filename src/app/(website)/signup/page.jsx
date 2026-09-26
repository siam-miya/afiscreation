'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import main_logo from '../../../../public/main-logo.jpg';
import Link from 'next/link';
import { FcGoogle } from 'react-icons/fc';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import API from '@/utils/api';
import { useGoogleLogin } from '@react-oauth/google';

const SignUp = () => {
  const router = useRouter();

  const [step, setStep] = useState('form');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    otp: '',
  });

  const [errorMessage, setErrorMessage] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  const [showPassword, setShowPassword] =
    useState(false);

  /* =========================
     INPUT CHANGE
  ========================= */

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    if (errorMessage) {
      setErrorMessage('');
    }
  };

  /* =========================
     REGISTER
  ========================= */

  const handleRegister = async (e) => {
    e.preventDefault();

    setErrorMessage('');
    setLoading(true);

    try {
      const name =
        formData.name.trim();

      const email =
        formData.email
          .trim()
          .toLowerCase();

      const password =
        formData.password;

      if (name.length < 2) {
        setErrorMessage(
          'Name must contain at least 2 characters.'
        );
        return;
      }

      if (password.length < 8) {
        setErrorMessage(
          'Password must contain at least 8 characters.'
        );
        return;
      }

      const response = await API.post(
        '/auth/register',
        {
          name,
          email,
          password,
        }
      );

      if (response.data.success) {
        setFormData((prev) => ({
          ...prev,
          name,
          email,
          otp: '',
        }));

        setStep('otp');
      }
    } catch (err) {
      const message =
        err.response?.data?.message ||
        'Something went wrong!';

      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     VERIFY OTP
  ========================= */

  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    setErrorMessage('');
    setLoading(true);

    try {
      const email =
        formData.email
          .trim()
          .toLowerCase();

      const otp =
        formData.otp.trim();

      if (!/^\d{6}$/.test(otp)) {
        setErrorMessage(
          'Please enter a valid 6-digit OTP.'
        );
        return;
      }

      const response =
        await API.post(
          '/auth/verify-otp',
          {
            email,
            otp,
          }
        );

      if (response.data.success) {
        const userData =
          response.data.user;

        if (!userData) {
          throw new Error(
            'User information was not returned.'
          );
        }

        // Store user information only.
        // Authentication tokens are HttpOnly cookies.
        localStorage.setItem(
          'user',
          JSON.stringify(userData)
        );

        if (
          userData.role === 'admin' ||
          userData.role === 'moderator'
        ) {
          localStorage.setItem(
            'adminUser',
            JSON.stringify(userData)
          );
        }

        // Remove old JWT storage
        localStorage.removeItem('token');
        localStorage.removeItem('adminToken');
        localStorage.removeItem(
          'adminUserToken'
        );

        window.dispatchEvent(
          new Event('userStateChanged')
        );

        router.push('/');
        router.refresh();
      }
    } catch (err) {
      const message =
        err.response?.data?.message ||
        'Invalid OTP!';

      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     GOOGLE SIGNUP / LOGIN
  ========================= */

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setLoading(true);
        setErrorMessage('');

        if (!tokenResponse?.access_token) {
          throw new Error(
            'Google access token was not received.'
          );
        }

        const response =
          await API.post(
            '/auth/google',
            {
              accessToken:
                tokenResponse.access_token,
            }
          );

        if (response.data.success) {
          const userData =
            response.data.user;

          if (!userData) {
            throw new Error(
              'User information was not returned.'
            );
          }

          localStorage.setItem(
            'user',
            JSON.stringify(userData)
          );

          if (
            userData.role === 'admin' ||
            userData.role === 'moderator'
          ) {
            localStorage.setItem(
              'adminUser',
              JSON.stringify(userData)
            );
          } else {
            localStorage.removeItem(
              'adminUser'
            );
          }

          // Remove old JWT storage
          localStorage.removeItem('token');
          localStorage.removeItem(
            'adminToken'
          );
          localStorage.removeItem(
            'adminUserToken'
          );

          window.dispatchEvent(
            new Event('userStateChanged')
          );

          router.push('/');
          router.refresh();
        }
      } catch (err) {
        setErrorMessage(
          err.response?.data?.message ||
            'Google authentication failed!'
        );
      } finally {
        setLoading(false);
      }
    },

    onError: () => {
      setLoading(false);

      setErrorMessage(
        'Google Sign Up Failed. Please try again.'
      );
    },
  });

  return (
    <section className="px-5">
      <div className="container mx-auto">

        <div className="flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-[50px] py-10">

          {/* =========================
              LOGO
          ========================= */}

          <div className="w-full lg:w-[950px] flex justify-center">
            <Image
              src={main_logo}
              height={781}
              width={950}
              alt="Afis Creation"
              className="w-full h-auto object-contain"
              priority
            />
          </div>

          {/* =========================
              FORM AREA
          ========================= */}

          <div className="w-full max-w-[500px]">

            <h2 className="text-[36px] font-medium text-black font-inter leading-7">
              {step === 'form'
                ? 'Create an account'
                : 'Verify Your Email'}
            </h2>

            <p className="mt-4 text-[16px] text-black font-poppins leading-6">
              {step === 'form'
                ? 'Enter your details below'
                : `We have sent a 6-digit code to ${formData.email}`}
            </p>

            {/* =========================
                ERROR
            ========================= */}

            {errorMessage && (
              <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm font-poppins">
                {errorMessage}
              </div>
            )}

            {step === 'form' ? (

              /* =========================
                 REGISTER FORM
              ========================= */

              <form
                onSubmit={handleRegister}
                className="mt-6 space-y-6"
                autoComplete="on"
              >
                <div>
                  <input
                    type="text"
                    name="name"
                    placeholder="Name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    minLength={2}
                    maxLength={100}
                    autoComplete="name"
                    className="w-full border-b pb-2 outline-none placeholder:text-gray-400 border-gray-300 focus:border-primary"
                  />
                </div>

                <div>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    autoComplete="email"
                    className="w-full border-b pb-2 outline-none placeholder:text-gray-400 border-gray-300 focus:border-primary"
                  />
                </div>

                <div className="relative">
                  <input
                    type={
                      showPassword
                        ? 'text'
                        : 'password'
                    }
                    name="password"
                    placeholder="Password (Min 8 characters)"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    className="w-full border-b pb-2 outline-none placeholder:text-gray-400 pr-10 border-gray-300 focus:border-primary"
                  />

                  <span
                    onClick={() =>
                      setShowPassword(
                        !showPassword
                      )
                    }
                    className="absolute right-0 top-1 cursor-pointer text-gray-500"
                  >
                    {showPassword ? (
                      <FiEye size={20} />
                    ) : (
                      <FiEyeOff size={20} />
                    )}
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="cursor-pointer w-full bg-primary text-white py-4 rounded hover:bg-secondary transition font-poppins flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Create Account'
                  )}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    googleLogin()
                  }
                  disabled={loading}
                  className="cursor-pointer text-[14px] md:text-[16px] w-full border hover:text-white border-secondary py-3 md:py-4 rounded flex items-center justify-center gap-3 hover:bg-secondary transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <FcGoogle size={22} />

                  Sign Up with Google
                </button>

                <p className="text-center text-gray-600">
                  Already have an account?{' '}
                  <Link
                    href="/login"
                    className="font-semibold text-secondary hover:text-primary transition-all underline"
                  >
                    Log in
                  </Link>
                </p>
              </form>

            ) : (

              /* =========================
                 OTP FORM
              ========================= */

              <form
                onSubmit={handleVerifyOTP}
                className="mt-6 space-y-8"
                autoComplete="off"
              >
                <div>
                  <input
                    type="text"
                    name="otp"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    placeholder="Enter 6-digit OTP"
                    value={formData.otp}
                    onChange={(e) => {
                      const value =
                        e.target.value
                          .replace(
                            /\D/g,
                            ''
                          )
                          .slice(0, 6);

                      setFormData({
                        ...formData,
                        otp: value,
                      });

                      if (errorMessage) {
                        setErrorMessage('');
                      }
                    }}
                    required
                    maxLength={6}
                    autoComplete="one-time-code"
                    className="w-full text-center tracking-widest text-2xl border-b-2 pb-2 outline-none border-primary"
                  />
                </div>

                <button
                  type="submit"
                  disabled={
                    loading ||
                    formData.otp.length !== 6
                  }
                  className="cursor-pointer w-full bg-primary text-white py-4 rounded hover:bg-secondary transition font-poppins flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Verify OTP & Register'
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStep('form');
                    setFormData((prev) => ({
                      ...prev,
                      otp: '',
                    }));
                    setErrorMessage('');
                  }}
                  className="w-full text-sm text-gray-500 hover:text-black"
                >
                  Back to registration
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SignUp;