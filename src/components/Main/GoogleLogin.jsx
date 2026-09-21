import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const GoogleLogin = () => {
    const navigate = useNavigate();

    useEffect(() => {
        /* global google */
        if (window.google) {
            google.accounts.id.initialize({
                client_id: "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com", // তোমার গুগল ক্লায়েন্ট আইডি এখানে বসাও
                callback: handleCredentialResponse
            });

            google.accounts.id.renderButton(
                document.getElementById("google-signin-btn"),
                { theme: "outline", size: "large", width: "100%" } // বাটনের ডিজাইন
            );
        }
    }, []);

    const handleCredentialResponse = async (response) => {
        try {
            // গুগল থেকে পাওয়া টোকেন ব্যাকএন্ডে পাঠাচ্ছি ভেরিফাই করার জন্য
            const res = await fetch('http://localhost:5000/api/auth/google', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token: response.credential }),
            });

            const data = await res.json();
            
            if (res.ok) {
                // ইউজারের তথ্য ও টোকেন লোকালস্টোরেজে সেভ করছি
                localStorage.setItem('user', JSON.stringify(data.user));
                localStorage.setItem('token', data.token);
                
                // হোমপেজে বা ড্যাশবোর্ডে রিডাইরেক্ট করো
                navigate('/');
                window.location.reload(); // Navbar আপডেট হওয়ার জন্য রিলোড দিতে পারো
            } else {
                console.eror(data.message);
            }
        } catch (error) {
            console.error("Login failed", error);
        }
    };

    return (
        <div className="w-full max-w-sm mx-auto p-4">
            <div id="google-signin-btn" className="flex justify-center"></div>
        </div>
    );
};

export default GoogleLogin;