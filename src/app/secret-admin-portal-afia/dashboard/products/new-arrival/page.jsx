"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Loader2, Sparkles, ExternalLink } from 'lucide-react';

export default function AdminNewArrivalsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchNewArrivals = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const res = await fetch(`${apiUrl}/api/products`);
        const result = await res.json();
        
        let productsArray = [];
        if (result.success && Array.isArray(result.data)) {
          productsArray = result.data;
        } else if (Array.isArray(result)) {
          productsArray = result;
        }

        // যেহেতু ব্যাকএন্ড থেকে createdAt অনুযায়ী সর্ট হয়ে আসছে, 
        // প্রথম ৪ বা ৬টি প্রোডাক্টকে আমরা New Arrivals হিসেবে ধরতে পারি।
        setProducts(productsArray);
      } catch (error) {
        console.error("Failed to fetch products:", error);
        setErrorMsg("Failed to load new arrivals.");
      } finally {
        setLoading(false);
      }
    };

    fetchNewArrivals();
  }, []);

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 font-poppins text-black dark:text-white">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-slate-200 dark:border-slate-800 pb-4 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="text-orange-500" size={24} />
            <h2 className="text-2xl font-bold">New Arrivals Management</h2>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            The latest 4 uploaded products are automatically displayed in the website&apos;s New Arrivals section.
          </p>
        </div>
        <Link 
          href="/secret-admin-portal-afia/dashboard/products/create" 
          className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-xl transition flex items-center gap-2 text-sm shadow-lg shadow-orange-500/20"
        >
          Add New Product
        </Link>
      </div>

      {errorMsg && <div className="mb-6 p-4 bg-rose-500/15 border border-rose-500/30 text-rose-500 rounded-xl text-sm">{errorMsg}</div>}

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="animate-spin text-orange-500" size={32} />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-slate-500 text-sm">No products found.</div>
      ) : (
        <div>
          <h3 className="text-md font-semibold mb-4 text-orange-500">Currently Active in New Arrivals (Top 4 Latest)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs text-slate-400 uppercase">
                  <th className="py-3 px-4">Image</th>
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Created At</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                {products.slice(0, 4).map((product, index) => (
                  <tr key={product._id || product.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                    <td className="py-3 px-4">
                      <img 
                        src={product.thumbnail || 'https://via.placeholder.com/50'} 
                        alt={product.title} 
                        className="w-12 h-12 object-cover rounded-lg border border-slate-200 dark:border-slate-700" 
                      />
                    </td>
                    <td className="py-3 px-4 font-medium max-w-xs truncate">
                      <span className="bg-orange-500/10 text-orange-500 text-xs px-2 py-0.5 rounded mr-2">#{index + 1}</span>
                      {product.title}
                    </td>
                    <td className="py-3 px-4 text-slate-500">{product.category}</td>
                    <td className="py-3 px-4">৳{product.discountPrice || product.price}</td>
                    <td className="py-3 px-4 text-xs text-slate-400">
                      {new Date(product.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link 
                        href={`/products/${product._id || product.id}`}
                        target="_blank"
                        className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-orange-500 hover:text-white rounded-lg transition inline-flex items-center gap-1 text-xs"
                      >
                        <ExternalLink size={14} /> View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}