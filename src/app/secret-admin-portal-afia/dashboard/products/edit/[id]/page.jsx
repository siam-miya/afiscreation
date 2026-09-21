"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-hot-toast";
import {
  Plus,
  Trash2,
  Loader2,
  Layers,
  DollarSign,
  Image as ImageIcon,
  LayoutGrid,
  Sliders,
  Check,
} from "lucide-react";

export default function EditProductPage() {
  const { id } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [categories, setCategories] = useState([]);
  const [activeTab, setActiveTab] = useState("general");

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    sku: "",
    price: "",
    discountPrice: "0",
    stock: "0",
    category: "",
    description: "",
    hasCustomSize: false,
    isFlashSale: false,
    isBestSelling: false,
    isNewArrival: false,
    isHotProductBanner: false,
    isHotProductSection2: false,
    isExploreProduct: true,
  });

  const [existingThumbnail, setExistingThumbnail] = useState("");
  const [existingImages, setExistingImages] = useState([]);
  const [existingSizeChart, setExistingSizeChart] = useState("");

  const [newThumbnail, setNewThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState("");

  const [newSizeChart, setNewSizeChart] = useState(null);
  const [sizeChartPreview, setSizeChartPreview] = useState("");

  const [newImages, setNewImages] = useState([]);
  const [galleryPreviews, setGalleryPreviews] = useState([]);

  const [colors, setColors] = useState([
    {
      name: "",
      code: "",
      images: [],
      imageIndexes: [],
    },
  ]);

  const [sizes, setSizes] = useState([""]);

  // ----------------------------------
  // IMAGE URL
  // ----------------------------------

  const getImageUrl = (path) => {
    if (!path) return "";

    if (
      path.startsWith("http://") ||
      path.startsWith("https://")
    ) {
      return path;
    }

    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:5000";

    return `${apiUrl}/${path
      .replace(/\\/g, "/")
      .replace(/^\/+/, "")}`;
  };

  // ----------------------------------
  // FETCH PRODUCT
  // ----------------------------------

  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL ||
          "http://localhost:5000";

        const res = await axios.get(
          `${apiUrl}/api/products/${id}`
        );

        if (res.data.success && res.data.data) {
          const product = res.data.data;

          setFormData({
            title: product.title || "",
            slug: product.slug || "",
            sku: product.sku || "",
            price:
              product.price !== undefined
                ? String(product.price)
                : "",
            discountPrice:
              product.discountPrice !== undefined
                ? String(product.discountPrice)
                : "0",
            stock:
              product.stock !== undefined
                ? String(product.stock)
                : "0",
            category:
              typeof product.category === "object"
                ? product.category?._id
                : product.category || "",
            description: product.description || "",
            hasCustomSize: Boolean(
              product.hasCustomSize
            ),
            isFlashSale: Boolean(
              product.isFlashSale
            ),
            isBestSelling: Boolean(
              product.isBestSelling
            ),
            isNewArrival: Boolean(
              product.isNewArrival
            ),
            isHotProductBanner: Boolean(
              product.isHotProductBanner
            ),
            isHotProductSection2: Boolean(
              product.isHotProductSection2
            ),
            isExploreProduct:
              product.isExploreProduct !== undefined
                ? Boolean(product.isExploreProduct)
                : true,
          });

          setExistingThumbnail(
            product.thumbnail || ""
          );

          setExistingImages(
            Array.isArray(product.images)
              ? product.images
              : []
          );

          setExistingSizeChart(
            product.sizeChartImage || ""
          );

          // ----------------------------------
          // EXISTING COLORS
          // ----------------------------------

          if (
            Array.isArray(product.colors) &&
            product.colors.length > 0
          ) {
            setColors(
              product.colors.map((color) => {
                if (typeof color === "string") {
                  return {
                    name: color,
                    code: "",
                    images: [],
                    imageIndexes: [],
                  };
                }

                return {
                  name: color.name || "",
                  code: color.code || "",
                  images: Array.isArray(color.images)
                    ? color.images
                    : [],
                  imageIndexes: [],
                };
              })
            );
          }

          // ----------------------------------
          // EXISTING SIZES
          // ----------------------------------

          if (
            Array.isArray(product.sizes) &&
            product.sizes.length > 0
          ) {
            setSizes(product.sizes);
          }
        }
      } catch (error) {
        console.error(
          "Product fetch error:",
          error
        );

        toast.error(
          "Failed to load product details"
        );
      }
    };

    const fetchCategories = async () => {
      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL ||
          "http://localhost:5000";

        const res = await axios.get(
          `${apiUrl}/api/v1/categories/all`
        );

        if (res?.data?.success) {
          setCategories(
            res.data.data || []
          );
        }
      } catch (error) {
        console.error(
          "Category fetch error:",
          error
        );
      }
    };

    Promise.all([
      fetchProduct(),
      fetchCategories(),
    ]).finally(() => {
      setLoading(false);
    });
  }, [id]);

  // ----------------------------------
  // FORM HANDLERS
  // ----------------------------------

  const handleTitleChange = (e) => {
    const title = e.target.value;

    const slug = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    setFormData({
      ...formData,
      title,
      slug,
    });
  };

  const handleChange = (e) => {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  // ----------------------------------
  // THUMBNAIL
  // ----------------------------------

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      setNewThumbnail(file);

      setThumbnailPreview(
        URL.createObjectURL(file)
      );
    }
  };

  // ----------------------------------
  // SIZE CHART
  // ----------------------------------

  const handleSizeChartChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      setNewSizeChart(file);

      setSizeChartPreview(
        URL.createObjectURL(file)
      );
    }
  };

  // ----------------------------------
  // NEW GALLERY IMAGES
  // ----------------------------------

  const handleGalleryChange = (e) => {
    const files = Array.from(e.target.files);

    if (
      existingImages.length +
        newImages.length +
        files.length >
      4
    ) {
      toast.error(
        "সর্বোচ্চ ৪টি additional image রাখা যাবে।"
      );

      return;
    }

    setNewImages((prev) => [
      ...prev,
      ...files,
    ]);

    setGalleryPreviews((prev) => [
      ...prev,
      ...files.map((file) =>
        URL.createObjectURL(file)
      ),
    ]);

    e.target.value = "";
  };

  const removeNewImage = (index) => {
    setNewImages((prev) =>
      prev.filter((_, i) => i !== index)
    );

    setGalleryPreviews((prev) =>
      prev.filter((_, i) => i !== index)
    );

    // New image combined index starts after existing images
    const removedCombinedIndex =
      existingImages.length + index;

    setColors((prev) =>
      prev.map((color) => ({
        ...color,

        imageIndexes: (
          color.imageIndexes || []
        )
          .filter(
            (imageIndex) =>
              imageIndex !==
              removedCombinedIndex
          )
          .map((imageIndex) =>
            imageIndex >
            removedCombinedIndex
              ? imageIndex - 1
              : imageIndex
          ),
      }))
    );
  };

  // ----------------------------------
  // COLORS
  // ----------------------------------

  const handleColorChange = (
    index,
    field,
    value
  ) => {
    setColors((prev) =>
      prev.map((color, i) =>
        i === index
          ? {
              ...color,
              [field]: value,
            }
          : color
      )
    );
  };

  const addColor = () => {
    setColors((prev) => [
      ...prev,
      {
        name: "",
        code: "",
        images: [],
        imageIndexes: [],
      },
    ]);
  };

  const removeColor = (index) => {
    setColors((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };

  // ----------------------------------
  // THUMBNAIL COLOR IMAGE TOGGLE
  // ----------------------------------

  const toggleThumbnailColorImage = (
    colorIndex
  ) => {
    setColors((prev) =>
      prev.map((color, index) => {
        if (index !== colorIndex) {
          return color;
        }

        const currentIndexes =
          color.imageIndexes || [];

        const thumbnailSelected =
          currentIndexes.includes(-1);

        return {
          ...color,

          imageIndexes: thumbnailSelected
            ? currentIndexes.filter(
                (item) => item !== -1
              )
            : [
                ...currentIndexes,
                -1,
              ],
        };
      })
    );
  };

  // ----------------------------------
  // EXISTING COLOR IMAGE TOGGLE
  // ----------------------------------

  const toggleExistingColorImage = (
    colorIndex,
    imageUrl
  ) => {
    setColors((prev) =>
      prev.map((color, index) => {
        if (index !== colorIndex) {
          return color;
        }

        const currentImages =
          color.images || [];

        const exists =
          currentImages.includes(
            imageUrl
          );

        return {
          ...color,

          images: exists
            ? currentImages.filter(
                (img) =>
                  img !== imageUrl
              )
            : [
                ...currentImages,
                imageUrl,
              ],
        };
      })
    );
  };

  // ----------------------------------
  // NEW COLOR IMAGE TOGGLE
  // ----------------------------------

  const toggleNewColorImage = (
    colorIndex,
    imageIndex
  ) => {
    const combinedIndex =
      existingImages.length +
      imageIndex;

    setColors((prev) =>
      prev.map((color, index) => {
        if (index !== colorIndex) {
          return color;
        }

        const currentIndexes =
          color.imageIndexes || [];

        const exists =
          currentIndexes.includes(
            combinedIndex
          );

        return {
          ...color,

          imageIndexes: exists
            ? currentIndexes.filter(
                (item) =>
                  item !== combinedIndex
              )
            : [
                ...currentIndexes,
                combinedIndex,
              ],
        };
      })
    );
  };

  // ----------------------------------
  // SIZES
  // ----------------------------------

  const handleSizeChange = (
    index,
    value
  ) => {
    const updated = [...sizes];

    updated[index] = value;

    setSizes(updated);
  };

  const addSize = () => {
    setSizes([...sizes, ""]);
  };

  const removeSize = (index) => {
    setSizes(
      sizes.filter(
        (_, i) => i !== index
      )
    );
  };

  // ----------------------------------
  // SUBMIT
  // ----------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();

    setUpdating(true);

    try {
      const data = new FormData();

      Object.keys(formData).forEach(
        (key) => {
          data.append(
            key,
            formData[key]
          );
        }
      );

      const filteredColors = colors
        .filter(
          (color) =>
            color.name &&
            color.name.trim() !== ""
        )
        .map((color) => ({
          name: color.name.trim(),

          code: color.code
            ? color.code.trim()
            : "#000000",

          // Existing uploaded images
          images: Array.isArray(
            color.images
          )
            ? color.images
            : [],

          // Thumbnail = -1
          // New images = existingImages.length + index
          imageIndexes: Array.isArray(
            color.imageIndexes
          )
            ? color.imageIndexes
            : [],
        }));

      const filteredSizes = sizes.filter(
        (size) =>
          size &&
          size.trim() !== ""
      );

      data.append(
        "colors",
        JSON.stringify(
          filteredColors
        )
      );

      data.append(
        "sizes",
        JSON.stringify(
          filteredSizes
        )
      );

      // ----------------------------------
      // NEW THUMBNAIL
      // ----------------------------------

      if (newThumbnail) {
        data.append(
          "thumbnail",
          newThumbnail
        );
      }

      // ----------------------------------
      // SIZE CHART
      // ----------------------------------

      if (newSizeChart) {
        data.append(
          "sizeChartImage",
          newSizeChart
        );
      }

      // ----------------------------------
      // NEW GALLERY IMAGES
      // ----------------------------------

      newImages.forEach((file) => {
        data.append(
          "images",
          file
        );
      });

      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL ||
        "http://localhost:5000";

      const res = await axios.put(
        `${apiUrl}/api/products/${id}`,
        data,
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

      if (res.data.success) {
        toast.success(
          "Product updated successfully!"
        );

        router.push(
          "/secret-admin-portal-afia/dashboard/products"
        );
      }
    } catch (error) {
      console.error(
        "Update error:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to update product"
      );
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-white text-center">
        Loading product data...
      </div>
    );
  }

  // ----------------------------------
  // ALL EXISTING + NEW IMAGES
  // ----------------------------------

  const allExistingImages =
    existingImages.map(
      (image) => ({
        type: "existing",
        value: image,
        src: getImageUrl(image),
      })
    );

  const allNewImages =
    galleryPreviews.map(
      (image, index) => ({
        type: "new",
        value: index,
        src: image,
      })
    );

  return (
    <div className="p-6 md:p-10 text-black dark:text-white max-w-4xl mx-auto bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 font-poppins">

      <div className="mb-6 border-b border-slate-200 dark:border-slate-800 pb-4">
        <h2 className="text-2xl font-bold">
          Edit Professional Product
        </h2>

        <p className="text-sm text-slate-500 mt-1">
          Update your product specifications below using the tabs.
        </p>
      </div>

      {/* NAVIGATION */}

      <div className="flex flex-wrap gap-2 mb-8 border-b border-slate-200 dark:border-slate-800 pb-3">

        <button
          type="button"
          onClick={() =>
            setActiveTab("general")
          }
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition cursor-pointer ${
            activeTab === "general"
              ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
              : "bg-gray-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700"
          }`}
        >
          <Layers size={16} />
          General Info
        </button>

        <button
          type="button"
          onClick={() =>
            setActiveTab("pricing")
          }
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition cursor-pointer ${
            activeTab === "pricing"
              ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
              : "bg-gray-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700"
          }`}
        >
          <DollarSign size={16} />
          Pricing & Stock
        </button>

        <button
          type="button"
          onClick={() =>
            setActiveTab("images")
          }
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition cursor-pointer ${
            activeTab === "images"
              ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
              : "bg-gray-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700"
          }`}
        >
          <ImageIcon size={16} />
          Media & Images
        </button>

        <button
          type="button"
          onClick={() =>
            setActiveTab("variants")
          }
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition cursor-pointer ${
            activeTab === "variants"
              ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
              : "bg-gray-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700"
          }`}
        >
          <Sliders size={16} />
          Colors & Sizes
        </button>

        <button
          type="button"
          onClick={() =>
            setActiveTab("placement")
          }
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition cursor-pointer ${
            activeTab === "placement"
              ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
              : "bg-gray-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700"
          }`}
        >
          <LayoutGrid size={16} />
          Placement
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >

        {/* GENERAL */}

        {activeTab === "general" && (
          <div className="space-y-6">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              <div>
                <label className="block text-sm font-medium mb-2">
                  Product Title *
                </label>

                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={
                    handleTitleChange
                  }
                  className="w-full px-4 py-2.5 border rounded-xl dark:bg-slate-800 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Slug
                </label>

                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border rounded-xl bg-gray-100 dark:bg-slate-800/50 dark:border-slate-700 dark:text-slate-400 text-sm"
                  required
                />
              </div>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              <div>
                <label className="block text-sm font-medium mb-2">
                  SKU
                </label>

                <input
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border rounded-xl dark:bg-slate-800 dark:border-slate-700 text-sm"
                  placeholder="e.g. SKU-101"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Select Category *
                </label>

                <select
                  name="category"
                  value={
                    formData.category
                  }
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border rounded-xl dark:bg-slate-800 dark:border-slate-700 text-sm"
                  required
                >
                  <option value="">
                    -- Choose Category --
                  </option>

                  {categories.flatMap(
                    (cat) => {
                      const options = [
                        <option
                          key={cat._id}
                          value={cat._id}
                          className="font-bold"
                        >
                          📁 {cat.name} (Main)
                        </option>,
                      ];

                      if (
                        cat.subcategories &&
                        cat.subcategories
                          .length > 0
                      ) {
                        cat.subcategories.forEach(
                          (sub) => {
                            options.push(
                              <option
                                key={
                                  sub._id
                                }
                                value={
                                  sub._id
                                }
                              >
                                &nbsp;&nbsp;&nbsp;&nbsp;↳{" "}
                                {sub.name}
                              </option>
                            );
                          }
                        );
                      }

                      return options;
                    }
                  )}
                </select>
              </div>

            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Description *
              </label>

              <textarea
                name="description"
                value={
                  formData.description
                }
                onChange={handleChange}
                rows="5"
                className="w-full px-4 py-2.5 border rounded-xl dark:bg-slate-800 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>

          </div>
        )}

        {/* PRICING */}

        {activeTab === "pricing" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            <div>
              <label className="block text-sm font-medium mb-2">
                Regular Price (৳) *
              </label>

              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border rounded-xl dark:bg-slate-800 dark:border-slate-700 text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Discount Price (৳)
              </label>

              <input
                type="number"
                name="discountPrice"
                value={
                  formData.discountPrice
                }
                onChange={handleChange}
                className="w-full px-4 py-2.5 border rounded-xl dark:bg-slate-800 dark:border-slate-700 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Stock Quantity *
              </label>

              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border rounded-xl dark:bg-slate-800 dark:border-slate-700 text-sm"
                required
              />
            </div>

          </div>
        )}

        {/* IMAGES */}

        {activeTab === "images" && (
          <div className="space-y-6">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              <div>
                <label className="block text-sm font-medium mb-2">
                  Product Thumbnail
                </label>

                <input
                  type="file"
                  accept="image/*"
                  onChange={
                    handleThumbnailChange
                  }
                  className="w-full text-sm border p-2 rounded-xl dark:border-slate-700"
                />

                {(
                  thumbnailPreview ||
                  existingThumbnail
                ) && (
                  <img
                    src={
                      thumbnailPreview ||
                      getImageUrl(
                        existingThumbnail
                      )
                    }
                    alt="thumb"
                    className="w-24 h-24 object-cover mt-2 rounded-xl border shadow-sm"
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Size Chart Image
                </label>

                <input
                  type="file"
                  accept="image/*"
                  onChange={
                    handleSizeChartChange
                  }
                  className="w-full text-sm border p-2 rounded-xl dark:border-slate-700"
                />

                {(
                  sizeChartPreview ||
                  existingSizeChart
                ) && (
                  <img
                    src={
                      sizeChartPreview ||
                      getImageUrl(
                        existingSizeChart
                      )
                    }
                    alt="sizechart"
                    className="w-24 h-24 object-cover mt-2 rounded-xl border shadow-sm"
                  />
                )}
              </div>

            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800">

              <label className="block text-sm font-medium mb-2">
                Additional Images (Max 4)
              </label>

              <input
                type="file"
                accept="image/*"
                multiple
                onChange={
                  handleGalleryChange
                }
                className="w-full text-sm border p-2 rounded-xl dark:border-slate-700"
              />

              <div className="flex gap-3 mt-3 flex-wrap">

                {existingImages.map(
                  (img, idx) => (
                    <div
                      key={`existing-${idx}`}
                      className="relative w-24 h-24"
                    >
                      <img
                        src={getImageUrl(
                          img
                        )}
                        alt={`existing-${idx}`}
                        className="w-full h-full object-cover rounded-xl border shadow-sm"
                      />

                      <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded">
                        #{idx + 1}
                      </span>
                    </div>
                  )
                )}

                {galleryPreviews.map(
                  (src, idx) => (
                    <div
                      key={`new-${idx}`}
                      className="relative w-24 h-24"
                    >
                      <img
                        src={src}
                        alt={`new-${idx}`}
                        className="w-full h-full object-cover rounded-xl border shadow-sm"
                      />

                      <span className="absolute bottom-1 left-1 bg-orange-500 text-white text-[10px] px-1.5 py-0.5 rounded">
                        New #{idx + 1}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          removeNewImage(
                            idx
                          )
                        }
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                      >
                        <Trash2
                          size={12}
                        />
                      </button>
                    </div>
                  )
                )}

              </div>
            </div>

          </div>
        )}

        {/* COLORS */}

        {activeTab === "variants" && (
          <div className="space-y-6">

            <div className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">

              <label className="block text-sm font-semibold mb-4">
                Product Colors
              </label>

              {colors.map(
                (color, idx) => (
                  <div
                    key={idx}
                    className="mb-5 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                  >

                    <div className="flex gap-2 items-center">

                      <input
                        type="color"
                        value={
                          color.code ||
                          "#000000"
                        }
                        onChange={(e) =>
                          handleColorChange(
                            idx,
                            "code",
                            e.target.value
                          )
                        }
                        className="w-10 h-10 rounded border cursor-pointer p-1"
                      />

                      <input
                        type="text"
                        value={
                          color.name
                        }
                        onChange={(e) =>
                          handleColorChange(
                            idx,
                            "name",
                            e.target.value
                          )
                        }
                        className="flex-1 border border-gray-300 dark:border-slate-700 rounded-lg p-2 text-sm bg-white dark:bg-slate-800"
                        placeholder="Color Name"
                      />

                      <input
                        type="text"
                        value={
                          color.code
                        }
                        onChange={(e) =>
                          handleColorChange(
                            idx,
                            "code",
                            e.target.value
                          )
                        }
                        className="w-24 border border-gray-300 dark:border-slate-700 rounded-lg p-2 text-sm bg-white dark:bg-slate-800 uppercase"
                        placeholder="#ff0000"
                      />

                      {colors.length >
                        1 && (
                        <button
                          type="button"
                          onClick={() =>
                            removeColor(
                              idx
                            )
                          }
                          className="text-red-500 cursor-pointer"
                        >
                          <Trash2
                            size={18}
                          />
                        </button>
                      )}

                    </div>

                    {/* =========================================
                        THUMBNAIL IMAGE ASSIGNMENT
                    ========================================= */}

                    {(
                      thumbnailPreview ||
                      existingThumbnail
                    ) && (
                      <div className="mt-4">

                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                          Thumbnail image for{" "}
                          <strong>
                            {color.name ||
                              `Color ${
                                idx + 1
                              }`}
                          </strong>
                        </p>

                        <button
                          type="button"
                          onClick={() =>
                            toggleThumbnailColorImage(
                              idx
                            )
                          }
                          className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 ${
                            (
                              color.imageIndexes ||
                              []
                            ).includes(-1)
                              ? "border-orange-500 ring-2 ring-orange-500/30"
                              : "border-gray-200 dark:border-slate-700"
                          }`}
                        >

                          <img
                            src={
                              thumbnailPreview ||
                              getImageUrl(
                                existingThumbnail
                              )
                            }
                            alt="thumbnail"
                            className="w-full h-full object-cover"
                          />

                          <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded">
                            Thumbnail
                          </span>

                          {(
                            color.imageIndexes ||
                            []
                          ).includes(-1) && (
                            <span className="absolute inset-0 bg-orange-500/20 flex items-center justify-center">

                              <span className="bg-orange-500 text-white rounded-full p-1">
                                <Check
                                  size={13}
                                />
                              </span>

                            </span>
                          )}

                        </button>

                      </div>
                    )}

                    {/* =========================================
                        EXISTING IMAGE ASSIGNMENT
                    ========================================= */}

                    {allExistingImages.length >
                      0 && (
                      <div className="mt-4">

                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                          Existing images for{" "}
                          <strong>
                            {color.name ||
                              `Color ${
                                idx + 1
                              }`}
                          </strong>
                        </p>

                        <div className="flex flex-wrap gap-2">

                          {allExistingImages.map(
                            (
                              image,
                              imageIndex
                            ) => {
                              const selected =
                                (
                                  color.images ||
                                  []
                                ).includes(
                                  image.value
                                );

                              return (
                                <button
                                  key={
                                    imageIndex
                                  }
                                  type="button"
                                  onClick={() =>
                                    toggleExistingColorImage(
                                      idx,
                                      image.value
                                    )
                                  }
                                  className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 ${
                                    selected
                                      ? "border-orange-500 ring-2 ring-orange-500/30"
                                      : "border-gray-200 dark:border-slate-700"
                                  }`}
                                >

                                  <img
                                    src={
                                      image.src
                                    }
                                    alt="color"
                                    className="w-full h-full object-cover"
                                  />

                                  <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded">
                                    #{imageIndex + 1}
                                  </span>

                                  {selected && (
                                    <span className="absolute inset-0 bg-orange-500/20 flex items-center justify-center">

                                      <span className="bg-orange-500 text-white rounded-full p-1">
                                        <Check
                                          size={13}
                                        />
                                      </span>

                                    </span>
                                  )}

                                </button>
                              );
                            }
                          )}

                        </div>
                      </div>
                    )}

                    {/* =========================================
                        NEW IMAGE ASSIGNMENT
                    ========================================= */}

                    {allNewImages.length >
                      0 && (
                      <div className="mt-4">

                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                          New images for{" "}
                          <strong>
                            {color.name ||
                              `Color ${
                                idx + 1
                              }`}
                          </strong>
                        </p>

                        <div className="flex flex-wrap gap-2">

                          {allNewImages.map(
                            (
                              image,
                              imageIndex
                            ) => {
                              const combinedIndex =
                                existingImages.length +
                                imageIndex;

                              const selected =
                                (
                                  color.imageIndexes ||
                                  []
                                ).includes(
                                  combinedIndex
                                );

                              return (
                                <button
                                  key={
                                    imageIndex
                                  }
                                  type="button"
                                  onClick={() =>
                                    toggleNewColorImage(
                                      idx,
                                      imageIndex
                                    )
                                  }
                                  className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 ${
                                    selected
                                      ? "border-orange-500 ring-2 ring-orange-500/30"
                                      : "border-gray-200 dark:border-slate-700"
                                  }`}
                                >

                                  <img
                                    src={
                                      image.src
                                    }
                                    alt="new color"
                                    className="w-full h-full object-cover"
                                  />

                                  <span className="absolute bottom-1 left-1 bg-orange-500 text-white text-[10px] px-1.5 py-0.5 rounded">
                                    New #
                                    {imageIndex +
                                      1}
                                  </span>

                                  {selected && (
                                    <span className="absolute inset-0 bg-orange-500/20 flex items-center justify-center">

                                      <span className="bg-orange-500 text-white rounded-full p-1">
                                        <Check
                                          size={13}
                                        />
                                      </span>

                                    </span>
                                  )}

                                </button>
                              );
                            }
                          )}

                        </div>
                      </div>
                    )}

                  </div>
                )
              )}

              <button
                type="button"
                onClick={addColor}
                className="text-xs font-semibold text-orange-500 flex items-center gap-1 mt-2 cursor-pointer"
              >
                <Plus size={14} />
                Add More Color
              </button>

            </div>

            {/* SIZES */}

            <div className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">

              <label className="block text-sm font-semibold mb-3">
                Product Sizes
              </label>

              {sizes.map(
                (size, idx) => (
                  <div
                    key={idx}
                    className="flex gap-2 mb-2 items-center"
                  >

                    <input
                      type="text"
                      value={size}
                      onChange={(e) =>
                        handleSizeChange(
                          idx,
                          e.target.value
                        )
                      }
                      className="w-full border border-gray-300 dark:border-slate-700 rounded-lg p-2 text-sm bg-white dark:bg-slate-800"
                      placeholder="e.g. Medium - 54"
                    />

                    {sizes.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          removeSize(
                            idx
                          )
                        }
                        className="text-red-500 cursor-pointer"
                      >
                        <Trash2
                          size={18}
                        />
                      </button>
                    )}

                  </div>
                )
              )}

              <button
                type="button"
                onClick={addSize}
                className="text-xs font-semibold text-orange-500 flex items-center gap-1 mt-2 cursor-pointer"
              >
                <Plus size={14} />
                Add More Size
              </button>

            </div>

          </div>
        )}

        {/* PLACEMENT */}

        {activeTab === "placement" && (
          <div className="p-6 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">

            <label className="block text-sm font-semibold mb-4">
              Product Placement & Sections
            </label>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="hasCustomSize"
                  checked={
                    formData.hasCustomSize
                  }
                  onChange={handleChange}
                  className="w-4 h-4 text-orange-500 rounded"
                />
                <span>
                  Has Custom Size
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="isFlashSale"
                  checked={
                    formData.isFlashSale
                  }
                  onChange={handleChange}
                  className="w-4 h-4 text-orange-500 rounded"
                />
                <span>
                  Flash Sale
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="isBestSelling"
                  checked={
                    formData.isBestSelling
                  }
                  onChange={handleChange}
                  className="w-4 h-4 text-orange-500 rounded"
                />
                <span>
                  Best Selling
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="isNewArrival"
                  checked={
                    formData.isNewArrival
                  }
                  onChange={handleChange}
                  className="w-4 h-4 text-orange-500 rounded"
                />
                <span>
                  New Arrival
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="isHotProductBanner"
                  checked={
                    formData.isHotProductBanner
                  }
                  onChange={handleChange}
                  className="w-4 h-4 text-orange-500 rounded"
                />
                <span>
                  Hot Banner
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="isHotProductSection2"
                  checked={
                    formData.isHotProductSection2
                  }
                  onChange={handleChange}
                  className="w-4 h-4 text-orange-500 rounded"
                />
                <span>
                  Hot Section 2
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="isExploreProduct"
                  checked={
                    formData.isExploreProduct
                  }
                  onChange={handleChange}
                  className="w-4 h-4 text-orange-500 rounded"
                />
                <span>
                  Explore Product
                </span>
              </label>

            </div>
          </div>
        )}

        {/* SUBMIT */}

        <div className="flex justify-end pt-6 border-t border-slate-200 dark:border-slate-800">

          <button
            type="submit"
            disabled={updating}
            className="w-full px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-xl transition shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >

            {updating && (
              <Loader2
                className="animate-spin"
                size={18}
              />
            )}

            {updating
              ? "Updating Product..."
              : "Update Product"}

          </button>

        </div>

      </form>
    </div>
  );
}