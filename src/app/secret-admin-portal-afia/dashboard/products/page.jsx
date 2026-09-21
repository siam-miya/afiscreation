'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Trash2, Edit, Loader2, Zap } from 'lucide-react';

export default function ProductsListPage() {
  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchProducts = async () => {
    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

      const res = await fetch(`${apiUrl}/api/products`);
      const result = await res.json();

      if (result.success && Array.isArray(result.data)) {
        setProducts(result.data);
        setTotalProducts(result.total || result.data.length);
      } else if (Array.isArray(result)) {
        setProducts(result);
        setTotalProducts(result.length);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setErrorMsg("Failed to load products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Flash Sale চেকবক্স টগল করার ফাংশন
  const handleFlashSaleToggle = async (id, currentStatus) => {
    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

      // FormData তৈরি করা কারণ ব্যাকএন্ডে upload.fields মিডলওয়্যার ব্যবহার করা হয়েছে
      const formData = new FormData();
      formData.append("isFlashSale", !currentStatus);

      const res = await fetch(`${apiUrl}/api/products/${id}`, {
        method: 'PUT',
        body: formData,
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(
          result.message || "Failed to update flash sale status"
        );
      }

      // লোকেল স্টেট আপডেট করা
      setProducts(
        products.map(p =>
          p._id === id
            ? { ...p, isFlashSale: !currentStatus }
            : p
        )
      );
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

      const res = await fetch(`${apiUrl}/api/products/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error("Failed to delete product");
      }

      setProducts(products.filter(p => p._id !== id));

      // Product delete হওয়ার সাথে সাথে total count 1 কমবে
      setTotalProducts(prev => Math.max(0, prev - 1));
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="admin-product-list mx-auto w-full max-w-7xl rounded-2xl border border-slate-200 bg-white p-3 shadow-xl dark:border-slate-800 dark:bg-slate-900 sm:p-4 md:p-6 lg:p-8 font-poppins text-black dark:text-white">

      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 border-b border-slate-200 pb-4 dark:border-slate-800 sm:mb-8 md:flex-row md:items-center md:justify-between">

        <div className="min-w-0">

          <h2 className="flex flex-col gap-2 text-xl font-bold sm:flex-row sm:items-center sm:gap-3 sm:text-2xl">

            <span>
              Product Management
            </span>

            <span className="w-fit rounded-full bg-orange-500/10 px-3 py-1 text-xs font-medium text-orange-500 sm:text-sm">
              Total: {totalProducts} Products
            </span>

          </h2>

          <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400 sm:text-sm">
            Manage store items, toggle Flash Sales, update, or delete products.
          </p>

        </div>

        <Link
          href="/secret-admin-portal-afia/dashboard/products/create"
          className="flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-600 sm:w-fit"
        >
          <Plus size={18} />
          Add New Product
        </Link>

      </div>

      {/* Error */}
      {errorMsg && (
        <div className="mb-6 rounded-xl border border-rose-500/30 bg-rose-500/15 p-3 text-sm text-rose-500 sm:p-4">
          {errorMsg}
        </div>
      )}

      {/* Loading */}
      {loading ? (

        <div className="flex min-h-[300px] items-center justify-center py-20">
          <Loader2
            className="animate-spin text-orange-500"
            size={32}
          />
        </div>

      ) : products.length === 0 ? (

        /* Empty State */
        <div className="flex min-h-[300px] items-center justify-center px-4 py-20 text-center text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
          No products found. Click Add New Product to create one.
        </div>

      ) : (

        /* Product Table */
        <div className="w-full overflow-x-auto rounded-xl">

          <table className="w-full min-w-[850px] border-collapse text-left">

            <thead>

              <tr className="border-b border-slate-200 text-xs uppercase text-slate-400 dark:border-slate-800">

                <th className="whitespace-nowrap px-3 py-3 sm:px-4">
                  Image
                </th>

                <th className="whitespace-nowrap px-3 py-3 sm:px-4">
                  Title
                </th>

                <th className="whitespace-nowrap px-3 py-3 sm:px-4">
                  Category
                </th>

                <th className="whitespace-nowrap px-3 py-3 sm:px-4">
                  Price
                </th>

                <th className="whitespace-nowrap px-3 py-3 sm:px-4">
                  Stock
                </th>

                <th className="whitespace-nowrap px-3 py-3 text-center sm:px-4">

                  <span className="flex items-center justify-center gap-1 text-orange-500">
                    <Zap size={14} />
                    Flash Sale
                  </span>

                </th>

                <th className="whitespace-nowrap px-3 py-3 text-right sm:px-4">
                  Actions
                </th>

              </tr>

            </thead>

            <tbody className="divide-y divide-slate-100 text-sm dark:divide-slate-800">

              {products.map((product) => (

                <tr
                  key={product._id}
                  className="transition hover:bg-slate-50 dark:hover:bg-slate-800/50"
                >

                  {/* Image */}
                  <td className="px-3 py-3 sm:px-4">

                    <img
                      src={
                        product.thumbnail ||
                        product.images?.[0] ||
                        'https://via.placeholder.com/50'
                      }
                      alt={product.title}
                      className="h-11 w-11 rounded-lg border border-slate-200 object-cover dark:border-slate-700 sm:h-12 sm:w-12"
                    />

                  </td>

                  {/* Title */}
                  <td className="max-w-xs px-3 py-3 font-medium sm:px-4">

                    <div
                      className="max-w-[220px] truncate"
                      title={product.title}
                    >
                      {product.title}
                    </div>

                  </td>

                  {/* Category */}
                  <td className="max-w-[160px] px-3 py-3 text-slate-500 dark:text-slate-400 sm:px-4">

                    <div className="truncate">
                      {product.category}
                    </div>

                  </td>

                  {/* Price */}
                  <td className="whitespace-nowrap px-3 py-3 sm:px-4">

                    ৳{product.discountPrice || product.price}

                  </td>

                  {/* Stock */}
                  <td className="whitespace-nowrap px-3 py-3 sm:px-4">

                    {product.stock}

                  </td>

                  {/* Flash Sale Checkbox Column */}
                  <td className="px-3 py-3 text-center sm:px-4">

                    <input
                      type="checkbox"
                      checked={product.isFlashSale || false}
                      onChange={() =>
                        handleFlashSaleToggle(
                          product._id,
                          product.isFlashSale
                        )
                      }
                      className="h-4 w-4 cursor-pointer rounded accent-orange-500"
                      title="Check to include in Flash Sales"
                    />

                  </td>

                  {/* Actions Column */}
                  <td className="px-3 py-3 text-right sm:px-4">

                    <div className="flex items-center justify-end gap-2">

                      <Link
                        href={`/secret-admin-portal-afia/dashboard/products/edit/${product._id}`}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500 transition hover:bg-blue-500 hover:text-white"
                        title="Edit Product"
                      >
                        <Edit size={16} />
                      </Link>

                      <button
                        onClick={() =>
                          handleDelete(product._id)
                        }
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-rose-500/10 text-rose-500 transition hover:bg-rose-500 hover:text-white"
                        title="Delete Product"
                      >
                        <Trash2 size={16} />
                      </button>

                    </div>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      )}

    </div>
  );
}

