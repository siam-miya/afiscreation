'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Loader2, X, Check } from 'lucide-react';

export default function AddProductPage() {
  const router = useRouter();

  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [activeTab, setActiveTab] = useState('basics');

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    sku: '',
    brand: '',
    shortDescription: '',
    description: '',
    price: '',
    discountPrice: '',
    costPrice: '',
    stock: '',
    category: '',
    stockStatus: 'in-stock',

    isFlashSale: false,
    isBestSelling: false,
    isNewArrival: false,
    isHotProductBanner: false,
    isHotProductSection2: false,
    isExploreProduct: true,

    hasCustomSize: false,

    metaTitle: '',
    metaDescription: '',
  });

  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState('');

  const [extraImages, setExtraImages] = useState([]);
  const [extraImagePreviews, setExtraImagePreviews] = useState([]);

  const [sizeChartFile, setSizeChartFile] = useState(null);
  const [sizeChartPreview, setSizeChartPreview] = useState('');

  const [colors, setColors] = useState([
    {
      name: '',
      code: '#000000',
      imageIndexes: [],
    },
  ]);

  const [sizes, setSizes] = useState(['']);

  const [customizationUnit, setCustomizationUnit] =
    useState('inch');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL ||
          'http://localhost:5000';

        const res = await fetch(
          `${apiUrl}/api/v1/categories/all`
        );

        if (!res.ok) {
          throw new Error(
            `Server returned status: ${res.status}`
          );
        }

        const result = await res.json();

        if (
          result.success &&
          Array.isArray(result.data)
        ) {
          setCategories(result.data);
        } else if (Array.isArray(result)) {
          setCategories(result);
        }
      } catch (error) {
        console.error(
          'Error fetching categories:',
          error
        );
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  const handleTitleChange = (e) => {
    const title = e.target.value;

    const slug = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    setFormData((prev) => ({
      ...prev,
      title,
      slug,
      metaTitle: prev.metaTitle || title,
    }));
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
        type === 'checkbox'
          ? checked
          : value,
    }));
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setThumbnailFile(file);

    setThumbnailPreview(
      URL.createObjectURL(file)
    );
  };

  const handleSizeChartChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setSizeChartFile(file);

    setSizeChartPreview(
      URL.createObjectURL(file)
    );
  };

  const handleExtraImagesChange = (e) => {
    const files = Array.from(
      e.target.files || []
    );

    if (!files.length) return;

    if (
      extraImagePreviews.length +
        files.length >
      4
    ) {
      alert(
        'সর্বোচ্চ ৪টি অতিরিক্ত ছবি আপলোড করা যাবে।'
      );

      e.target.value = '';

      return;
    }

    setExtraImages((prev) => [
      ...prev,
      ...files,
    ]);

    setExtraImagePreviews((prev) => [
      ...prev,
      ...files.map((file) =>
        URL.createObjectURL(file)
      ),
    ]);

    e.target.value = '';
  };

  const removeExtraImage = (index) => {
    setExtraImagePreviews((prev) =>
      prev.filter((_, i) => i !== index)
    );

    setExtraImages((prev) =>
      prev.filter((_, i) => i !== index)
    );

    setColors((prev) =>
      prev.map((color) => ({
        ...color,

        imageIndexes: (
          color.imageIndexes || []
        )
          .filter(
            (imageIndex) =>
              imageIndex !== index
          )
          .map((imageIndex) =>
            imageIndex > index
              ? imageIndex - 1
              : imageIndex
          ),
      }))
    );
  };

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
        name: '',
        code: '#000000',
        imageIndexes: [],
      },
    ]);
  };

  const removeColor = (index) => {
    setColors((prev) =>
      prev.filter(
        (_, i) => i !== index
      )
    );
  };

  const toggleColorImage = (
    colorIndex,
    imageIndex
  ) => {
    setColors((prev) =>
      prev.map((color, index) => {
        if (index !== colorIndex) {
          return color;
        }

        const currentIndexes =
          Array.isArray(
            color.imageIndexes
          )
            ? color.imageIndexes
            : [];

        const alreadySelected =
          currentIndexes.includes(
            imageIndex
          );

        return {
          ...color,

          imageIndexes:
            alreadySelected
              ? currentIndexes.filter(
                  (item) =>
                    item !== imageIndex
                )
              : [
                  ...currentIndexes,
                  imageIndex,
                ],
        };
      })
    );
  };

  const handleSizeChange = (
    index,
    value
  ) => {
    const updated = [...sizes];

    updated[index] = value;

    setSizes(updated);
  };

  const addSize = () => {
    setSizes((prev) => [
      ...prev,
      '',
    ]);
  };

  const removeSize = (index) => {
    setSizes((prev) =>
      prev.filter(
        (_, i) => i !== index
      )
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const data = new FormData();

      /*
        BASIC FORM DATA
      */

      Object.keys(formData).forEach(
        (key) => {
          data.append(
            key,
            String(
              formData[key]
            )
          );
        }
      );

      /*
        COLORS
      */

      const filteredColors =
        colors
          .filter(
            (color) =>
              color.name &&
              color.name.trim() !== ''
          )
          .map((color) => ({
            name: color.name.trim(),

            code: color.code
              ? color.code
                  .trim()
                  .toUpperCase()
              : '#000000',

            imageIndexes:
              Array.isArray(
                color.imageIndexes
              )
                ? color.imageIndexes
                : [],
          }));

      /*
        SIZES
      */

      const filteredSizes =
        sizes
          .filter(
            (size) =>
              size &&
              size.trim() !== ''
          )
          .map((size) =>
            size.trim()
          );

      data.append(
        'colors',
        JSON.stringify(
          filteredColors
        )
      );

      data.append(
        'sizes',
        JSON.stringify(
          filteredSizes
        )
      );

      /*
        CUSTOM MEASUREMENT

        hasCustomSize is already
        included above from formData.

        Only customizationUnit
        needs to be added separately.
      */

      data.append(
        'customizationUnit',
        customizationUnit
      );

      /*
        THUMBNAIL
      */

      if (thumbnailFile) {
        data.append(
          'thumbnail',
          thumbnailFile
        );
      }

      /*
        SIZE CHART
      */

      if (sizeChartFile) {
        data.append(
          'sizeChartImage',
          sizeChartFile
        );
      }

      /*
        EXTRA IMAGES
      */

      extraImages.forEach(
        (file) => {
          data.append(
            'images',
            file
          );
        }
      );

      /*
        API URL
      */

      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL ||
        'http://localhost:5000';

      /*
        CREATE PRODUCT
      */

      const res = await fetch(
        `${apiUrl}/api/products`,
        {
          method: 'POST',
          body: data,
        }
      );

      const result =
        await res.json();

      if (!res.ok || !result.success) {
        throw new Error(
          result.message ||
            'Failed to create product'
        );
      }

      /*
        DEBUG SUCCESS RESPONSE
      */

      console.log(
        'Product created successfully:',
        result.data
      );

      console.log(
        'hasCustomSize:',
        result.data?.hasCustomSize
      );

      console.log(
        'customizationUnit:',
        result.data?.customizationUnit
      );

      setSuccessMsg(
        'Product added successfully!'
      );

      setTimeout(() => {
        router.push(
          '/secret-admin-portal-afia/dashboard/products'
        );
      }, 1200);

    } catch (err) {
      console.error(
        'Create product error:',
        err
      );

      setErrorMsg(
        err.message ||
          'Something went wrong'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const tabs = [
    {
      id: 'basics',
      label: 'Basics',
    },
    {
      id: 'images',
      label: 'Images',
    },
    {
      id: 'pricing',
      label: 'Pricing & Stock',
    },
    {
      id: 'variants',
      label: 'Colours & Variants',
    },
    {
      id: 'display',
      label: 'Display & SEO',
    },
  ];

  return (
    <div className="mx-auto w-full max-w-5xl rounded-2xl border border-slate-200 bg-white p-3 text-slate-900 shadow-xl transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900 dark:text-white sm:p-4 md:p-6 lg:p-8 font-poppins">

      {/* HEADER */}

      <div className="mb-5 border-b border-slate-200 pb-4 dark:border-slate-800 sm:mb-6">

        <h2 className="text-xl font-bold sm:text-2xl">
          Create Product
        </h2>

        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
          Add a new product to your
          store catalogue.
        </p>

      </div>

      {/* ERROR */}

      {errorMsg && (
        <div className="mb-5 rounded-xl border border-rose-500/35 bg-rose-500/15 p-3 text-xs text-rose-500 dark:text-rose-400 sm:mb-6 sm:p-4 sm:text-sm">
          {errorMsg}
        </div>
      )}

      {/* SUCCESS */}

      {successMsg && (
        <div className="mb-5 rounded-xl border border-emerald-500/35 bg-emerald-500/15 p-3 text-xs text-emerald-600 dark:text-emerald-400 sm:mb-6 sm:p-4 sm:text-sm">
          {successMsg}
        </div>
      )}

      {/* TABS */}

      <div className="mb-5 overflow-x-auto border-b border-slate-200 pb-3 dark:border-slate-800 sm:mb-6">

        <div className="flex min-w-max gap-2">

          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() =>
                setActiveTab(tab.id)
              }
              className={`rounded-lg px-3 py-2 text-xs font-medium transition sm:px-4 sm:text-sm ${
                activeTab === tab.id
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}

        </div>

      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 sm:space-y-6"
      >

        {/* ================= BASICS ================= */}

        {activeTab === 'basics' && (
          <div className="space-y-5 sm:space-y-6">

            <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">

              <div>

                <label className="mb-2 block text-xs font-medium sm:text-sm">
                  Name *
                </label>

                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={
                    handleTitleChange
                  }
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:ring-2 focus:ring-orange-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white sm:px-4"
                  placeholder="Product Name"
                />

              </div>

              <div>

                <label className="mb-2 block text-xs font-medium sm:text-sm">
                  Slug *
                </label>

                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={
                    handleChange
                  }
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-100 px-3 py-2.5 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400 sm:px-4"
                  placeholder="product-url-slug"
                />

              </div>

            </div>

            <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-3">

              <div>

                <label className="mb-2 block text-xs font-medium sm:text-sm">
                  Category *
                </label>

                <select
                  name="category"
                  value={
                    formData.category
                  }
                  onChange={
                    handleChange
                  }
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white sm:px-4"
                >

                  <option value="">
                    -- Choose Category --
                  </option>

                  {categories.map(
                    (cat) => {
                      const subCategories =
                        cat.subcategories ||
                        cat.children ||
                        [];

                      return (
                        <optgroup
                          key={
                            cat._id ||
                            cat.name
                          }
                          label={`📁 ${cat.name} (Main)`}
                        >

                          <option
                            value={
                              cat.name
                            }
                          >
                            {cat.name}{' '}
                            (Main)
                          </option>

                          {subCategories.map(
                            (sub) => {
                              const subName =
                                typeof sub ===
                                'string'
                                  ? sub
                                  : sub.name ||
                                    sub.title;

                              return (
                                <option
                                  key={
                                    sub._id ||
                                    subName
                                  }
                                  value={
                                    subName
                                  }
                                >
                                  &nbsp;&nbsp;&nbsp;&nbsp;╰─{' '}
                                  {subName}
                                </option>
                              );
                            }
                          )}

                        </optgroup>
                      );
                    }
                  )}

                </select>

                {loadingCategories && (
                  <p className="mt-1 text-[11px] text-slate-500">
                    Loading categories...
                  </p>
                )}

              </div>

              <div>

                <label className="mb-2 block text-xs font-medium sm:text-sm">
                  SKU
                </label>

                <input
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={
                    handleChange
                  }
                  placeholder="e.g. SKU-101"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white sm:px-4"
                />

              </div>

              <div>

                <label className="mb-2 block text-xs font-medium sm:text-sm">
                  Brand
                </label>

                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={
                    handleChange
                  }
                  placeholder="Brand name (Optional)"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white sm:px-4"
                />

              </div>

            </div>

            <div>

              <label className="mb-2 block text-xs font-medium sm:text-sm">
                Short Description
              </label>

              <textarea
                name="shortDescription"
                value={
                  formData.shortDescription
                }
                onChange={
                  handleChange
                }
                rows="2"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white sm:px-4"
                placeholder="Used on product cards..."
              />

            </div>

            <div>

              <label className="mb-2 block text-xs font-medium sm:text-sm">
                Description *
              </label>

              <textarea
                name="description"
                value={
                  formData.description
                }
                onChange={
                  handleChange
                }
                rows="4"
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white sm:px-4"
                placeholder="Write detailed product specifications..."
              />

            </div>

          </div>
        )}

        {/* ================= IMAGES ================= */}

        {activeTab === 'images' && (
          <div className="space-y-5 sm:space-y-6">

            <div>

              <label className="mb-2 block text-xs font-medium sm:text-sm">
                Thumbnail Image (Main) *
              </label>

              <input
                type="file"
                accept="image/*"
                onChange={
                  handleThumbnailChange
                }
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 sm:text-sm"
              />

              {thumbnailPreview && (
                <div className="mt-3 flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/50 sm:flex-row sm:items-center">

                  <img
                    src={thumbnailPreview}
                    alt="thumb"
                    className="h-24 w-24 rounded-lg border border-orange-500 object-cover"
                  />

                  <div>

                    <p className="text-xs font-medium text-orange-500 dark:text-orange-400">
                      Product Thumbnail
                    </p>

                    <p className="mt-1 max-w-md text-[11px] leading-5 text-slate-500 dark:text-slate-400">
                      This image will be shown
                      first on the Product
                      Details page.
                    </p>

                  </div>

                </div>
              )}

            </div>

            {/* SIZE CHART */}

            <div>

              <label className="mb-2 block text-xs font-medium sm:text-sm">
                Size Chart Image
              </label>

              <input
                type="file"
                accept="image/*"
                onChange={
                  handleSizeChartChange
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 sm:text-sm"
              />

              {sizeChartPreview && (
                <div className="mt-3 flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/50 sm:flex-row sm:items-center">

                  <img
                    src={sizeChartPreview}
                    alt="size chart"
                    className="h-32 w-32 rounded-lg border border-orange-500 bg-white object-contain"
                  />

                  <div>

                    <p className="text-xs font-medium text-orange-500 dark:text-orange-400">
                      Size Chart
                    </p>

                    <p className="mt-1 max-w-md text-[11px] leading-5 text-slate-500 dark:text-slate-400">
                      Customers will be able to
                      view this image from the
                      Product Details page.
                    </p>

                  </div>

                </div>
              )}

            </div>

            <div>

              <label className="mb-2 block text-xs font-medium sm:text-sm">
                Additional Images (Max 4)
              </label>

              <input
                type="file"
                accept="image/*"
                multiple
                onChange={
                  handleExtraImagesChange
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 sm:text-sm"
              />

              <div className="mt-3 flex flex-wrap gap-3">

                {extraImagePreviews.map(
                  (
                    src,
                    idx
                  ) => (
                    <div
                      key={idx}
                      className="relative h-20 w-20"
                    >

                      <img
                        src={src}
                        alt={`extra-${idx}`}
                        className="h-full w-full rounded-lg border border-slate-200 object-cover dark:border-slate-700"
                      />

                      <span className="absolute bottom-1 left-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] text-white">
                        #{idx + 1}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          removeExtraImage(
                            idx
                          )
                        }
                        className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white shadow-md"
                      >
                        <X
                          size={12}
                        />
                      </button>

                    </div>
                  )
                )}

              </div>

              {extraImagePreviews.length >
                0 && (
                <p className="mt-3 text-xs leading-5 text-slate-500 dark:text-slate-400">
                  These images can be
                  assigned to specific
                  colours from the
                  <span className="text-orange-500 dark:text-orange-400">
                    {' '}
                    Colours & Variants
                  </span>{' '}
                  tab.
                </p>
              )}

            </div>

          </div>
        )}

        {/* ================= PRICING ================= */}

        {activeTab === 'pricing' && (
          <div className="space-y-5 sm:space-y-6">

            <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-3">

              <div>

                <label className="mb-2 block text-xs font-medium sm:text-sm">
                  Price (৳) *
                </label>

                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={
                    handleChange
                  }
                  required
                  min="0"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white sm:px-4"
                  placeholder="1500"
                />

              </div>

              <div>

                <label className="mb-2 block text-xs font-medium sm:text-sm">
                  Compare-at price (৳)
                </label>

                <input
                  type="number"
                  name="discountPrice"
                  value={
                    formData.discountPrice
                  }
                  onChange={
                    handleChange
                  }
                  min="0"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white sm:px-4"
                  placeholder="1200"
                />

              </div>

              <div>

                <label className="mb-2 block text-xs font-medium sm:text-sm">
                  Cost price (৳)
                </label>

                <input
                  type="number"
                  name="costPrice"
                  value={formData.costPrice}
                  onChange={
                    handleChange
                  }
                  min="0"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white sm:px-4"
                  placeholder="1000"
                />

              </div>

            </div>

            <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">

              <div>

                <label className="mb-2 block text-xs font-medium sm:text-sm">
                  Stock Quantity *
                </label>

                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={
                    handleChange
                  }
                  required
                  min="0"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white sm:px-4"
                  placeholder="50"
                />

              </div>

              <div>

                <label className="mb-2 block text-xs font-medium sm:text-sm">
                  Stock Status *
                </label>

                <select
                  name="stockStatus"
                  value={
                    formData.stockStatus
                  }
                  onChange={
                    handleChange
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white sm:px-4"
                >

                  <option value="in-stock">
                    In stock
                  </option>

                  <option value="out-of-stock">
                    Out of stock
                  </option>

                </select>

              </div>

            </div>

            {/* CUSTOM MEASUREMENT */}

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/50 sm:p-4">

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div className="min-w-0">

                  <h3 className="text-sm font-semibold">
                    Custom Product Measurement
                  </h3>

                  <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500 dark:text-slate-400">
                    Allow customers to provide
                    their own Length, Height
                    and Width measurements.
                  </p>

                </div>

                <label className="flex shrink-0 cursor-pointer items-center gap-2">

                  <input
                    type="checkbox"
                    name="hasCustomSize"
                    checked={
                      formData.hasCustomSize
                    }
                    onChange={
                      handleChange
                    }
                    className="h-4 w-4 rounded accent-orange-500"
                  />

                  <span className="text-sm">
                    Enable
                  </span>

                </label>

              </div>

              {formData.hasCustomSize && (
                <div className="mt-5 space-y-4">

                  <div>

                    <label className="mb-2 block text-xs font-medium sm:text-sm">
                      Measurement Unit
                    </label>

                    <select
                      value={
                        customizationUnit
                      }
                      onChange={(e) =>
                        setCustomizationUnit(
                          e.target.value
                        )
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white sm:px-4"
                    >

                      <option value="inch">
                        Inch
                      </option>

                      <option value="cm">
                        Centimeter
                      </option>

                    </select>

                  </div>

                  <div className="rounded-lg border border-orange-500/20 bg-orange-500/10 p-3">

                    <div className="flex items-start gap-2">

                      <Check
                        size={16}
                        className="mt-0.5 shrink-0 text-orange-500 dark:text-orange-400"
                      />

                      <div>

                        <p className="text-xs font-medium text-orange-500 dark:text-orange-400">
                          Custom measurement enabled
                        </p>

                        <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                          Customer will be able to
                          enter Length, Height and
                          Width from the product page.
                        </p>

                        <p className="mt-1 text-xs text-emerald-500 dark:text-emerald-400">
                          No extra charge will be
                          added for customization.
                        </p>

                      </div>

                    </div>

                  </div>

                </div>
              )}

            </div>

          </div>
        )}

        {/* ================= VARIANTS ================= */}

        {activeTab === 'variants' && (
          <div className="space-y-5 sm:space-y-6">

            <div className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2">

              {/* COLORS */}

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/50 sm:p-4">

                <label className="mb-3 block text-sm font-semibold">
                  Product Colors
                </label>

                {colors.map(
                  (
                    color,
                    idx
                  ) => (
                    <div
                      key={idx}
                      className="mb-5 rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900"
                    >

                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">

                        <div className="flex items-center gap-2">

                          <input
                            type="color"
                            value={
                              color.code ||
                              '#000000'
                            }
                            onChange={(e) =>
                              handleColorChange(
                                idx,
                                'code',
                                e.target.value
                              )
                            }
                            className="h-10 w-10 shrink-0 cursor-pointer rounded border border-slate-300 bg-slate-100 p-1 dark:border-slate-700 dark:bg-slate-800"
                          />

                          <input
                            type="text"
                            value={
                              color.code
                            }
                            onChange={(e) =>
                              handleColorChange(
                                idx,
                                'code',
                                e.target.value
                              )
                            }
                            className="w-24 rounded border border-slate-200 bg-slate-50 p-2 text-sm uppercase text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white sm:hidden"
                            placeholder="#000000"
                          />

                        </div>

                        <input
                          type="text"
                          value={
                            color.name
                          }
                          onChange={(e) =>
                            handleColorChange(
                              idx,
                              'name',
                              e.target.value
                            )
                          }
                          className="min-w-0 flex-1 rounded border border-slate-200 bg-slate-50 p-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                          placeholder="Color Name (e.g. Black)"
                        />

                        <input
                          type="text"
                          value={
                            color.code
                          }
                          onChange={(e) =>
                            handleColorChange(
                              idx,
                              'code',
                              e.target.value
                            )
                          }
                          className="hidden w-24 rounded border border-slate-200 bg-slate-50 p-2 text-sm uppercase text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white sm:block"
                          placeholder="#000000"
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
                            className="flex h-9 w-9 shrink-0 items-center justify-center self-end rounded-lg text-red-500 transition hover:bg-red-50 dark:hover:bg-red-950/30 sm:self-auto"
                          >
                            <Trash2
                              size={18}
                            />
                          </button>
                        )}

                      </div>

                      {(thumbnailPreview ||
                        extraImagePreviews.length >
                          0) && (
                        <div className="mt-4">

                          <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">

                            Select image(s)
                            for{' '}

                            <span className="font-semibold text-slate-900 dark:text-white">

                              {color.name ||
                                `Color ${
                                  idx +
                                  1
                                }`}

                            </span>

                          </p>

                          <div className="flex flex-wrap gap-2">

                            {/* THUMBNAIL */}

                            {thumbnailPreview && (
                              <button
                                type="button"
                                onClick={() =>
                                  toggleColorImage(
                                    idx,
                                    -1
                                  )
                                }
                                className={`relative h-20 w-20 overflow-hidden rounded-lg border-2 transition-all ${
                                  (
                                    color.imageIndexes ||
                                    []
                                  ).includes(-1)
                                    ? 'border-orange-500 ring-2 ring-orange-500/30'
                                    : 'border-orange-400/60 hover:border-orange-400'
                                }`}
                              >

                                <img
                                  src={
                                    thumbnailPreview
                                  }
                                  alt="thumbnail"
                                  className="h-full w-full object-cover"
                                />

                                <span className="absolute left-0 right-0 top-0 bg-orange-500/90 px-1 py-1 text-center text-[9px] font-semibold text-white">
                                  THUMBNAIL
                                </span>

                                {(
                                  color.imageIndexes ||
                                  []
                                ).includes(-1) && (
                                  <span className="absolute inset-0 flex items-center justify-center bg-orange-500/20">

                                    <span className="rounded-full bg-orange-500 p-1 text-white">

                                      <Check
                                        size={
                                          12
                                        }
                                      />

                                    </span>

                                  </span>
                                )}

                              </button>
                            )}

                            {/* EXTRA IMAGES */}

                            {extraImagePreviews.map(
                              (
                                src,
                                imageIndex
                              ) => {

                                const selected =
                                  (
                                    color.imageIndexes ||
                                    []
                                  ).includes(
                                    imageIndex
                                  );

                                return (
                                  <button
                                    key={
                                      imageIndex
                                    }
                                    type="button"
                                    onClick={() =>
                                      toggleColorImage(
                                        idx,
                                        imageIndex
                                      )
                                    }
                                    className={`relative h-16 w-16 overflow-hidden rounded-lg border-2 transition-all ${
                                      selected
                                        ? 'border-orange-500 ring-2 ring-orange-500/30'
                                        : 'border-slate-200 hover:border-slate-400 dark:border-slate-700 dark:hover:border-slate-500'
                                    }`}
                                  >

                                    <img
                                      src={src}
                                      alt={`color-${imageIndex}`}
                                      className="h-full w-full object-cover"
                                    />

                                    <span className="absolute bottom-0 left-0 bg-black/70 px-1 text-[9px] text-white">
                                      #
                                      {imageIndex +
                                        1}
                                    </span>

                                    {selected && (
                                      <span className="absolute inset-0 flex items-center justify-center bg-orange-500/20">

                                        <span className="rounded-full bg-orange-500 p-1 text-white">

                                          <Check
                                            size={
                                              12
                                            }
                                          />

                                        </span>

                                      </span>
                                    )}

                                  </button>
                                );
                              }
                            )}

                          </div>

                          <p className="mt-2 text-[10px] text-slate-500">
                            {(
                              color.imageIndexes ||
                              []
                            ).length >
                            0
                              ? `${
                                  (
                                    color.imageIndexes ||
                                    []
                                  ).length
                                } image(s) selected`
                              : 'No image selected for this color.'}
                          </p>

                          <p className="mt-1 text-[10px] text-slate-500">
                            Thumbnail can also
                            be assigned to this
                            color.
                          </p>

                        </div>
                      )}

                    </div>
                  )
                )}

                <button
                  type="button"
                  onClick={
                    addColor
                  }
                  className="mt-1 flex items-center gap-1 text-xs font-semibold text-orange-500 hover:text-orange-600 dark:text-orange-400"
                >

                  <Plus
                    size={14}
                  />

                  Add More Color

                </button>

              </div>

              {/* SIZES */}

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/50 sm:p-4">

                <label className="mb-2 block text-sm font-semibold">
                  Product Sizes
                </label>

                {sizes.map(
                  (
                    size,
                    idx
                  ) => (
                    <div
                      key={idx}
                      className="mb-2 flex items-center gap-2"
                    >

                      <input
                        type="text"
                        value={
                          size
                        }
                        onChange={(e) =>
                          handleSizeChange(
                            idx,
                            e.target.value
                          )
                        }
                        className="min-w-0 w-full rounded border border-slate-200 bg-white p-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        placeholder="e.g. Medium"
                      />

                      {sizes.length >
                        1 && (
                        <button
                          type="button"
                          onClick={() =>
                            removeSize(
                              idx
                            )
                          }
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
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
                  onClick={
                    addSize
                  }
                  className="mt-1 flex items-center gap-1 text-xs font-semibold text-orange-500 hover:text-orange-600 dark:text-orange-400"
                >

                  <Plus
                    size={14}
                  />

                  Add More Size

                </button>

              </div>

            </div>

          </div>
        )}

        {/* ================= DISPLAY & SEO ================= */}

        {activeTab === 'display' && (
          <div className="space-y-5 sm:space-y-6">

            {/* PRODUCT PLACEMENT */}

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/50 sm:p-4">

              <label className="mb-3 block text-sm font-semibold">
                Product Placement & Sections
              </label>

              <div className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-2 sm:text-sm md:grid-cols-3">

                {/* FLASH SALE */}

                <label className="flex min-w-0 cursor-pointer items-center gap-2">

                  <input
                    type="checkbox"
                    name="isFlashSale"
                    checked={
                      formData.isFlashSale
                    }
                    onChange={
                      handleChange
                    }
                    className="h-4 w-4 shrink-0 rounded accent-orange-500"
                  />

                  <span>
                    Flash Sale
                  </span>

                </label>

                {/* BEST SELLING */}

                <label className="flex min-w-0 cursor-pointer items-center gap-2">

                  <input
                    type="checkbox"
                    name="isBestSelling"
                    checked={
                      formData.isBestSelling
                    }
                    onChange={
                      handleChange
                    }
                    className="h-4 w-4 shrink-0 rounded accent-orange-500"
                  />

                  <span>
                    Best Selling
                  </span>

                </label>

                {/* NEW ARRIVAL */}

                <label className="flex min-w-0 cursor-pointer items-center gap-2">

                  <input
                    type="checkbox"
                    name="isNewArrival"
                    checked={
                      formData.isNewArrival
                    }
                    onChange={
                      handleChange
                    }
                    className="h-4 w-4 shrink-0 rounded accent-orange-500"
                  />

                  <span>
                    New Arrival
                  </span>

                </label>

                {/* HOT PRODUCT BANNER */}

                <label className="flex min-w-0 cursor-pointer items-center gap-2">

                  <input
                    type="checkbox"
                    name="isHotProductBanner"
                    checked={
                      formData.isHotProductBanner
                    }
                    onChange={
                      handleChange
                    }
                    className="h-4 w-4 shrink-0 rounded accent-orange-500"
                  />

                  <span className="break-words">
                    Hot Product Banner
                  </span>

                </label>

                {/* HOT PRODUCT SECTION 2 */}

                <label className="flex min-w-0 cursor-pointer items-center gap-2">

                  <input
                    type="checkbox"
                    name="isHotProductSection2"
                    checked={
                      formData.isHotProductSection2
                    }
                    onChange={
                      handleChange
                    }
                    className="h-4 w-4 shrink-0 rounded accent-orange-500"
                  />

                  <span className="break-words">
                    Hot Product Section 2
                  </span>

                </label>

                {/* EXPLORE PRODUCT */}

                <label className="flex min-w-0 cursor-pointer items-center gap-2">

                  <input
                    type="checkbox"
                    name="isExploreProduct"
                    checked={
                      formData.isExploreProduct
                    }
                    onChange={
                      handleChange
                    }
                    className="h-4 w-4 shrink-0 rounded accent-orange-500"
                  />

                  <span>
                    Explore Product
                  </span>

                </label>

              </div>

            </div>

            {/* SEO */}

            <div className="space-y-4 pt-1 sm:pt-2">

              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 sm:text-md">
                Search Engines (SEO)
              </h3>

              <div>

                <label className="mb-2 block text-xs font-medium sm:text-sm">
                  Meta title
                </label>

                <input
                  type="text"
                  name="metaTitle"
                  value={
                    formData.metaTitle
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Falls back to the product name."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white sm:px-4"
                />

              </div>

              <div>

                <label className="mb-2 block text-xs font-medium sm:text-sm">
                  Meta description
                </label>

                <textarea
                  name="metaDescription"
                  value={
                    formData.metaDescription
                  }
                  onChange={
                    handleChange
                  }
                  rows="3"
                  placeholder="Falls back to the short description."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white sm:px-4"
                />

              </div>

            </div>

          </div>
        )}

        {/* ================= SUBMIT ================= */}

        <div className="flex flex-col gap-3 border-t border-slate-200 pt-5 dark:border-slate-800 sm:flex-row sm:justify-end sm:pt-6">

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:px-8"
          >

            {submitting && (
              <Loader2
                className="animate-spin"
                size={18}
              />
            )}

            {submitting
              ? 'Publishing...'
              : 'Create Product'}

          </button>

        </div>

      </form>
    </div>
  );
}

