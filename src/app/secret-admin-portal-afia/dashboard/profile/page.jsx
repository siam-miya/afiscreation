'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiUser, FiLock, FiMail, FiMapPin, FiSave, FiLogOut, FiEye, FiEyeOff, FiUpload } from 'react-icons/fi';
import { toast } from 'react-toastify';

const AdminProfilePage = () => {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(false);
    
    // Password visibility toggles
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Admin state
    const [admin, setAdmin] = useState({
        name: '',
        email: '',
        address: '',
        role: 'Super Admin',
        avatar: ''
    });

    // Password state
    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        const storedAdmin = localStorage.getItem('adminUser') || localStorage.getItem('user');
        if (storedAdmin) {
            try {
                const parsed = JSON.parse(storedAdmin);
                setAdmin({
                    name: parsed.name || '',
                    email: parsed.email || '',
                    address: parsed.address || '',
                    role: parsed.role || 'Super Admin',
                    avatar: parsed.picture || parsed.avatar || parsed.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500'
                });
            } catch (err) {
                console.error("Failed to parse admin data", err);
            }
        }
    }, []);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                toast.error("Image size should be less than 2MB");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setAdmin(prev => ({ ...prev, avatar: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleProfileUpdate = (e) => {
        e.preventDefault();
        localStorage.setItem('adminUser', JSON.stringify(admin));
        localStorage.setItem('user', JSON.stringify(admin));
        toast.success("Profile updated successfully!");
        window.dispatchEvent(new Event('userLogin'));
    };

    // ব্যাকএন্ডে API কলের মাধ্যমে পাসওয়ার্ড আপডেট হ্যান্ডলার
    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        
        if (passwords.newPassword !== passwords.confirmPassword) {
            toast.error("New password and confirm password do not match!");
            return;
        }
        if (passwords.newPassword.length < 6) {
            toast.error("New password must be at least 6 characters long!");
            return;
        }

        try {
            setLoading(true);
            const response = await fetch('http://localhost:5000/api/v1/auth/change-password', { 
                method: 'PUT', 
                headers: { 
                    'Content-Type': 'application/json', 
                }, 
                credentials: 'include', 
                body: JSON.stringify({ 
                    currentPassword: passwords.currentPassword, 
                    newPassword: passwords.newPassword 
                }), 
            }); 
 
            const data = await response.json(); 
 
            if (response.ok && data.success) { 
                toast.success(data.message || "Password changed successfully!"); 
                setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' }); 
            } else { 
                toast.error(data.message || "Failed to update password!"); 
            } 
        } catch (error) { 
            console.error("Error updating password:", error); 
            toast.error("Something went wrong. Please check your connection!"); 
        } finally { 
            setLoading(false); 
        } 
    }; 
 
    const handleLogout = () => { 
        localStorage.removeItem('adminUser'); 
        localStorage.removeItem('user'); 
        toast.success("Logged out successfully!"); 
        router.push('/secret-admin-portal-afia/login'); 
    }; 
 
    return ( 
        <div className="max-w-5xl mx-auto font-poppins pb-10"> 
 
            {/* Facebook Style Profile Header */} 
            <div className="bg-white dark:bg-slate-900 rounded-b-2xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden"> 
 
                {/* Cover Photo */} 
                <div className="relative h-48 md:h-64 bg-gradient-to-r from-[#eb6e1b] via-orange-400 to-[#f59e0b]"> 
                    <div className="absolute inset-0 bg-black/10"></div> 
                </div> 
 
                {/* Profile Information */} 
                <div className="relative px-5 md:px-8 pb-5"> 
 
                    {/* Profile Photo + Upload Button */} 
                    <div className="relative -mt-16 md:-mt-20 w-32 h-32 md:w-40 md:h-40"> 
                        
                        <div className="w-full h-full rounded-full border-4 border-white dark:border-slate-900 shadow-xl overflow-hidden bg-gray-100 dark:bg-slate-800"> 
                            <img 
                                src={admin.avatar} 
                                alt="Admin" 
                                className="w-full h-full object-cover" 
                            /> 
                        </div> 
 
                        <label 
                            title="Change profile picture" 
                            className="absolute bottom-1 right-1 md:bottom-2 md:right-2 w-9 h-9 md:w-10 md:h-10 flex items-center justify-center bg-white dark:bg-slate-800 text-gray-700 dark:text-white border border-gray-200 dark:border-slate-700 rounded-full shadow-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700 transition-all" 
                        > 
                            <FiUpload size={18} /> 
 
                            <input 
                                type="file" 
                                accept="image/*" 
                                onChange={handleImageChange} 
                                className="hidden" 
                            /> 
                        </label> 
 
                    </div> 
 
                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mt-3"> 
 
                        <div> 
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white"> 
                                {admin.name || 'Admin User'} 
                            </h1> 
 
                            <div className="flex flex-wrap items-center gap-2 mt-2"> 
                                <span className="text-xs font-semibold bg-orange-100 dark:bg-orange-500/10 text-[#eb6e1b] px-3 py-1 rounded-full"> 
                                    {admin.role} 
                                </span> 
 
                                {admin.email && ( 
                                    <span className="text-sm text-gray-500 dark:text-slate-400 flex items-center gap-1"> 
                                        <FiMail size={14} /> 
                                        {admin.email} 
                                    </span> 
                                )} 
                            </div> 
 
                            {admin.address && ( 
                                <div className="flex items-center gap-1 mt-2 text-sm text-gray-500 dark:text-slate-400"> 
                                    <FiMapPin size={14} /> 
                                    <span>{admin.address}</span> 
                                </div> 
                            )} 
                        </div> 
 
                        <button 
                            onClick={handleLogout} 
                            className="w-fit flex items-center gap-2 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-red-600 hover:text-white transition-all cursor-pointer" 
                        > 
                            <FiLogOut size={18} /> 
                            <span>Logout Admin</span> 
                        </button> 
 
                    </div> 
                </div> 
            </div> 
 
            {/* Profile Tabs */} 
            <div className="bg-white dark:bg-slate-900 mt-4 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 px-5 md:px-8"> 
 
                <div className="flex gap-6 overflow-x-auto"> 
 
                    <button 
                        onClick={() => setActiveTab('profile')} 
                        className={`py-4 text-sm font-semibold transition-all border-b-2 cursor-pointer flex items-center gap-2 whitespace-nowrap ${ 
                            activeTab === 'profile' 
                                ? 'border-[#eb6e1b] text-[#eb6e1b]' 
                                : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-white' 
                        }`} 
                    > 
                        <FiUser size={16} /> 
                        <span>Profile Information</span> 
                    </button> 
 
                    <button 
                        onClick={() => setActiveTab('security')} 
                        className={`py-4 text-sm font-semibold transition-all border-b-2 cursor-pointer flex items-center gap-2 whitespace-nowrap ${ 
                            activeTab === 'security' 
                                ? 'border-[#eb6e1b] text-[#eb6e1b]' 
                                : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-white' 
                        }`} 
                    > 
                        <FiLock size={16} /> 
                        <span>Login & Security</span> 
                    </button> 
 
                </div> 
            </div> 
 
            {/* Profile Information */} 
            {activeTab === 'profile' && ( 
                <div className="bg-white dark:bg-slate-900 mt-4 p-5 md:p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800"> 
 
                    <div className="mb-6"> 
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white"> 
                            Edit Personal Details 
                        </h2> 
                        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1"> 
                            Manage your profile information and account details. 
                        </p> 
                    </div> 
 
                    <form onSubmit={handleProfileUpdate} className="space-y-5"> 
 
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5"> 
 
                            <div> 
                                <label className="block text-xs font-semibold text-gray-600 dark:text-slate-300 mb-2"> 
                                    Full Name 
                                </label> 
 
                                <div className="relative"> 
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"> 
                                        <FiUser size={18} /> 
                                    </span> 
 
                                    <input 
                                        type="text" 
                                        value={admin.name} 
                                        onChange={(e) => setAdmin({ ...admin, name: e.target.value })} 
                                        className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-sm text-gray-800 dark:text-white rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-[#eb6e1b]" 
                                        required 
                                    /> 
                                </div> 
                            </div> 
 
                            <div> 
                                <label className="block text-xs font-semibold text-gray-600 dark:text-slate-300 mb-2"> 
                                    Email Address 
                                </label> 
 
                                <div className="relative"> 
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"> 
                                        <FiMail size={18} /> 
                                    </span> 
 
                                    <input 
                                        type="email" 
                                        value={admin.email} 
                                        disabled 
                                        className="w-full bg-gray-100 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 text-sm text-gray-500 dark:text-slate-400 rounded-xl pl-10 pr-4 py-3 cursor-not-allowed" 
                                    /> 
                                </div> 
                            </div> 
 
                            <div> 
                                <label className="block text-xs font-semibold text-gray-600 dark:text-slate-300 mb-2"> 
                                    Address 
                                </label> 
 
                                <div className="relative"> 
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"> 
                                        <FiMapPin size={18} /> 
                                    </span> 
 
                                    <input 
                                        type="text" 
                                        placeholder="Enter your address" 
                                        value={admin.address} 
                                        onChange={(e) => setAdmin({ ...admin, address: e.target.value })} 
                                        className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-sm text-gray-800 dark:text-white rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-[#eb6e1b]" 
                                    /> 
                                </div> 
                            </div> 
 
                        </div> 
 
                        <div className="pt-4 flex justify-end"> 
                            <button 
                                type="submit" 
                                className="flex items-center gap-2 bg-[#eb6e1b] text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-black transition-all cursor-pointer shadow-md" 
                            > 
                                <FiSave size={18} /> 
                                <span>Save Changes</span> 
                            </button> 
                        </div> 
 
                    </form> 
                </div> 
            )} 
 
            {/* Security */} 
            {activeTab === 'security' && ( 
                <div className="bg-white dark:bg-slate-900 mt-4 p-5 md:p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800"> 
 
                    <div className="mb-6"> 
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white"> 
                            Change Password 
                        </h2> 
 
                        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1"> 
                            Secure your account by updating your password regularly. 
                        </p> 
                    </div> 
                     
                    <form onSubmit={handlePasswordUpdate} className="space-y-5 max-w-xl"> 
 
                        <div> 
                            <label className="block text-xs font-semibold text-gray-600 dark:text-slate-300 mb-2"> 
                                Current Password 
                            </label> 
 
                            <div className="relative"> 
                                <input 
                                    type={showCurrentPassword ? "text" : "password"} 
                                    placeholder="Enter current password" 
                                    value={passwords.currentPassword} 
                                    onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })} 
                                    className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-sm text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 rounded-xl px-4 py-3 pr-10 focus:outline-none focus:border-[#eb6e1b]" 
                                    required 
                                /> 
 
                                <button 
                                    type="button" 
                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)} 
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 cursor-pointer" 
                                > 
                                    {showCurrentPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />} 
                                </button> 
                            </div> 
                        </div> 
 
                        <div> 
                            <label className="block text-xs font-semibold text-gray-600 dark:text-slate-300 mb-2"> 
                                New Password 
                            </label> 
 
                            <div className="relative"> 
                                <input 
                                    type={showNewPassword ? "text" : "password"} 
                                    placeholder="Enter new password" 
                                    value={passwords.newPassword} 
                                    onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} 
                                    className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-sm text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 rounded-xl px-4 py-3 pr-10 focus:outline-none focus:border-[#eb6e1b]" 
                                    required 
                                /> 
 
                                <button 
                                    type="button" 
                                    onClick={() => setShowNewPassword(!showNewPassword)} 
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 cursor-pointer" 
                                > 
                                    {showNewPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />} 
                                </button> 
                            </div> 
                        </div> 
 
                        <div> 
                            <label className="block text-xs font-semibold text-gray-600 dark:text-slate-300 mb-2"> 
                                Confirm New Password 
                            </label> 
 
                            <div className="relative"> 
                                <input 
                                    type={showConfirmPassword ? "text" : "password"} 
                                    placeholder="Confirm new password" 
                                    value={passwords.confirmPassword} 
                                    onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })} 
                                    className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-sm text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 rounded-xl px-4 py-3 pr-10 focus:outline-none focus:border-[#eb6e1b]" 
                                    required 
                                /> 
 
                                <button 
                                    type="button" 
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 cursor-pointer" 
                                > 
                                    {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />} 
                                </button> 
                            </div> 
                        </div> 
 
                        <div className="pt-4"> 
                            <button  
                                type="submit"  
                                disabled={loading} 
                                className="flex items-center gap-2 bg-[#eb6e1b] text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-black transition-all cursor-pointer shadow-md disabled:opacity-50" 
                            > 
                                <FiLock size={18} /> 
                                <span>{loading ? "Updating..." : "Update Password"}</span> 
                            </button> 
                        </div> 
 
                    </form> 
                </div> 
            )} 
        </div> 
    ); 
}; 
 
export default AdminProfilePage;