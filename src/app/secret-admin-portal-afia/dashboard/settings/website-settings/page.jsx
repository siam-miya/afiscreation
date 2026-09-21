"use client"

import React, { useState, useEffect } from "react"
import axios from "axios"

const tabs = [
    "Floating Contact",
    "General",
    "Top Bar",
    "Footer",
    "Social Links",
    "SEO"
]

export default function SiteSettings() {
    const [activeTab, setActiveTab] = useState("Floating Contact")
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)

    const [message, setMessage] = useState("")
    const [errorMessage, setErrorMessage] = useState("")

    // All Settings State
    const [settings, setSettings] = useState({
        // Floating Contact
        enableFloatingHub: true,
        enableWhatsapp: true,
        whatsappNumber: "",
        enableMessenger: true,
        messengerUsername: "",
        enablePhoneCall: true,
        phoneNumber: "",
        enableEmail: true,
        supportEmail: "",

        // General
        siteName: "",
        siteTagline: "",
        logo: "",
        favicon: "",

        // Top Bar
        topbarEnabled: true,
        topbarPhone: "",
        topbarText: "",

        // Footer
        footerAddress: "",
        footerPhone: "",
        footerPhone2: "",
        footerEmail: "",
        footerCopyright: "",

        // Social Links
        facebook: "",
        instagram: "",
        youtube: "",

        // SEO
        metaTitle: "",
        metaDescription: "",
        googleAnalyticsId: "",
        facebookPixelId: ""
    })

    // Fetch settings on mount
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                setLoading(true)

                const apiUrl =
                    process.env.NEXT_PUBLIC_API_URL ||
                    "http://localhost:5000"

                const res =
                    await axios.get(
                        `${apiUrl}/api/settings`
                    )

                if (
                    res.data &&
                    res.data.success &&
                    res.data.data
                ) {
                    setSettings(prev => ({
                        ...prev,
                        ...res.data.data
                    }))
                }

            } catch (error) {

                console.error(
                    "Error fetching settings:",
                    error
                )

                setErrorMessage(
                    error.response?.data?.message ||
                    "Failed to load settings."
                )

            } finally {

                setLoading(false)

            }
        }

        fetchSettings()
    }, [])

    // Handle input change
    const handleChange = (e) => {

        const {
            name,
            value,
            type,
            checked,
            files
        } = e.target

        if (type === "file") {

            setSettings(prev => ({
                ...prev,
                [name]:
                    files && files[0]
                        ? files[0]
                        : ""
            }))

        } else {

            setSettings(prev => ({
                ...prev,
                [name]:
                    type === "checkbox"
                        ? checked
                        : value
            }))

        }

        setMessage("")
        setErrorMessage("")
    }

    // Handle save settings
    const handleSave = async (e) => {

        e.preventDefault()

        try {

            setSaving(true)

            setMessage("")
            setErrorMessage("")

            const apiUrl =
                process.env.NEXT_PUBLIC_API_URL ||
                "http://localhost:5000"

            const formData =
                new FormData()

            Object.keys(settings).forEach(
                key => {

                    const value =
                        settings[key]

                    if (
                        value !== null &&
                        value !== undefined
                    ) {

                        if (
                            value instanceof File
                        ) {

                            formData.append(
                                key,
                                value
                            )

                        } else {

                            formData.append(
                                key,
                                String(value)
                            )

                        }

                    }

                }
            )

            const res =
                await axios.put(
                    `${apiUrl}/api/settings`,
                    formData
                )

            if (
                res.data &&
                res.data.success
            ) {

                setMessage(
                    "Settings updated successfully!"
                )

                if (
                    res.data.data
                ) {

                    setSettings(prev => ({
                        ...prev,
                        ...res.data.data
                    }))

                }

            } else {

                setErrorMessage(
                    res.data?.message ||
                    "Failed to update settings."
                )

            }

        } catch (error) {

            console.error(
                "Error saving settings:",
                error
            )

            setErrorMessage(
                error.response?.data?.message ||
                error.response?.data?.error ||
                "Failed to save settings."
            )

        } finally {

            setSaving(false)

        }

    }

    if (loading) {

        return (
            <div className="min-h-screen bg-gray-50 p-8 text-gray-900 transition-colors duration-200 dark:bg-[#121212] dark:text-white">

                <div className="animate-pulse">

                    <div className="mb-6 h-7 w-40 rounded bg-gray-200 dark:bg-gray-800"></div>

                    <div className="mb-6 h-10 w-full rounded bg-gray-200 dark:bg-gray-800"></div>

                    <div className="h-80 w-full rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-[#181818]"></div>

                </div>

            </div>
        )

    }

    return (
        <div className="min-h-screen bg-gray-50 p-6 text-gray-900 transition-colors duration-200 dark:bg-[#121212] dark:text-white">

            <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
                Site Settings
            </h1>

            {/* Success Message */}
            {message && (
                <div className="mb-5 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-600 dark:text-green-400">
                    {message}
                </div>
            )}

            {/* Error Message */}
            {errorMessage && (
                <div className="mb-5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
                    {errorMessage}
                </div>
            )}

            <form onSubmit={handleSave}>

                {/* Tabs Navigation */}
                <div className="mb-6 flex flex-wrap gap-2 border-b border-gray-200 pb-3 dark:border-gray-800">

                    {tabs.map((tab) => (

                        <button
                            key={tab}
                            type="button"
                            onClick={() =>
                                setActiveTab(tab)
                            }
                            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                                activeTab === tab
                                    ? "bg-[#f9582c] text-white"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900 dark:bg-[#1e1e1e] dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
                            }`}
                        >
                            {tab}
                        </button>

                    ))}

                </div>

                {/* Tab Content Box */}
                <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 transition-colors duration-200 dark:border-gray-800 dark:bg-[#181818]">

                    {/* 1. Floating Contact Tab */}
                    {activeTab === "Floating Contact" && (

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

                            <ToggleField
                                label="Enable Floating Contact Hub (ভাসমান যোগাযোগ বাটন চালু রাখুন)"
                                desc="ওয়েবসাইটের নিচে ডানে ভাসমান চ্যাট ও যোগাযোগের সব বাটন দেখাবে কি না"
                                name="enableFloatingHub"
                                checked={
                                    settings.enableFloatingHub
                                }
                                onChange={handleChange}
                            />

                            <ToggleField
                                label="Enable WhatsApp (হোয়াটসঅ্যাপ বাটন চালু রাখুন)"
                                desc="গ্রাহক সরাসরি হোয়াটসঅ্যাপে মেসেজ দিতে পারবে"
                                name="enableWhatsapp"
                                checked={
                                    settings.enableWhatsapp
                                }
                                onChange={handleChange}
                            />

                            <InputField
                                label="WhatsApp Number (হোয়াটসঅ্যাপ নম্বর)"
                                name="whatsappNumber"
                                value={
                                    settings.whatsappNumber
                                }
                                onChange={handleChange}
                                placeholder="88018XXXXXXXX (কান্ট্রি কোডসহ নম্বর দিন)"
                            />

                            <ToggleField
                                label="Enable Messenger (ফেসবুক মেসেঞ্জার বাটন চালু রাখুন)"
                                desc="গ্রাহক সরাসরি ফেসবুকে মেসেজ চ্যাট করতে পারবে"
                                name="enableMessenger"
                                checked={
                                    settings.enableMessenger
                                }
                                onChange={handleChange}
                            />

                            <InputField
                                label="Messenger Username / Page (মেসেঞ্জার ইউজারনেম)"
                                name="messengerUsername"
                                value={
                                    settings.messengerUsername
                                }
                                onChange={handleChange}
                                placeholder="yourpageusername"
                            />

                            <ToggleField
                                label="Enable Phone Call (সরাসরি কল বাটন চালু রাখুন)"
                                desc="ক্লিক করলে সরাসরি কাস্টমার সাপোর্টে কল চলে যাবে"
                                name="enablePhoneCall"
                                checked={
                                    settings.enablePhoneCall
                                }
                                onChange={handleChange}
                            />

                            <InputField
                                label="Phone Number (কল করার ফোন নম্বর)"
                                name="phoneNumber"
                                value={
                                    settings.phoneNumber
                                }
                                onChange={handleChange}
                                placeholder="+88018XXXXXXXX"
                            />

                            <ToggleField
                                label="Enable Email (ইমেইল বাটন চালু রাখুন)"
                                desc="ক্লিক করলে সরাসরি মেইল পাঠানোর ক্লায়েন্ট ওপেন হবে"
                                name="enableEmail"
                                checked={
                                    settings.enableEmail
                                }
                                onChange={handleChange}
                            />

                            <InputField
                                label="Support Email Address (সাপোর্ট ইমেইল এড্রেস)"
                                name="supportEmail"
                                value={
                                    settings.supportEmail
                                }
                                onChange={handleChange}
                                placeholder="support@afiscreation.com"
                                type="email"
                            />

                        </div>

                    )}

                    {/* 2. General Tab */}
                    {activeTab === "General" && (

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

                            <InputField
                                label="Site Name"
                                name="siteName"
                                value={
                                    settings.siteName
                                }
                                onChange={handleChange}
                                placeholder="Afis Creation"
                            />

                            <InputField
                                label="Site Tagline"
                                name="siteTagline"
                                value={
                                    settings.siteTagline
                                }
                                onChange={handleChange}
                                placeholder="Elegance in Every Stitch"
                            />

                            {/* Logo */}
                            <div>

                                <label className="mb-1 block text-sm text-gray-700 dark:text-gray-300">
                                    Website Logo
                                </label>

                                <input
                                    type="file"
                                    name="logo"
                                    onChange={handleChange}
                                    accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                                    className="w-full cursor-pointer rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 focus:border-[#f9582c] focus:outline-none dark:border-gray-700 dark:bg-[#121212] dark:text-white file:mr-4 file:rounded-md file:border-0 file:bg-[#f9582c] file:px-3 file:py-1 file:text-xs file:font-semibold file:text-white hover:file:bg-orange-700"
                                />

                                {settings.logo instanceof File && (

                                    <p className="mt-2 text-xs text-green-600 dark:text-green-400">
                                        New file:{" "}
                                        {settings.logo.name}
                                    </p>

                                )}

                                {typeof settings.logo === "string" &&
                                    settings.logo && (

                                        <div className="mt-3">

                                            <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                                                Current Logo
                                            </p>

                                            <img
                                                src={settings.logo}
                                                alt="Current Logo"
                                                className="h-16 w-auto max-w-[220px] rounded-lg bg-white object-contain p-2"
                                            />

                                        </div>

                                    )}

                            </div>

                            {/* Favicon */}
                            <div>

                                <label className="mb-1 block text-sm text-gray-700 dark:text-gray-300">
                                    Favicon
                                </label>

                                <input
                                    type="file"
                                    name="favicon"
                                    onChange={handleChange}
                                    accept="image/png,image/jpeg,image/jpg,image/webp,image/x-icon,image/vnd.microsoft.icon,.ico"
                                    className="w-full cursor-pointer rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 focus:border-[#f9582c] focus:outline-none dark:border-gray-700 dark:bg-[#121212] dark:text-white file:mr-4 file:rounded-md file:border-0 file:bg-[#f9582c] file:px-3 file:py-1 file:text-xs file:font-semibold file:text-white hover:file:bg-orange-700"
                                />

                                {settings.favicon instanceof File && (

                                    <p className="mt-2 text-xs text-green-600 dark:text-green-400">
                                        New file:{" "}
                                        {settings.favicon.name}
                                    </p>

                                )}

                                {typeof settings.favicon === "string" &&
                                    settings.favicon && (

                                        <div className="mt-3">

                                            <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                                                Current Favicon
                                            </p>

                                            <img
                                                src={settings.favicon}
                                                alt="Current Favicon"
                                                className="h-16 w-16 rounded-lg bg-white object-contain p-2"
                                            />

                                        </div>

                                    )}

                            </div>

                        </div>

                    )}

                    {/* 3. Top Bar Tab */}
                    {activeTab === "Top Bar" && (

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

                            <ToggleField
                                label="Topbar Enabled"
                                name="topbarEnabled"
                                checked={
                                    settings.topbarEnabled
                                }
                                onChange={handleChange}
                            />

                            <InputField
                                label="Topbar Phone"
                                name="topbarPhone"
                                value={
                                    settings.topbarPhone
                                }
                                onChange={handleChange}
                                placeholder="+88018XXXXXXXX"
                            />

                            <div className="md:col-span-2">

                                <InputField
                                    label="Topbar Text"
                                    name="topbarText"
                                    value={
                                        settings.topbarText
                                    }
                                    onChange={handleChange}
                                    placeholder="Free Delivery on orders over ৳2000"
                                />

                            </div>

                        </div>

                    )}

                    {/* 4. Footer Tab */}
                    {activeTab === "Footer" && (

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

                            <div className="md:col-span-2">

                                <label className="mb-1 block text-sm text-gray-700 dark:text-gray-300">
                                    Footer Address
                                </label>

                                <textarea
                                    name="footerAddress"
                                    value={
                                        settings.footerAddress
                                    }
                                    onChange={handleChange}
                                    rows="3"
                                    placeholder="Dhaka, Bangladesh"
                                    className="w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900 focus:border-[#f9582c] focus:outline-none dark:border-gray-700 dark:bg-[#121212] dark:text-white"
                                />

                            </div>

                            <InputField
                                label="Footer Phone"
                                name="footerPhone"
                                value={
                                    settings.footerPhone
                                }
                                onChange={handleChange}
                                placeholder="+88018XXXXXXXX"
                            />

                            <InputField
                                label="Footer Phone 2"
                                name="footerPhone2"
                                value={
                                    settings.footerPhone2
                                }
                                onChange={handleChange}
                                placeholder="+88019XXXXXXXX"
                            />

                            <InputField
                                label="Footer Email"
                                name="footerEmail"
                                value={
                                    settings.footerEmail
                                }
                                onChange={handleChange}
                                placeholder="support@afiscreation.com"
                                type="email"
                            />

                            <InputField
                                label="Footer Copyright"
                                name="footerCopyright"
                                value={
                                    settings.footerCopyright
                                }
                                onChange={handleChange}
                                placeholder="© 2026 Afis Creation. All rights reserved."
                            />

                        </div>

                    )}

                    {/* 5. Social Links Tab */}
                    {activeTab === "Social Links" && (

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

                            <InputField
                                label="Facebook"
                                name="facebook"
                                value={
                                    settings.facebook
                                }
                                onChange={handleChange}
                                placeholder="https://facebook.com/yourpage"
                                type="url"
                            />

                            <InputField
                                label="Instagram"
                                name="instagram"
                                value={
                                    settings.instagram
                                }
                                onChange={handleChange}
                                placeholder="https://instagram.com/yourpage"
                                type="url"
                            />

                            <InputField
                                label="Youtube"
                                name="youtube"
                                value={
                                    settings.youtube
                                }
                                onChange={handleChange}
                                placeholder="https://youtube.com/@yourchannel"
                                type="url"
                            />

                        </div>

                    )}

                    {/* 6. SEO Tab */}
                    {activeTab === "SEO" && (

                        <div className="space-y-8">

                            {/* SEO Header */}
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Search Engine Optimization
                                </h2>

                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                    Configure your website's global SEO information.
                                    These settings are mainly used for Google and social sharing.
                                </p>
                            </div>

                            {/* Basic SEO */}
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

                                {/* Meta Title */}
                                <div className="md:col-span-2">

                                    <label className="mb-1 block text-sm text-gray-700 dark:text-gray-300">
                                        Meta Title
                                    </label>

                                    <input
                                        type="text"
                                        name="metaTitle"
                                        value={
                                            settings.metaTitle
                                        }
                                        onChange={handleChange}
                                        maxLength={60}
                                        placeholder="Afis Creation - Premium Fashion & Lifestyle"
                                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-[#f9582c] focus:outline-none dark:border-gray-700 dark:bg-[#121212] dark:text-white"
                                    />

                                    <div className="mt-1 flex justify-between">

                                        <p className="text-xs text-gray-500">
                                            Recommended: 50–60 characters
                                        </p>

                                        <p
                                            className={`text-xs ${
                                                settings.metaTitle.length > 60
                                                    ? "text-red-500 dark:text-red-400"
                                                    : "text-gray-500"
                                            }`}
                                        >
                                            {settings.metaTitle.length}/60
                                        </p>

                                    </div>

                                </div>

                                {/* Meta Description */}
                                <div className="md:col-span-2">

                                    <label className="mb-1 block text-sm text-gray-700 dark:text-gray-300">
                                        Meta Description
                                    </label>

                                    <textarea
                                        name="metaDescription"
                                        value={
                                            settings.metaDescription
                                        }
                                        onChange={handleChange}
                                        maxLength={160}
                                        rows="4"
                                        placeholder="Shop premium fashion products from Afis Creation. Discover elegant clothing, accessories and lifestyle products."
                                        className="w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900 focus:border-[#f9582c] focus:outline-none dark:border-gray-700 dark:bg-[#121212] dark:text-white"
                                    />

                                    <div className="mt-1 flex justify-between">

                                        <p className="text-xs text-gray-500">
                                            Recommended: 140–160 characters
                                        </p>

                                        <p
                                            className={`text-xs ${
                                                settings.metaDescription.length > 160
                                                    ? "text-red-500 dark:text-red-400"
                                                    : "text-gray-500"
                                            }`}
                                        >
                                            {settings.metaDescription.length}/160
                                        </p>

                                    </div>

                                </div>

                            </div>

                            {/* SEO Preview */}
                            <div>

                                <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">
                                    Google Search Preview
                                </h3>

                                <div className="max-w-2xl rounded-lg bg-white p-5 shadow-sm">

                                    <p className="truncate text-lg font-medium text-[#1a0dab]">
                                        {settings.metaTitle ||
                                            settings.siteName ||
                                            "Afis Creation"}
                                    </p>

                                    <p className="mt-1 truncate text-sm text-[#006621]">
                                        https://afiscreation.com
                                    </p>

                                    <p className="mt-1 text-sm leading-5 text-gray-600">
                                        {settings.metaDescription ||
                                            "Shop premium fashion products from Afis Creation."}
                                    </p>

                                </div>

                            </div>

                            {/* Analytics */}
                            <div>

                                <h3 className="mb-1 text-sm font-semibold text-gray-900 dark:text-white">
                                    Analytics & Tracking
                                </h3>

                                <p className="mb-4 text-xs text-gray-500">
                                    Add your tracking IDs to connect analytics and marketing tools.
                                </p>

                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

                                    <InputField
                                        label="Google Analytics ID"
                                        name="googleAnalyticsId"
                                        value={
                                            settings.googleAnalyticsId
                                        }
                                        onChange={handleChange}
                                        placeholder="G-XXXXXXXXXX"
                                    />

                                    <InputField
                                        label="Facebook Pixel ID"
                                        name="facebookPixelId"
                                        value={
                                            settings.facebookPixelId
                                        }
                                        onChange={handleChange}
                                        placeholder="123456789012345"
                                    />

                                </div>

                            </div>

                            {/* SEO Important Note */}
                            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-[#121212]">

                                <h3 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">
                                    SEO Structure
                                </h3>

                                <div className="space-y-2 text-xs text-gray-500 dark:text-gray-400">

                                    <p>
                                        • Global SEO → Website homepage and default pages
                                    </p>

                                    <p>
                                        • Product SEO → Individual product title and description
                                    </p>

                                    <p>
                                        • Category SEO → Individual category title and description
                                    </p>

                                    <p>
                                        • Sitemap → Helps Google discover your website pages
                                    </p>

                                    <p>
                                        • Robots.txt → Controls search engine crawling
                                    </p>

                                </div>

                            </div>

                        </div>

                    )}

                </div>

                {/* Save Button */}
                <button
                    type="submit"
                    disabled={saving}
                    className={`rounded-lg bg-[#f9582c] px-6 py-2.5 font-medium text-white transition-all hover:bg-orange-700 ${
                        saving
                            ? "cursor-not-allowed opacity-60"
                            : "cursor-pointer"
                    }`}
                >
                    {saving
                        ? "Saving..."
                        : "Save settings"}
                </button>

            </form>

        </div>
    )
}


// Reusable Input Field Component
function SubInputField({
    label,
    name,
    value,
    onChange,
    placeholder = "",
    type = "text"
}) {

    const inputValue =
        typeof value === "string"
            ? value
            : ""

    return (

        <div>

            <label className="mb-1 block text-sm text-gray-700 dark:text-gray-300">
                {label}
            </label>

            <input
                type={type}
                name={name}
                value={inputValue}
                onChange={onChange}
                placeholder={placeholder}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-[#f9582c] focus:outline-none dark:border-gray-700 dark:bg-[#121212] dark:text-white dark:placeholder:text-gray-600"
            />

        </div>

    )
}


function InputField(props) {

    return (
        <SubInputField
            {...props}
        />
    )

}


// Reusable Toggle Field Component
function ToggleField({
    label,
    desc,
    name,
    checked,
    onChange
}) {

    return (

        <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 p-4 transition-colors dark:border-gray-800 dark:bg-[#121212]">

            <div>

                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                    {label}
                </h4>

                {desc && (

                    <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                        {desc}
                    </p>

                )}

            </div>

            <label className="relative inline-flex cursor-pointer items-center">

                <input
                    type="checkbox"
                    name={name}
                    checked={!!checked}
                    onChange={onChange}
                    className="peer sr-only"
                />

                <div className="after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-[#f9582c] peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none h-6 w-11 rounded-full bg-gray-300 dark:bg-gray-700"></div>

            </label>

        </div>

    )

}

