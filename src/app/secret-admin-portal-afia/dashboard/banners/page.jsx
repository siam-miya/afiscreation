'use client'

import React, { useEffect, useState } from 'react';

import {
    Trash2,
    Edit,
    Plus,
    Image as ImageIcon
} from 'lucide-react';


export default function AdminBannersPage() {

    const [banners, setBanners] = useState([]);

    const [loading, setLoading] = useState(true);

    const [editingBanner, setEditingBanner] = useState(null);


    const [smallHeading, setSmallHeading] = useState('');

    const [mainHeading, setMainHeading] = useState('');

    const [discountText, setDiscountText] = useState('');

    const [link, setLink] = useState('');

    const [imageFile, setImageFile] = useState(null);

    const [submitting, setSubmitting] = useState(false);

    const [updating, setUpdating] = useState(false);


    const apiUrl =
        process.env.NEXT_PUBLIC_API_URL ||
        "http://localhost:5000";
    const getImageUrl = (image) => {

        if (!image) {
            return "";
        }

        if (
            image.startsWith("http://") ||
            image.startsWith("https://")
        ) {

            return image;

        }

        const cleanImage =
            image.replace(/\\/g, "/");


        return `${apiUrl}${cleanImage.startsWith("/") ? "" : "/"}${cleanImage}`;

    };


    // Fetch banners

    const fetchBanners = async () => {

        try {

            setLoading(true);


            const res =
                await fetch(
                    `${apiUrl}/api/banners/admin`,
                    {
                        cache: "no-store",
                    }
                );


            if (!res.ok) {

                throw new Error(
                    `Server error: ${res.status}`
                );

            }


            const data =
                await res.json();


            if (!data.success) {

                throw new Error(
                    data.message ||
                    "Failed to fetch banners"
                );

            }


            setBanners(
                Array.isArray(data.data)
                    ? data.data
                    : []
            );


        } catch (error) {

            console.error(
                "Error fetching banners:",
                error
            );


        } finally {

            setLoading(false);

        }

    };


    useEffect(() => {

        fetchBanners();

    }, []);


    // Create banner

    const handleCreateBanner =
        async (e) => {

            e.preventDefault();


            if (!imageFile) {

                alert(
                    "Please select a banner image!"
                );

                return;

            }


            const formData =
                new FormData();


            formData.append(
                "smallHeading",
                smallHeading
            );

            formData.append(
                "mainHeading",
                mainHeading
            );

            formData.append(
                "discountText",
                discountText
            );

            formData.append(
                "link",
                link || "/products"
            );

            formData.append(
                "image",
                imageFile
            );


            try {

                setSubmitting(true);


                const res =
                    await fetch(
                        `${apiUrl}/api/banners`,
                        {
                            method: "POST",
                            body: formData,
                        }
                    );


                const data =
                    await res.json();


                if (!res.ok || !data.success) {

                    throw new Error(
                        data.message ||
                        "Failed to upload banner"
                    );

                }


                alert(
                    "Banner uploaded successfully!"
                );


                setSmallHeading('');

                setMainHeading('');

                setDiscountText('');

                setLink('');

                setImageFile(null);


                const fileInput =
                    document.getElementById(
                        "banner-image"
                    );


                if (fileInput) {

                    fileInput.value = "";

                }


                fetchBanners();


            } catch (error) {

                console.error(
                    "Error creating banner:",
                    error
                );


                alert(
                    error.message ||
                    "Failed to upload banner"
                );


            } finally {

                setSubmitting(false);

            }

        };


    // Delete banner

    const handleDelete =
        async (id) => {

            if (
                !confirm(
                    "Are you sure you want to delete this banner?"
                )
            ) {

                return;

            }


            try {

                const res =
                    await fetch(
                        `${apiUrl}/api/banners/${id}`,
                        {
                            method: "DELETE",
                        }
                    );


                const data =
                    await res.json();


                if (!res.ok || !data.success) {

                    throw new Error(
                        data.message ||
                        "Delete failed"
                    );

                }


                setBanners(
                    (prev) =>
                        prev.filter(
                            (banner) =>
                                banner._id !== id
                        )
                );


                alert(
                    "Banner deleted successfully!"
                );


            } catch (error) {

                console.error(
                    "Error deleting banner:",
                    error
                );


                alert(
                    error.message ||
                    "Delete failed"
                );

            }

        };


    // Update banner

    const handleUpdateSubmit =
        async (e) => {

            e.preventDefault();


            try {

                setUpdating(true);


                const formData =
                    new FormData();


                formData.append(
                    "smallHeading",
                    editingBanner.smallHeading
                );


                formData.append(
                    "mainHeading",
                    editingBanner.mainHeading
                );


                formData.append(
                    "discountText",
                    editingBanner.discountText || ""
                );


                formData.append(
                    "link",
                    editingBanner.link || "/products"
                );


                formData.append(
                    "isActive",
                    editingBanner.isActive
                );


                if (
                    editingBanner.newImage
                ) {

                    formData.append(
                        "image",
                        editingBanner.newImage
                    );

                }


                const res =
                    await fetch(
                        `${apiUrl}/api/banners/${editingBanner._id}`,
                        {
                            method: "PUT",
                            body: formData,
                        }
                    );


                const data =
                    await res.json();


                if (!res.ok || !data.success) {

                    throw new Error(
                        data.message ||
                        "Update failed"
                    );

                }


                alert(
                    "Banner updated successfully!"
                );


                setEditingBanner(null);


                fetchBanners();


            } catch (error) {

                console.error(
                    "Error updating banner:",
                    error
                );


                alert(
                    error.message ||
                    "Update failed"
                );


            } finally {

                setUpdating(false);

            }

        };


    return (

        <div className="p-6 font-poppins">


            <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">

                <ImageIcon
                    className="text-orange-500"
                />

                Manage Home Banners

            </h1>


            {/* Upload New Banner */}

            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 mb-8">

                <h2 className="text-lg font-semibold mb-4 text-gray-700 dark:text-slate-200">

                    Upload New Banner

                </h2>


                <form
                    onSubmit={handleCreateBanner}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                >


                    <div>

                        <label className="text-xs font-medium text-gray-500">

                            Small Heading

                        </label>


                        <input
                            type="text"
                            placeholder="e.g. Exclusive Collection"
                            value={smallHeading}
                            onChange={(e) =>
                                setSmallHeading(
                                    e.target.value
                                )
                            }
                            className="w-full mt-1 border dark:border-slate-700 p-2.5 rounded-xl text-sm dark:bg-slate-800"
                            required
                        />

                    </div>


                    <div>

                        <label className="text-xs font-medium text-gray-500">

                            Main Heading

                        </label>


                        <input
                            type="text"
                            placeholder="e.g. Elegant Abaya"
                            value={mainHeading}
                            onChange={(e) =>
                                setMainHeading(
                                    e.target.value
                                )
                            }
                            className="w-full mt-1 border dark:border-slate-700 p-2.5 rounded-xl text-sm dark:bg-slate-800"
                            required
                        />

                    </div>


                    <div>

                        <label className="text-xs font-medium text-gray-500">

                            Discount Text

                        </label>


                        <input
                            type="text"
                            placeholder="e.g. 10%"
                            value={discountText}
                            onChange={(e) =>
                                setDiscountText(
                                    e.target.value
                                )
                            }
                            className="w-full mt-1 border dark:border-slate-700 p-2.5 rounded-xl text-sm dark:bg-slate-800"
                        />

                    </div>


                    <div>

                        <label className="text-xs font-medium text-gray-500">

                            Button Link

                        </label>


                        <input
                            type="text"
                            placeholder="e.g. /products"
                            value={link}
                            onChange={(e) =>
                                setLink(
                                    e.target.value
                                )
                            }
                            className="w-full mt-1 border dark:border-slate-700 p-2.5 rounded-xl text-sm dark:bg-slate-800"
                        />

                    </div>


                    <div>

                        <label className="text-xs font-medium text-gray-500">

                            Banner Image

                        </label>


                        <input
                            id="banner-image"
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                                setImageFile(
                                    e.target.files?.[0] || null
                                )
                            }
                            className="w-full mt-1 border dark:border-slate-700 p-1.5 rounded-xl text-sm dark:bg-slate-800 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-orange-50 file:text-orange-600"
                            required
                        />

                    </div>


                    <div className="flex items-end">

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-medium py-2.5 rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20"
                        >

                            <Plus size={18} />

                            {submitting
                                ? "Uploading..."
                                : "Add Banner"}

                        </button>

                    </div>


                </form>

            </div>


            {/* Existing Banners */}

            <h2 className="text-lg font-semibold mb-4 text-gray-700 dark:text-slate-200">

                All Banners

            </h2>


            {loading ? (

                <p className="text-gray-500">

                    Loading banners...

                </p>

            ) : banners.length === 0 ? (

                <p className="text-gray-500">

                    No banners found. Upload one above!

                </p>

            ) : (

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                    {banners.map(
                        (banner) => {

                            const imageUrl =
                                getImageUrl(
                                    banner.image
                                );


                            return (

                                <div
                                    key={banner._id}
                                    className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between"
                                >

                                    <div>

                                        <div className="relative h-40 w-full bg-gray-100">

                                            <img
                                                src={imageUrl}
                                                alt={banner.mainHeading || "Banner"}
                                                className="w-full h-full object-cover"
                                            />


                                            <span
                                                className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                                    banner.isActive
                                                        ? "bg-green-500 text-white"
                                                        : "bg-red-500 text-white"
                                                }`}
                                            >

                                                {banner.isActive
                                                    ? "Active"
                                                    : "Inactive"}

                                            </span>

                                        </div>


                                        <div className="p-4 space-y-1">

                                            <p className="text-xs text-orange-500 font-semibold uppercase">

                                                {banner.smallHeading}

                                            </p>


                                            <h3 className="font-bold text-gray-800 dark:text-white text-base">

                                                {banner.mainHeading}

                                            </h3>


                                            <p className="text-xs text-gray-500">

                                                Discount: {banner.discountText || "None"}

                                            </p>


                                            <p className="text-xs text-gray-400 truncate">

                                                Link: {banner.link}

                                            </p>

                                        </div>

                                    </div>


                                    <div className="p-4 pt-0 flex gap-2">

                                        <button
                                            onClick={() =>
                                                setEditingBanner({
                                                    ...banner,
                                                    newImage: null,
                                                })
                                            }
                                            className="flex-1 bg-blue-50 dark:bg-slate-800 hover:bg-blue-100 text-blue-600 dark:text-blue-400 py-2 rounded-xl text-xs font-medium flex items-center justify-center gap-1 transition"
                                        >

                                            <Edit size={14} />

                                            Edit

                                        </button>


                                        <button
                                            onClick={() =>
                                                handleDelete(
                                                    banner._id
                                                )
                                            }
                                            className="flex-1 bg-red-50 dark:bg-slate-800 hover:bg-red-100 text-red-600 dark:text-red-400 py-2 rounded-xl text-xs font-medium flex items-center justify-center gap-1 transition"
                                        >

                                            <Trash2 size={14} />

                                            Delete

                                        </button>

                                    </div>

                                </div>

                            );

                        }
                    )}

                </div>

            )}


            {/* Edit Modal */}

            {editingBanner && (

                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">

                    <form
                        onSubmit={handleUpdateSubmit}
                        className="bg-white dark:bg-slate-900 p-6 rounded-2xl w-full max-w-lg space-y-4 shadow-xl"
                    >

                        <h3 className="text-lg font-bold text-gray-800 dark:text-white">

                            Edit Banner

                        </h3>


                        <div>

                            <label className="text-xs font-medium text-gray-500">

                                Small Heading

                            </label>


                            <input
                                type="text"
                                value={
                                    editingBanner.smallHeading
                                }
                                onChange={(e) =>
                                    setEditingBanner({
                                        ...editingBanner,
                                        smallHeading:
                                            e.target.value,
                                    })
                                }
                                className="w-full mt-1 border dark:border-slate-700 p-2.5 rounded-xl text-sm dark:bg-slate-800"
                                required
                            />

                        </div>


                        <div>

                            <label className="text-xs font-medium text-gray-500">

                                Main Heading

                            </label>


                            <input
                                type="text"
                                value={
                                    editingBanner.mainHeading
                                }
                                onChange={(e) =>
                                    setEditingBanner({
                                        ...editingBanner,
                                        mainHeading:
                                            e.target.value,
                                    })
                                }
                                className="w-full mt-1 border dark:border-slate-700 p-2.5 rounded-xl text-sm dark:bg-slate-800"
                                required
                            />

                        </div>


                        <div>

                            <label className="text-xs font-medium text-gray-500">

                                Discount Text

                            </label>


                            <input
                                type="text"
                                value={
                                    editingBanner.discountText || ""
                                }
                                onChange={(e) =>
                                    setEditingBanner({
                                        ...editingBanner,
                                        discountText:
                                            e.target.value,
                                    })
                                }
                                className="w-full mt-1 border dark:border-slate-700 p-2.5 rounded-xl text-sm dark:bg-slate-800"
                            />

                        </div>


                        <div>

                            <label className="text-xs font-medium text-gray-500">

                                Link

                            </label>


                            <input
                                type="text"
                                value={
                                    editingBanner.link || ""
                                }
                                onChange={(e) =>
                                    setEditingBanner({
                                        ...editingBanner,
                                        link:
                                            e.target.value,
                                    })
                                }
                                className="w-full mt-1 border dark:border-slate-700 p-2.5 rounded-xl text-sm dark:bg-slate-800"
                            />

                        </div>


                        <div className="flex items-center gap-2">

                            <input
                                type="checkbox"
                                id="isActive"
                                checked={
                                    Boolean(
                                        editingBanner.isActive
                                    )
                                }
                                onChange={(e) =>
                                    setEditingBanner({
                                        ...editingBanner,
                                        isActive:
                                            e.target.checked,
                                    })
                                }
                                className="w-4 h-4 text-orange-500 rounded"
                            />


                            <label
                                htmlFor="isActive"
                                className="text-sm font-medium text-gray-700 dark:text-slate-300"
                            >

                                Active (Show on Homepage)

                            </label>

                        </div>


                        <div>

                            <label className="text-xs font-medium text-gray-500">

                                Change Image (Optional)

                            </label>


                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) =>
                                    setEditingBanner({
                                        ...editingBanner,
                                        newImage:
                                            e.target.files?.[0] || null,
                                    })
                                }
                                className="w-full mt-1 border dark:border-slate-700 p-1.5 rounded-xl text-sm dark:bg-slate-800"
                            />

                        </div>


                        <div className="flex justify-end gap-3 pt-2">

                            <button
                                type="button"
                                onClick={() =>
                                    setEditingBanner(null)
                                }
                                className="px-4 py-2 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 rounded-xl text-sm font-medium"
                            >

                                Cancel

                            </button>


                            <button
                                type="submit"
                                disabled={updating}
                                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white rounded-xl text-sm font-medium shadow-lg shadow-orange-500/20"
                            >

                                {updating
                                    ? "Saving..."
                                    : "Save Changes"}

                            </button>

                        </div>

                    </form>

                </div>

            )}

        </div>

    );

}