'use client';
import { useState, useEffect } from 'react';
import { Trash2, Loader2, Zap } from 'lucide-react';

export default function FlashSalesProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFlashSales = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const res = await fetch(`${apiUrl}/api/products`);
        const result = await res.json();
        const allProducts = result.success ? result.data : result;

        // শুধু ফ্লাশ সেলের প্রোডাক্টগুলো ফিল্টার করা
        const flashProducts = allProducts.filter(p => p.isFlashSale === true);
        setProducts(flashProducts);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFlashSales();
  }, []);

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 font-poppins text-black dark:text-white">
      <div className="flex items-center gap-3 mb-8 border-b border-slate-200 dark:border-slate-800 pb-4">
        <Zap className="text-orange-500" size={28} />
        <div>
          <h2 className="text-2xl font-bold">Flash Sales Management</h2>
          <p className="text-sm text-slate-500 mt-1">Manage products specifically featured in Flash Sales.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-orange-500" size={32} /></div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-slate-500 text-sm">No Flash Sale products found. Check product settings to add them here.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-xs text-slate-400 uppercase">
                <th className="py-3 px-4">Image</th>
                <th className="py-3 px-4">Title</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              {products.map((product) => (
                <tr key={product._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                  <td className="py-3 px-4">
                    <img src={product.thumbnail || product.images?.[0]} alt="" className="w-12 h-12 object-cover rounded-lg border" />
                  </td>
                  <td className="py-3 px-4 font-medium">{product.title}</td>
                  <td className="py-3 px-4">৳{product.discountPrice || product.price}</td>
                  <td className="py-3 px-4 text-right">
                    {/* এখানে এডিট বা স্ট্যাটাস পরিবর্তনের অপশন দিতে পারিস */}
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