'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import main_logo from '../../../../public/main-logo.jpg';
import Link from 'next/link';
import { FcGoogle } from 'react-icons/fc';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import API from '@/utils/api';
import { useGoogleLogin } from '@react-oauth/google';
import { toast } from 'react-toastify';

const Login = () => {
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [isForgotMode, setIsForgotMode] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);

  const [forgotData, setForgotData] = useState({
    email: '',
    otp: '',
    newPassword: '',
  });

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  /* =========================
     CHECK EXISTING USER
  ========================= */

  useEffect(() => {
    const storedUser =
      localStorage.getItem('user') ||
      localStorage.getItem('adminUser');

    if (!storedUser) return;

    try {
      const user = JSON.parse(storedUser);

      if (
        user?.role === 'admin' ||
        user?.role === 'moderator'
      ) {
        router.replace(
          '/secret-admin-portal-afia/dashboard'
        );
      }
    } catch {
      localStorage.removeItem('user');
      localStorage.removeItem('adminUser');
    }
  }, [router]);

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
     NORMAL LOGIN
  ========================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    setErrorMessage('');
    setLoading(true);

    try {
      const response = await API.post(
        '/auth/login',
        {
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
        }
      );

      if (response.data.success) {
        const userData = response.data.user;

        if (!userData) {
          throw new Error(
            'User information was not returned.'
          );
        }

        // Store ONLY user information.
        // JWT is stored in HttpOnly cookie by backend.
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
          localStorage.removeItem('adminUser');
        }

        // Remove any old JWT from previous auth system
        localStorage.removeItem('token');
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUserToken');

        window.dispatchEvent(
          new Event('userStateChanged')
        );

        if (
          userData.role === 'admin' ||
          userData.role === 'moderator'
        ) {
          toast.success(
            'Admin login successful!'
          );

          router.push(
            '/secret-admin-portal-afia/dashboard'
          );
        } else {
          router.push('/');
        }

        router.refresh();
      }
    } catch (err) {
      const message =
        err.response?.data?.message ||
        'Invalid email or password.';

      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     FORGOT PASSWORD - REQUEST OTP
  ========================= */

  const handleRequestOTP = async (e) => {
    e.preventDefault();

    setErrorMessage('');
    setLoading(true);

    try {
      const email =
        forgotData.email.trim().toLowerCase();

      if (!email) {
        setErrorMessage(
          'Please enter your email address.'
        );
        return;
      }

      await API.post(
        '/auth/forgot-password',
        {
          email,
        }
      );

      setForgotData((prev) => ({
        ...prev,
        email,
      }));

      toast.success(
        'If the account exists, a reset code has been sent to your email.'
      );

      setForgotStep(2);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        'Failed to send reset code.';

      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     RESET PASSWORD
  ========================= */

  const handleResetPassword = async (e) => {
    e.preventDefault();

    setErrorMessage('');
    setLoading(true);

    try {
      const email =
        forgotData.email.trim().toLowerCase();

      const otp =
        forgotData.otp.trim();

      const newPassword =
        forgotData.newPassword;

      if (!/^\d{6}$/.test(otp)) {
        setErrorMessage(
          'Please enter a valid 6-digit OTP.'
        );
        return;
      }

      if (newPassword.length < 8) {
        setErrorMessage(
          'New password must contain at least 8 characters.'
        );
        return;
      }

      const response = await API.post(
        '/auth/reset-password',
        {
          email,
          resetCode: otp,
          newPassword,
        }
      );

      if (response.data.success) {
        toast.success(
          'Password reset successfully! Please log in.'
        );

        setIsForgotMode(false);
        setForgotStep(1);

        setForgotData({
          email: '',
          otp: '',
          newPassword: '',
        });

        setFormData({
          email,
          password: '',
        });

        setShowNewPassword(false);
      }
    } catch (err) {
      const message =
        err.response?.data?.message ||
        'Invalid OTP or password reset failed.';

      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     GOOGLE LOGIN
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

        const response = await API.post(
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
          localStorage.removeItem('adminToken');
          localStorage.removeItem(
            'adminUserToken'
          );

          window.dispatchEvent(
            new Event('userStateChanged')
          );

          if (
            userData.role === 'admin' ||
            userData.role === 'moderator'
          ) {
            toast.success(
              'Admin login successful!'
            );

            router.push(
              '/secret-admin-portal-afia/dashboard'
            );
          } else {
            toast.success(
              'Google login successful!'
            );

            router.push('/');
          }

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
        'Google Sign In Failed. Please try again.'
      );
    },
  });

  /* =========================
     FORGOT MODE RESET
  ========================= */

  const openForgotMode = () => {
    setIsForgotMode(true);
    setForgotStep(1);

    setErrorMessage('');

    setForgotData({
      email: formData.email || '',
      otp: '',
      newPassword: '',
    });
  };

  const closeForgotMode = () => {
    setIsForgotMode(false);
    setForgotStep(1);
    setErrorMessage('');

    setForgotData({
      email: '',
      otp: '',
      newPassword: '',
    });
  };

  return (
    <section className="px-4 py-8 md:py-16">
      <div className="container mx-auto">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-[50px]">

          {/* =========================
              LOGO
          ========================= */}

          <div className="w-full lg:w-[950px] flex justify-center">
            <Image
              src={main_logo}
              height={781}
              width={950}
              alt="Afis Creation"
              className="w-full max-w-[300px] md:max-w-[500px] lg:max-w-[950px] h-auto object-contain"
              priority
            />
          </div>

          {/* =========================
              FORM AREA
          ========================= */}

          <div className="w-full max-w-[500px]">

            <h2 className="text-[28px] md:text-[36px] font-medium text-black font-inter leading-tight">
              {isForgotMode ? (
                'Reset Password'
              ) : (
                <>
                  Log in to{' '}
                  <span className="text-primary">
                    Afis Creation
                  </span>
                </>
              )}
            </h2>

            <p className="mt-2 md:mt-4 text-[14px] md:text-[16px] text-black font-poppins">
              {isForgotMode
                ? forgotStep === 1
                  ? 'Enter your account email'
                  : 'Enter OTP and your new password'
                : 'Enter your details below'}
            </p>

            {/* =========================
                ERROR
            ========================= */}

            {errorMessage && (
              <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm font-poppins">
                {errorMessage}
              </div>
            )}

            {!isForgotMode ? (

              /* =========================
                 LOGIN FORM
              ========================= */

              <form
                onSubmit={handleSubmit}
                className="mt-6 space-y-5 md:space-y-6"
                autoComplete="on"
              >
                <div>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    autoComplete="email"
                    className="w-full border-b pb-2 outline-none text-[14px] md:text-[16px] placeholder:text-gray-500 bg-transparent border-gray-300 focus:border-primary"
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
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    autoComplete="current-password"
                    className="w-full border-b pb-2 outline-none text-[14px] md:text-[16px] placeholder:text-gray-500 pr-10 bg-transparent border-gray-300 focus:border-primary"
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

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={openForgotMode}
                    className="text-xs md:text-sm text-primary hover:underline cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="cursor-pointer text-[14px] md:text-[16px] w-full bg-primary text-white py-3 md:py-4 rounded hover:bg-secondary font-poppins transition flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Log In'
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => googleLogin()}
                  disabled={loading}
                  className="cursor-pointer text-[14px] md:text-[16px] w-full border hover:text-white border-secondary py-3 md:py-4 rounded flex items-center justify-center gap-3 hover:bg-secondary transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <FcGoogle size={22} />

                  Sign In with Google
                </button>

                <p className="text-center text-gray-600 text-sm md:text-base mt-4">
                  Don't have an account?{' '}
                  <Link
                    href="/signup"
                    className="font-semibold text-secondary hover:text-primary transition-all underline"
                  >
                    Sign Up
                  </Link>
                </p>
              </form>

            ) : (

              /* =========================
                 FORGOT PASSWORD
              ========================= */

              <div className="mt-6">

                {forgotStep === 1 ? (

                  <form
                    onSubmit={handleRequestOTP}
                    className="space-y-5"
                    autoComplete="off"
                  >
                    <div>
                      <input
                        type="email"
                        placeholder="Enter registered email"
                        value={forgotData.email}
                        onChange={(e) => {
                          setForgotData({
                            ...forgotData,
                            email:
                              e.target.value,
                          });

                          if (errorMessage) {
                            setErrorMessage('');
                          }
                        }}
                        required
                        autoComplete="email"
                        className="w-full border-b pb-2 outline-none text-[14px] md:text-[16px] bg-transparent border-gray-300 focus:border-primary"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-primary text-white py-3 rounded hover:bg-secondary transition flex items-center justify-center disabled:opacity-60"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        'Send Reset Code'
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={closeForgotMode}
                      className="w-full text-center text-sm text-gray-500 hover:text-black mt-2"
                    >
                      Back to Login
                    </button>
                  </form>

                ) : (

                  <form
                    onSubmit={handleResetPassword}
                    className="space-y-5"
                    autoComplete="off"
                  >
                    <div className="border-b border-gray-300 pb-2">
                      <span className="text-xs text-gray-400 block">
                        Email Address
                      </span>

                      <span className="text-[14px] md:text-[16px] text-gray-700 font-medium">
                        {forgotData.email}
                      </span>
                    </div>

                    <div>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]{6}"
                        placeholder="Enter 6-digit OTP"
                        value={forgotData.otp}
                        onChange={(e) => {
                          const value =
                            e.target.value
                              .replace(
                                /\D/g,
                                ''
                              )
                              .slice(0, 6);

                          setForgotData({
                            ...forgotData,
                            otp: value,
                          });

                          if (errorMessage) {
                            setErrorMessage('');
                          }
                        }}
                        required
                        maxLength={6}
                        autoComplete="one-time-code"
                        className="w-full text-center tracking-widest text-xl border-b-2 pb-2 outline-none bg-transparent border-primary"
                      />
                    </div>

                    <div className="relative">
                      <input
                        type={
                          showNewPassword
                            ? 'text'
                            : 'password'
                        }
                        placeholder="New Password (min 8 chars)"
                        value={
                          forgotData.newPassword
                        }
                        onChange={(e) => {
                          setForgotData({
                            ...forgotData,
                            newPassword:
                              e.target.value,
                          });

                          if (errorMessage) {
                            setErrorMessage('');
                          }
                        }}
                        required
                        minLength={8}
                        autoComplete="new-password"
                        className="w-full border-b pb-2 outline-none text-[14px] md:text-[16px] pr-10 bg-transparent border-gray-300 focus:border-primary"
                      />

                      <span
                        onClick={() =>
                          setShowNewPassword(
                            !showNewPassword
                          )
                        }
                        className="absolute right-0 top-1 cursor-pointer text-gray-500"
                      >
                        {showNewPassword ? (
                          <FiEye size={20} />
                        ) : (
                          <FiEyeOff size={20} />
                        )}
                      </span>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-primary text-white py-3 rounded hover:bg-secondary transition flex items-center justify-center disabled:opacity-60"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        'Update Password'
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setForgotStep(1);
                        setErrorMessage('');
                      }}
                      className="w-full text-center text-sm text-gray-500 hover:text-black"
                    >
                      Use another email
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Login;