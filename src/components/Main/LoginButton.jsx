'use client';

import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

const LoginButton = () => {
    const router = useRouter();

    const handleSuccess = async (credentialResponse) => {
        try {
            const res = await fetch('http://localhost:5000/api/auth/google', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token: credentialResponse.credential }),
            });

            const data = await res.json();

            if (res.ok) {
                // ইউজারের তথ্য লোকালস্টোরেজে সেভ করা
                localStorage.setItem('user', JSON.stringify({
                    name: data.user?.name || '',
                    email: data.user?.email || '',
                    photoURL: data.user?.photoURL || ''
                }));
                localStorage.setItem('token', data.token);

                // এখানে সাকসেস টোস্ট মেসেজ দেওয়া হলো
                toast.success("Account created & logged in successfully!");

                // একটু ডিলে দিয়ে হোমপেজে পাঠানো যাতে টোস্ট মেসেজটা ইউজার দেখতে পায়
                setTimeout(() => {
                    router.push('/');
                    window.location.reload();
                }, 1000);

            } else {
                toast.error(data.message || "Login failed!");
            }
        } catch (error) {
            console.error("Login error:", error);
            toast.error("Something went wrong!");
        }
    };

    return (
        <div className="flex justify-center w-full">
            <GoogleLogin
                onSuccess={handleSuccess}
                onError={() => {
                    toast.error('Google Login Failed!');
                }}
                useOneTap
            />
        </div>
    );
};

export default LoginButton;