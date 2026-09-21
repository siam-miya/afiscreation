'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { PlusCircle, Trash2, FolderTree, Image as ImageIcon } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function AdminCategories() {
  const [name, setName] = useState('');
  const [parent, setParent] = useState('');
  const [icon, setIcon] = useState(null);
  const [iconPreview, setIconPreview] = useState(null);
  const [mainCategories, setMainCategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      const mainRes = await axios.get(`${API_BASE_URL}/api/v1/categories/main-categories`);
      if (mainRes.data.success) {
        setMainCategories(mainRes.data.data);
      }

      const allRes = await axios.get(`${API_BASE_URL}/api/v1/categories/all`);
      if (allRes.data.success) {
        setCategories(allRes.data.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setIcon(file);
      setIconPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation Check
    if (!parent && !icon) {
      return toast.warning('Main category icon is required!');
    }

    if (!name.trim()) {
      return toast.warning('Please provide a category name!');
    }

    const formData = new FormData();

    formData.append('name', name);

    if (icon) {
      formData.append('icon', icon);
    }

    if (parent && parent !== "") {
      formData.append('parent', parent);
    }

    try {
      setLoading(true);

      // 🟢 'Content-Type' ম্যানুয়ালি বাদ দিয়ে সরাসরি FormData পাঠানো হচ্ছে
      const res = await axios.post(
        `${API_BASE_URL}/api/v1/categories/create`,
        formData,
        {
          withCredentials: true
        }
      );

      if (res.data.success) {
        toast.success(
          res.data.message ||
          'Category created successfully!'
        );

        setName('');
        setParent('');
        setIcon(null);
        setIconPreview(null);

        if (
          document.getElementById(
            'categoryIconInput'
          )
        ) {
          document.getElementById(
            'categoryIconInput'
          ).value = '';
        }

        fetchData();
      }
    } catch (error) {
      console.error(
        'Upload Error:',
        error
      );

      toast.error(
        error.response?.data?.message ||
        'Failed to create category'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (
    id,
    catName
  ) => {
    if (
      !confirm(
        `Are you sure to delete "${catName}"?`
      )
    ) {
      return;
    }

    try {
      const res = await axios.delete(
        `${API_BASE_URL}/api/v1/categories/delete/${id}`,
        {
          withCredentials: true
        }
      );

      if (res.data.success) {
        toast.success(
          'Category deleted successfully!'
        );

        fetchData();
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
        'Failed to delete category'
      );
    }
  };

  const getImageUrl = (path) => {
    if (!path) return '';

    return path.startsWith('http')
      ? path
      : `${API_BASE_URL}${path}`;
  };

  return (
    <div className="admin-category-page w-full space-y-5 pb-10 font-poppins sm:space-y-6 md:space-y-8">


      {/* ================================= */}
      {/* PAGE HEADER */}
      {/* ================================= */}

      <div className="rounded-2xl border border-slate-800 bg-[#1e293b] p-4 shadow-xl sm:p-5 md:p-6">

        <h1 className="flex items-start gap-2.5 text-lg font-bold text-white sm:text-xl md:text-2xl">

          <FolderTree
            className="mt-0.5 shrink-0 text-orange-400"
            size={24}
          />

          <span className="leading-7">
            Category & Subcategory Management
          </span>

        </h1>

        <p className="mt-2 max-w-3xl text-[11px] leading-5 text-slate-400 sm:text-xs">
          First create a Main Category, then select it to create Subcategories under it.
        </p>

      </div>


      {/* ================================= */}
      {/* MAIN CONTENT */}
      {/* ================================= */}

      <div className="grid grid-cols-1 gap-5 sm:gap-6 lg:grid-cols-3 lg:gap-8">


        {/* ================================= */}
        {/* FORM */}
        {/* ================================= */}

        <div className="h-fit rounded-2xl border border-slate-800 bg-[#1e293b] p-4 shadow-xl sm:p-5 md:p-6 lg:col-span-1">

          <h2 className="mb-4 flex items-center gap-2 border-b border-slate-700 pb-3 text-base font-semibold text-orange-400 sm:text-lg">

            <PlusCircle
              size={19}
              className="shrink-0"
            />

            <span>
              Add Category
            </span>

          </h2>


          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >


            {/* Parent Category */}

            <div>

              <label className="mb-1.5 block text-xs font-medium text-slate-300">
                Parent Category (Optional)
              </label>

              <select
                value={parent}
                onChange={(e) =>
                  setParent(e.target.value)
                }
                className="w-full rounded-xl border border-slate-700 bg-[#0f172a] px-3 py-2.5 text-sm text-white outline-none transition focus:border-orange-500 sm:px-4"
              >

                <option
                  value=""
                  className="bg-[#0f172a] text-white"
                >
                  -- None (Make Main Category) --
                </option>

                {mainCategories.map(
                  (cat) => (
                    <option
                      key={cat._id}
                      value={cat._id}
                      className="bg-[#0f172a] text-white"
                    >
                      {cat.name}
                    </option>
                  )
                )}

              </select>

              <span className="mt-1 block text-[10px] leading-4 text-slate-400 sm:text-[11px]">
                Leave blank to create a Main Category.
              </span>

            </div>


            {/* Category Name */}

            <div>

              <label className="mb-1.5 block text-xs font-medium text-slate-300">
                Category Name *
              </label>

              <input
                type="text"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                placeholder="e.g. Electronics, Panjabi"
                className="w-full rounded-xl border border-slate-700 bg-[#0f172a] px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-orange-500 sm:px-4"
                required
              />

            </div>


            {/* Category Icon */}

            <div>

              <label className="mb-1.5 block text-xs font-medium text-slate-300">

                Category Icon{' '}

                {parent
                  ? '(Optional for Subcategory)'
                  : '*'}

              </label>


              <input
                id="categoryIconInput"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full cursor-pointer text-[10px] text-slate-400 file:mr-2 file:rounded-xl file:border-0 file:bg-orange-500 file:px-3 file:py-2 file:text-[10px] file:font-semibold file:text-white hover:file:bg-orange-600 sm:text-xs sm:file:mr-3 sm:file:px-4 sm:file:text-xs"
                required={!parent}
              />


              {/* Image Preview */}

              {iconPreview && (

                <div className="mt-3 flex min-w-0 items-center gap-3 rounded-xl border border-slate-700 bg-[#0f172a] p-2.5">

                  <img
                    src={iconPreview}
                    alt="Preview"
                    className="h-10 w-10 shrink-0 rounded-lg border border-slate-600 object-cover"
                  />

                  <span className="truncate text-xs text-slate-300">
                    Icon Selected
                  </span>

                </div>

              )}

            </div>


            {/* Save Button */}

            <button
              type="submit"
              disabled={loading}
              className="mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-orange-500 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
            >

              <PlusCircle size={18} />

              <span>
                {loading
                  ? 'Saving...'
                  : 'Save Category'}
              </span>

            </button>

          </form>

        </div>


        {/* ================================= */}
        {/* CATEGORY TABLE */}
        {/* ================================= */}

        <div className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-800 bg-[#1e293b] shadow-xl lg:col-span-2">


          {/* Table Header */}

          <div className="border-b border-slate-800 p-4 sm:p-5 md:p-6">

            <h2 className="text-base font-semibold text-slate-200 sm:text-lg">
              Category Structure
            </h2>

            <p className="mt-1 text-[10px] text-slate-500 sm:text-xs">
              Manage your main categories and subcategories.
            </p>

          </div>


          {/* Horizontal Scroll */}

          <div className="w-full overflow-x-auto">

            <table className="w-full min-w-[720px] border-collapse text-left">

              <thead>

                <tr className="border-b border-slate-800 bg-[#0f172a]/60 text-[10px] uppercase text-slate-400 sm:text-xs">

                  <th className="whitespace-nowrap p-3 sm:p-4">
                    Icon
                  </th>

                  <th className="whitespace-nowrap p-3 sm:p-4">
                    Name
                  </th>

                  <th className="whitespace-nowrap p-3 sm:p-4">
                    Slug
                  </th>

                  <th className="whitespace-nowrap p-3 sm:p-4">
                    Type
                  </th>

                  <th className="whitespace-nowrap p-3 text-right sm:p-4">
                    Action
                  </th>

                </tr>

              </thead>


              <tbody className="divide-y divide-slate-800 text-xs sm:text-sm">

                {categories.length === 0 ? (

                  <tr>

                    <td
                      colSpan="5"
                      className="p-8 text-center text-slate-400"
                    >
                      No categories found. Create a main category first!
                    </td>

                  </tr>

                ) : (

                  categories.map(
                    (cat) => (

                      <React.Fragment
                        key={cat._id}
                      >


                        {/* ================================= */}
                        {/* MAIN CATEGORY */}
                        {/* ================================= */}

                        <tr className="transition-colors hover:bg-[#162032]">

                          <td className="p-3 sm:p-4">

                            {cat.icon ? (

                              <img
                                src={getImageUrl(
                                  cat.icon
                                )}
                                alt={cat.name}
                                className="h-9 w-9 rounded-xl border border-slate-700 object-cover"
                              />

                            ) : (

                              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800 text-slate-500">

                                <ImageIcon
                                  size={18}
                                />

                              </div>

                            )}

                          </td>


                          <td className="p-3 font-bold text-white sm:p-4">

                            <span className="whitespace-nowrap">
                              {cat.name}
                            </span>

                          </td>


                          <td className="p-3 font-mono text-[10px] text-slate-400 sm:p-4 sm:text-xs">

                            <span className="whitespace-nowrap">
                              {cat.slug}
                            </span>

                          </td>


                          <td className="p-3 sm:p-4">

                            <span className="inline-flex whitespace-nowrap rounded-full border border-orange-500/20 bg-orange-500/10 px-2.5 py-1 text-[10px] font-medium text-orange-400 sm:px-3 sm:text-xs">
                              Main Category
                            </span>

                          </td>


                          <td className="p-3 text-right sm:p-4">

                            <button
                              onClick={() =>
                                handleDelete(
                                  cat._id,
                                  cat.name
                                )
                              }
                              className="cursor-pointer rounded-lg p-2 text-red-400 transition hover:bg-red-500/10 hover:text-red-300"
                              title="Delete category"
                            >

                              <Trash2
                                size={16}
                              />

                            </button>

                          </td>

                        </tr>


                        {/* ================================= */}
                        {/* SUBCATEGORIES */}
                        {/* ================================= */}

                        {cat.subcategories &&
                          cat.subcategories.map(
                            (sub) => (

                              <tr
                                key={sub._id}
                                className="bg-[#0f172a]/30 transition-colors hover:bg-[#162032]/60"
                              >

                                <td className="p-3 pl-6 sm:p-4 sm:pl-8">

                                  {sub.icon ? (

                                    <img
                                      src={getImageUrl(
                                        sub.icon
                                      )}
                                      alt={sub.name}
                                      className="h-7 w-7 rounded-lg border border-slate-700 object-cover"
                                    />

                                  ) : (

                                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-800 text-slate-500">

                                      <ImageIcon
                                        size={14}
                                      />

                                    </div>

                                  )}

                                </td>


                                <td className="p-3 pl-4 sm:p-4 sm:pl-6">

                                  <div className="flex items-center gap-2">

                                    <span className="font-mono text-orange-400">
                                      ╰──
                                    </span>

                                    <span className="whitespace-nowrap font-medium text-slate-300">
                                      {sub.name}
                                    </span>

                                  </div>

                                </td>


                                <td className="p-3 font-mono text-[10px] text-slate-500 sm:p-4 sm:text-xs">

                                  <span className="whitespace-nowrap">
                                    {sub.slug}
                                  </span>

                                </td>


                                <td className="p-3 sm:p-4">

                                  <span className="inline-flex whitespace-nowrap rounded-full border border-slate-600/30 bg-slate-700/30 px-2.5 py-1 text-[10px] text-slate-300 sm:text-[11px]">
                                    Subcategory
                                  </span>

                                </td>


                                <td className="p-3 text-right sm:p-4">

                                  <button
                                    onClick={() =>
                                      handleDelete(
                                        sub._id,
                                        sub.name
                                      )
                                    }
                                    className="cursor-pointer rounded-lg p-2 text-red-400 transition hover:bg-red-500/10 hover:text-red-300"
                                    title="Delete subcategory"
                                  >

                                    <Trash2
                                      size={15}
                                    />

                                  </button>

                                </td>

                              </tr>

                            )
                          )}

                      </React.Fragment>

                    )
                  )

                )}

              </tbody>

            </table>

          </div>

        </div>

      </div>

    </div>
  );
}

