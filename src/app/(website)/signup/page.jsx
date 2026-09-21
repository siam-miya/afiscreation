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

const SignUp = () => {
  const router = useRouter();
  const [step, setStep] = useState('form');
  const [formData, setFormData] = useState({ name: '', email: '', password: '', otp: '' });
  
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errorMessage) setErrorMessage('');
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      const response = await API.post('/auth/register', formData);
      if (response.data.success) {
        setStep('otp');
      }
    } catch (err) {
      const errorData = err.response?.data;
      setErrorMessage(errorData?.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      const response = await API.post('/auth/verify-otp', {
        email: formData.email,
        otp: formData.otp,
      });
      
      if (response.data.success) {
        const serverUser = response.data.user || {};
        const userData = {
          ...serverUser,
          name: serverUser.name || formData.name,
          email: serverUser.email || formData.email,
        };
        
        // LocalStorage-এ ইউজার ডাটা এবং টোকেন সেভ
        localStorage.setItem('user', JSON.stringify(userData));
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
        }

        window.dispatchEvent(new Event('userStateChanged'));
        router.push('/');
        router.refresh();
      }
    } catch (err) {
      const errorData = err.response?.data;
      setErrorMessage(errorData?.message || "Invalid OTP!");
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

        if (response.data.success || response.status === 200) {
          const serverUser = response.data.user || {};
          const userData = { ...serverUser, name: serverUser.name || name, email: serverUser.email || email };
          
          localStorage.setItem('user', JSON.stringify(userData));
          if (response.data.token) {
            localStorage.setItem('token', response.data.token);
          }

          window.dispatchEvent(new Event('userStateChanged'));
          router.push('/');
          router.refresh();
        }
      } catch (err) {
        setErrorMessage("Google authentication failed!");
      }
    },
    onError: () => setErrorMessage("Google Sign Up Failed"),
  });

  return (
    <section className="px-5">
      <div className="container mx-auto">
        <div className='flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-[50px] py-10'>
          <div className='w-full lg:w-[950px] flex justify-center'>
            <Image src={main_logo} height={781} width={950} alt='logo' className="w-full h-auto object-contain" />
          </div>
          
          <div className='w-full max-w-[500px]'>
            <h2 className="text-[36px] font-medium text-black font-inter leading-7">
              {step === 'form' ? 'Create an account' : 'Verify Your Email'}
            </h2>
            <p className="mt-4 text-[16px] text-black font-poppins leading-6">
              {step === 'form' ? 'Enter your details below' : `We have sent a 6-digit code to ${formData.email}`}
            </p>

            {errorMessage && (
              <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm font-poppins">
                {errorMessage}
              </div>
            )}

            {step === 'form' ? (
              <form onSubmit={handleRegister} className="mt-6 space-y-6">
                <div>
                  <input
                    type="text"
                    name="name"
                    placeholder="Name"
                    value={formData.name}
                    onChange={handleChange}
                    required
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
                    className="w-full border-b pb-2 outline-none placeholder:text-gray-400 border-gray-300 focus:border-primary"
                  />
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Password (Min 6 characters)"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                    className="w-full border-b pb-2 outline-none placeholder:text-gray-400 pr-10 border-gray-300 focus:border-primary"
                  />
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-1 cursor-pointer text-gray-500"
                  >
                    {showPassword ? <FiEye size={20} /> : <FiEyeOff size={20} />}
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="cursor-pointer w-full bg-primary text-white py-4 rounded hover:bg-secondary transition font-poppins flex items-center justify-center"
                >
                  {loading ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    "Create Account"
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => googleLogin()}
                  className="cursor-pointer text-[14px] md:text-[16px] w-full border hover:text-white border-secondary py-3 md:py-4 rounded flex items-center justify-center gap-3 hover:bg-secondary transition"
                >
                  <FcGoogle size={22} />
                  Sign Up with Google
                </button>
                
                <p className="text-center text-gray-600">
                  Already have an account?{" "}
                  <Link href={"/login"} className="font-semibold text-secondary hover:text-primary transition-all underline">
                    Log in
                  </Link>
                </p>
              </form>
            ) : (
              <form onSubmit={handleVerifyOTP} className="mt-6 space-y-8">
                <div>
                  <input
                    type="text"
                    name="otp"
                    placeholder="Enter 6-digit OTP"
                    value={formData.otp}
                    onChange={handleChange}
                    required
                    maxLength={6}
                    className="w-full text-center tracking-widest text-2xl border-b-2 pb-2 outline-none border-primary"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="cursor-pointer w-full bg-primary text-white py-4 rounded hover:bg-secondary transition font-poppins flex items-center justify-center"
                >
                  {loading ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    "Verify OTP & Register"
                  )}
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