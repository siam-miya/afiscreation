'use client'
import React, { useState } from 'react';
import Image from 'next/image';
import main_logo from "../../../../public/main-logo.jpg";
import Link from 'next/link';
import { FcGoogle } from 'react-icons/fc';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import API from '@/utils/api';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { toast } from 'react-toastify';

const Login = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
  
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [isForgotMode, setIsForgotMode] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotData, setForgotData] = useState({ email: '', otp: '', newPassword: '' });
  const [showNewPassword, setShowNewPassword] = useState(false);

  React.useEffect(() => {
    const storedUser = localStorage.getItem('user') || localStorage.getItem('adminUser');
    if (storedUser) {
      try {
        const u = JSON.parse(storedUser);
        if (u?.role === 'admin' || u?.role === 'moderator') {
          router.replace('/secret-admin-portal-afia/dashboard');
        }
      } catch (e) {}
    }
  }, [router]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errorMessage) setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      const response = await API.post('/auth/login', formData);
      if (response.data.success) {
        if (response.data.user) {
          const userRole = response.data.user.role;
          localStorage.setItem('user', JSON.stringify(response.data.user));
          if (userRole === 'admin' || userRole === 'moderator') {
            localStorage.setItem('adminUser', JSON.stringify(response.data.user));
          }
          if (response.data.token) {
            localStorage.setItem('token', response.data.token);
          }

          window.dispatchEvent(new Event('userStateChanged'));

          if (userRole === 'admin' || userRole === 'moderator') {
            toast.success('Admin login successful!');
            router.push('/secret-admin-portal-afia/dashboard');
          } else {
            router.push('/');
          }
          router.refresh();
        }
      }
    } catch (err) {
      const errorData = err.response?.data;
      setErrorMessage(errorData?.message || "Invalid credentials!");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);
    try {
      await API.post('/auth/forgot-password', { email: forgotData.email });
      toast.success("OTP sent to your email!");
      setForgotStep(2);
    } catch (err) {
      const errorData = err.response?.data;
      setErrorMessage(errorData?.message || "Failed to send reset code.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);
    try {
      const response = await API.post('/auth/reset-password', {
        email: forgotData.email,
        otp: forgotData.otp,
        resetCode: forgotData.otp, 
        newPassword: forgotData.newPassword,
      });

      if (response.data.success) {
        toast.success("Password reset successfully! Please log in.");
        setIsForgotMode(false);
        setForgotStep(1);
        setForgotData({ email: '', otp: '', newPassword: '' });
      }
    } catch (err) {
      const errorData = err.response?.data;
      setErrorMessage(errorData?.message || "Invalid OTP or failed to reset.");
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const userInfo = await axios.get(
          'https://www.googleapis.com/oauth2/v3/userinfo',
          { headers: { Authorization: `Bearer ${tokenResponse.access_token}` } }
        );
        const { name, email, picture, sub: googleId } = userInfo.data;
        const response = await API.post('/auth/google', { name, email, picture, googleId });

        if (response.data.success) {
          const serverUser = response.data.user || {};
          const userData = { ...serverUser, name: serverUser.name || name, email: serverUser.email || email };
          
          localStorage.setItem('user', JSON.stringify(userData));
          if (userData.role === 'admin' || userData.role === 'moderator') {
            localStorage.setItem('adminUser', JSON.stringify(userData));
          }
          if (response.data.token) {
            localStorage.setItem('token', response.data.token);
          }

          window.dispatchEvent(new Event('userStateChanged'));
          
          if (userData.role === 'admin' || userData.role === 'moderator') {
            toast.success('Admin login successful!');
            router.push('/secret-admin-portal-afia/dashboard');
          } else {
            router.push('/');
          }
          router.refresh();
        }
      } catch (err) {
        setErrorMessage("Google login failed!");
      }
    },
    onError: () => setErrorMessage("Google Sign In Failed"),
  });

  return (
    <section className="px-4 py-8 md:py-16">
      <div className="container mx-auto">
        <div className='flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-[50px]'>
          <div className='w-full lg:w-[950px] flex justify-center'>
            <Image src={main_logo} height={781} width={950} alt='logo' className="w-full max-w-[300px] md:max-w-[500px] lg:max-w-[950px] h-auto object-contain" />
          </div>
          
          <div className='w-full max-w-[500px]'>
            <h2 className="text-[28px] md:text-[36px] font-medium text-black font-inter leading-tight">
              {isForgotMode ? 'Reset Password' : <>Log in to <span className='text-primary'>Afis Creation</span></>}
            </h2>
            <p className="mt-2 md:mt-4 text-[14px] md:text-[16px] text-black font-poppins">
              {isForgotMode ? (forgotStep === 1 ? 'Enter your account email' : 'Enter OTP and new password') : 'Enter your details below'}
            </p>

            {errorMessage && (
              <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm font-poppins">
                {errorMessage}
              </div>
            )}

            {!isForgotMode ? (
              <form onSubmit={handleSubmit} className="mt-6 md:mt-6 space-y-5 md:space-y-6" autoComplete="on">
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
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    autoComplete="current-password"
                    className="w-full border-b pb-2 outline-none text-[14px] md:text-[16px] placeholder:text-gray-500 pr-10 bg-transparent border-gray-300 focus:border-primary"
                  />
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-1 cursor-pointer text-gray-500"
                  >
                    {showPassword ? <FiEye size={20} /> : <FiEyeOff size={20} />}
                  </span>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => { setIsForgotMode(true); setErrorMessage(''); setForgotData({ email: '', otp: '', newPassword: '' }); setForgotStep(1); }}
                    className="text-xs md:text-sm text-primary hover:underline cursor-pointer"
                  >
                    Forget Password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="cursor-pointer text-[14px] md:text-[16px] w-full bg-primary text-white py-3 md:py-4 rounded hover:bg-secondary font-poppins transition flex items-center justify-center"
                >
                  {loading ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    "Log In"
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => googleLogin()}
                  className="cursor-pointer text-[14px] md:text-[16px] w-full border hover:text-white border-secondary py-3 md:py-4 rounded flex items-center justify-center gap-3 hover:bg-secondary transition"
                >
                  <FcGoogle size={22} />
                  Sign In with Google
                </button>

                <p className="text-center text-gray-600 text-sm md:text-base mt-4">
                  Don't have an account?{" "}
                  <Link href={"/signup"} className="font-semibold text-secondary hover:text-primary transition-all underline">
                    Sign Up
                  </Link>
                </p>
              </form>
            ) : (
              <div className="mt-6 md:mt-6">
                {forgotStep === 1 ? (
                  <form onSubmit={handleRequestOTP} className="space-y-5" autoComplete="off">
                    <div>
                      <input
                        type="email"
                        placeholder="Enter registered email"
                        value={forgotData.email}
                        onChange={(e) => {
                          setForgotData({ ...forgotData, email: e.target.value });
                          if (errorMessage) setErrorMessage('');
                        }}
                        required
                        autoComplete="off"
                        className="w-full border-b pb-2 outline-none text-[14px] md:text-[16px] bg-transparent border-gray-300 focus:border-primary"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-primary text-white py-3 rounded hover:bg-secondary transition flex items-center justify-center"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        "Send Reset Code"
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setIsForgotMode(false); setErrorMessage(''); }}
                      className="w-full text-center text-sm text-gray-500 hover:text-black mt-2"
                    >
                      Back to Login
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleResetPassword} className="space-y-5" autoComplete="off">
                    <div className="border-b border-gray-300 pb-2">
                      <span className="text-xs text-gray-400 block">Email Address</span>
                      <span className="text-[14px] md:text-[16px] text-gray-700 font-medium">{forgotData.email}</span>
                    </div>

                    <div>
                      <input
                        type="text"
                        placeholder="Enter 6-digit OTP"
                        value={forgotData.otp}
                        onChange={(e) => {
                          setForgotData({ ...forgotData, otp: e.target.value });
                          if (errorMessage) setErrorMessage('');
                        }}
                        required
                        maxLength={6}
                        autoComplete="one-time-code"
                        className="w-full text-center tracking-widest text-xl border-b-2 pb-2 outline-none bg-transparent border-primary"
                      />
                    </div>
                    
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        placeholder="New Password (min 6 chars)"
                        value={forgotData.newPassword}
                        onChange={(e) => {
                          setForgotData({ ...forgotData, newPassword: e.target.value });
                          if (errorMessage) setErrorMessage('');
                        }}
                        required
                        minLength={6}
                        autoComplete="new-password"
                        className="w-full border-b pb-2 outline-none text-[14px] md:text-[16px] pr-10 bg-transparent border-gray-300 focus:border-primary"
                      />
                      <span
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-0 top-1 cursor-pointer text-gray-500"
                      >
                        {showNewPassword ? <FiEye size={20} /> : <FiEyeOff size={20} />}
                      </span>
                    </div>
                    
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-primary text-white py-3 rounded hover:bg-secondary transition flex items-center justify-center"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        "Update Password"
                      )}
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