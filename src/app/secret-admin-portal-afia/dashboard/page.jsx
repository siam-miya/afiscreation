"use client";

import React, { useEffect, useMemo, useState } from "react";

import Link from "next/link";

import {
FiPackage,
FiShoppingBag,
FiDollarSign,
FiPlus,
FiEye,
FiCalendar,
FiTrendingUp,
FiBarChart2,
FiArrowRight,
FiRefreshCw,
FiZap,
FiEdit,
FiAlertCircle,
FiCheckCircle,
FiXCircle,
FiClock,
FiTruck,
FiActivity,
} from "react-icons/fi";

import {
ResponsiveContainer,
AreaChart,
Area,
BarChart,
Bar,
XAxis,
YAxis,
CartesianGrid,
Tooltip,
} from "recharts";

const AdminDashboardPage = () => {
const [orders, setOrders] = useState([]);
const [loadingOrders, setLoadingOrders] = useState(true);
const [orderError, setOrderError] = useState("");

const [products, setProducts] = useState([]);
const [loadingProducts, setLoadingProducts] = useState(true);
const [productError, setProductError] = useState("");

const [orderPeriod, setOrderPeriod] = useState("all");

const apiUrl = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

const fetchOrders = async () => {
try {
setLoadingOrders(true);
setOrderError("");


  const response = await fetch(`${apiUrl}/api/orders`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch orders");
  }

  const data = await response.json();

  const orderList = Array.isArray(data)
    ? data
    : Array.isArray(data?.orders)
    ? data.orders
    : Array.isArray(data?.data)
    ? data.data
    : [];

  setOrders(orderList.filter(Boolean));
} catch (error) {
  console.error("Dashboard orders error:", error);
  setOrderError("Unable to load order data.");
  setOrders([]);
} finally {
  setLoadingOrders(false);
}


};

const fetchProducts = async () => {
try {
setLoadingProducts(true);
setProductError("");
  const response = await fetch(`${apiUrl}/api/products`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }

  const result = await response.json();

  let productList = [];

  if (result?.success && Array.isArray(result?.data)) {
    productList = result.data;
  } else if (Array.isArray(result)) {
    productList = result;
  } else if (Array.isArray(result?.products)) {
    productList = result.products;
  }

  setProducts(productList.filter(Boolean));
} catch (error) {
  console.error("Dashboard products error:", error);
  setProductError("Unable to load product data.");
  setProducts([]);
} finally {
  setLoadingProducts(false);
}


};

useEffect(() => {
fetchOrders();
fetchProducts();
}, []);

const getOrderDate = (order) => {
const value =
order?.createdAt ||
order?.date ||
order?.createdDate ||
order?.orderDate;

if (!value) return null;

const date = new Date(value);

return Number.isNaN(date.getTime()) ? null : date;


};

// =========================
// ORDER AMOUNT
// =========================

const getOrderAmount = (order) => {
const amount = Number(
order?.totalCost ??
order?.totalAmount ??
order?.amount ??
order?.grandTotal ??
order?.total ??
0
);
return Number.isNaN(amount) ? 0 : amount;
};

const orderStats = useMemo(() => {
const now = new Date();

const startOfToday = new Date(now);
startOfToday.setHours(0, 0, 0, 0);

const last7Days = new Date(startOfToday);
last7Days.setDate(last7Days.getDate() - 6);

const last1Month = new Date(startOfToday);
last1Month.setMonth(last1Month.getMonth() - 1);

const last1Year = new Date(startOfToday);
last1Year.setFullYear(last1Year.getFullYear() - 1);

const countSince = (startDate) => {
  return orders.filter((order) => {
    const date = getOrderDate(order);

    if (!date) return false;

    return date >= startDate && date <= now;
  }).length;
};

const revenueSince = (startDate) => {
  return orders.reduce((total, order) => {
    const date = getOrderDate(order);

    if (!date) return total;

    if (date >= startDate && date <= now) {
      return total + getOrderAmount(order);
    }

    return total;
  }, 0);
};

const statusCounts = {
  Pending: 0,
  Processing: 0,
  Confirmed: 0,
  "Ready To Ship": 0,
  Shipped: 0,
  Delivered: 0,
  Cancelled: 0,
  Returned: 0,
  Failed: 0,
};

orders.forEach((order) => {
  const status = String(order?.status || "Pending");

  if (statusCounts[status] !== undefined) {
    statusCounts[status]++;
  }
});

const paidOrders = orders.filter(
  (order) =>
    String(
      order?.paymentStatus ||
        order?.payment?.status ||
        order?.payment_status ||
        ""
    ).toLowerCase() === "paid"
).length;

const pendingPayment = orders.length - paidOrders;

const totalRevenue = orders.reduce((total, order) => {
  return total + getOrderAmount(order);
}, 0);

return {
  total: orders.length,
  today: countSince(startOfToday),
  last7Days: countSince(last7Days),
  last1Month: countSince(last1Month),
  last1Year: countSince(last1Year),

  revenueToday: revenueSince(startOfToday),
  revenue7Days: revenueSince(last7Days),
  revenue1Month: revenueSince(last1Month),
  revenue1Year: revenueSince(last1Year),

  totalRevenue,

  statusCounts,

  paidOrders,
  pendingPayment,
};


}, [orders]);


const selectedOrderStats = useMemo(() => {
if (orderPeriod === "today") {
return {
label: "Today",
orders: orderStats.today,
revenue: orderStats.revenueToday,
};
}

if (orderPeriod === "7days") {
  return {
    label: "Last 7 Days",
    orders: orderStats.last7Days,
    revenue: orderStats.revenue7Days,
  };
}

if (orderPeriod === "month") {
  return {
    label: "Last 1 Month",
    orders: orderStats.last1Month,
    revenue: orderStats.revenue1Month,
  };
}

if (orderPeriod === "year") {
  return {
    label: "Last 1 Year",
    orders: orderStats.last1Year,
    revenue: orderStats.revenue1Year,
  };
}

return {
  label: "All Orders",
  orders: orderStats.total,
  revenue: orderStats.totalRevenue,
};


}, [orderPeriod, orderStats]);

// =========================
// RECENT ORDERS
// =========================

const recentOrders = useMemo(() => {
return [...orders]
.sort((a, b) => {
const dateA = getOrderDate(a)?.getTime() || 0;
const dateB = getOrderDate(b)?.getTime() || 0;


    return dateB - dateA;
  })
  .slice(0, 5);


}, [orders]);

// =========================
// REVENUE PERIODS
// =========================

const revenueStats = useMemo(() => {
return {
last7Days: orderStats.revenue7Days,
last1Month: orderStats.revenue1Month,
last1Year: orderStats.revenue1Year,
total: orderStats.totalRevenue,
};
}, [orderStats]);

// =========================
// ORDER OVERVIEW CHART
// LAST 7 DAYS
// =========================

const orderChartData = useMemo(() => {
const now = new Date();

const data = [];

for (let i = 6; i >= 0; i--) {
  const targetDate = new Date(now);

  targetDate.setDate(targetDate.getDate() - i);
  targetDate.setHours(0, 0, 0, 0);

  const nextDate = new Date(targetDate);

  nextDate.setDate(nextDate.getDate() + 1);

  const dayOrders = orders.filter((order) => {
    const orderDate = getOrderDate(order);

    if (!orderDate) return false;

    return orderDate >= targetDate && orderDate < nextDate;
  });

  const dayRevenue = dayOrders.reduce((sum, order) => {
    return sum + getOrderAmount(order);
  }, 0);

  data.push({
    date: targetDate.toLocaleDateString("en-BD", {
      day: "2-digit",
      month: "short",
    }),
    orders: dayOrders.length,
    revenue: dayRevenue,
  });
}

return data;


}, [orders]);

// =========================
// REVENUE CHART DATA
// =========================

const revenueChartData = useMemo(() => {
return [
{
name: "7 Days",
revenue: revenueStats.last7Days,
},
{
name: "1 Month",
revenue: revenueStats.last1Month,
},
{
name: "1 Year",
revenue: revenueStats.last1Year,
},
{
name: "Total",
revenue: revenueStats.total,
},
];
}, [revenueStats]);

// =========================
// PRODUCT STATISTICS
// =========================

const productStats = useMemo(() => {
const total = products.length;


const flashSale = products.filter(
  (product) => product?.isFlashSale === true
).length;

const outOfStock = products.filter((product) => {
  const stock = Number(product?.stock ?? 0);

  return stock <= 0;
}).length;

const lowStock = products.filter((product) => {
  const stock = Number(product?.stock ?? 0);

  return stock > 0 && stock <= 5;
}).length;

const inStock = products.filter((product) => {
  const stock = Number(product?.stock ?? 0);

  return stock > 0;
}).length;

const totalStock = products.reduce((total, product) => {
  const stock = Number(product?.stock ?? 0);

  return total + (Number.isNaN(stock) ? 0 : stock);
}, 0);

return {
  total,
  flashSale,
  inStock,
  outOfStock,
  lowStock,
  totalStock,
};


}, [products]);

// =========================
// RECENT PRODUCTS
// =========================

const recentProducts = useMemo(() => {
const sorted = [...products].sort((a, b) => {
const dateA = new Date(
a?.createdAt || a?.createdDate || 0
).getTime();


  const dateB = new Date(
    b?.createdAt || b?.createdDate || 0
  ).getTime();

  return dateB - dateA;
});

return sorted.slice(0, 5);


}, [products]);

// =========================
// MONEY FORMAT
// =========================

const formatMoney = (amount) => {
return `৳ ${Number(amount || 0).toLocaleString("en-BD")}`;
};

// =========================
// DATE FORMAT
// =========================

const formatDate = (dateValue) => {
if (!dateValue) return "-";


const date = new Date(dateValue);

if (Number.isNaN(date.getTime())) return "-";

return date.toLocaleDateString("en-BD", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});


};

// =========================
// ORDER ID
// =========================

const getOrderId = (order) => {
return (
order?.orderId ||
order?.publicOrderId ||
order?.invoiceId ||
order?._id ||
"N/A"
);
};

// =========================
// CUSTOMER NAME
// =========================

const getCustomerName = (order) => {
return (
order?.fullName ||
order?.name ||
order?.customerName ||
order?.user?.name ||
"Guest Customer"
);
};

// =========================
// ORDER STATUS CLASS
// =========================

const getStatusClass = (status) => {
const normalized = String(status || "Pending").toLowerCase();


if (
  normalized.includes("deliver") ||
  normalized.includes("complete")
) {
  return "bg-green-100 text-green-700";
}

if (
  normalized.includes("process") ||
  normalized.includes("confirm")
) {
  return "bg-blue-100 text-blue-700";
}

if (
  normalized.includes("cancel") ||
  normalized.includes("return") ||
  normalized.includes("fail")
) {
  return "bg-red-100 text-red-700";
}

if (
  normalized.includes("ship") ||
  normalized.includes("transit")
) {
  return "bg-purple-100 text-purple-700";
}

return "bg-amber-100 text-amber-700";


};

// =========================
// MAIN STATS
// =========================

const stats = [
{
id: 1,
title: "Total Revenue",
value: formatMoney(orderStats.totalRevenue),
icon: FiDollarSign,
color: "bg-emerald-50 text-emerald-600",
},
{
id: 2,
title: "Total Orders",
value: orderStats.total.toLocaleString("en-BD"),
icon: FiShoppingBag,
color: "bg-blue-50 text-blue-600",
},
{
id: 3,
title: "Total Products",
value: productStats.total.toLocaleString("en-BD"),
icon: FiPackage,
color: "bg-indigo-50 text-indigo-600",
},
{
id: 4,
title: "Total Stock",
value: productStats.totalStock.toLocaleString("en-BD"),
icon: FiBarChart2,
color: "bg-amber-50 text-amber-600",
},
];

// =========================
// CUSTOM ORDER TOOLTIP
// =========================

const OrderTooltip = ({ active, payload, label }) => {
if (!active || !payload || !payload.length) {
return null;
}

return (
  <div className="bg-white border border-gray-100 shadow-xl rounded-xl px-4 py-3 min-w-[150px]">
    <p className="text-xs font-semibold text-gray-500 mb-2">
      {label}
    </p>

    <p className="text-sm font-bold text-gray-800">
      {payload[0]?.value || 0} Orders
    </p>

    <p className="text-xs text-gray-400 mt-1">
      Revenue:{" "}
      {formatMoney(payload[0]?.payload?.revenue || 0)}
    </p>
  </div>
);


};

// =========================
// CUSTOM REVENUE TOOLTIP
// =========================

const RevenueTooltip = ({ active, payload, label }) => {
if (!active || !payload || !payload.length) {
return null;
}

return (
  <div className="bg-white border border-gray-100 shadow-xl rounded-xl px-4 py-3 min-w-[170px]">
    <p className="text-xs font-semibold text-gray-500 mb-2">
      {label}
    </p>

    <p className="text-base font-bold text-gray-800">
      {formatMoney(payload[0]?.value || 0)}
    </p>

    <p className="text-[11px] text-gray-400 mt-1">
      Revenue
    </p>
  </div>
);


};

return ( <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8 font-poppins">
{/* =========================
DASHBOARD HEADER
========================= */}

  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-7">
    <div>
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-xl bg-gray-900 text-white flex items-center justify-center">
          <FiActivity size={18} />
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          Admin Dashboard
        </h1>
      </div>

      <p className="text-sm text-gray-500 mt-2">
        Monitor your store performance, orders, products and revenue.
      </p>
    </div>

    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => {
          fetchOrders();
          fetchProducts();
        }}
        disabled={loadingOrders || loadingProducts}
        className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-all text-sm font-medium disabled:opacity-50"
      >
        <FiRefreshCw
          size={15}
          className={
            loadingOrders || loadingProducts
              ? "animate-spin"
              : ""
          }
        />

        Refresh
      </button>

      <Link
        href="/secret-admin-portal-afia/dashboard/products/create"
        className="flex items-center gap-2 bg-primary hover:bg-secondary text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-all shadow-sm"
      >
        <FiPlus size={18} />

        Add Product
      </Link>
    </div>
  </div>

 

  <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4 mb-6">
    {stats.map((item) => {
      const Icon = item.icon;

      return (
        <div
          key={item.id}
          className="bg-white p-4 md:p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between"
        >
          <div className="min-w-0">
            <p className="text-[10px] md:text-xs text-gray-400 font-semibold uppercase tracking-wider">
              {item.title}
            </p>

            <h3 className="text-lg md:text-2xl font-bold text-gray-800 mt-1 truncate">
              {item.value}
            </h3>
          </div>

          <div
            className={`w-10 h-10 md:w-11 md:h-11 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}
          >
            <Icon size={20} />
          </div>
        </div>
      );
    })}
  </div>

  {/* =========================
      TOP ANALYTICS
      CHARTS DIRECTLY UNDER STATS
  ========================= */}

  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
    {/* =========================
        ORDER ACTIVITY
    ========================= */}

    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-6">
      <div className="flex items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <FiTrendingUp size={18} />
            </div>

            <div>
              <h2 className="text-base md:text-lg font-bold text-gray-800">
                Order Activity
              </h2>

              <p className="text-[11px] text-gray-400 mt-0.5">
                Last 7 days
              </p>
            </div>
          </div>
        </div>

        <div className="text-right">
          <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
            Orders
          </p>

          <p className="text-lg font-bold text-gray-800 mt-0.5">
            {loadingOrders
              ? "..."
              : orderStats.last7Days.toLocaleString("en-BD")}
          </p>
        </div>
      </div>

      <div className="h-[320px] w-full">
        {loadingOrders ? (
          <div className="h-full flex items-center justify-center">
            <FiRefreshCw
              size={25}
              className="animate-spin text-gray-400"
            />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={orderChartData}
              margin={{
                top: 10,
                right: 10,
                left: -20,
                bottom: 0,
              }}
            >
              <defs>
                <linearGradient
                  id="orderGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="#3b82f6"
                    stopOpacity={0.3}
                  />

                  <stop
                    offset="100%"
                    stopColor="#3b82f6"
                    stopOpacity={0.02}
                  />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f1f5f9"
              />

              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{
                  fontSize: 11,
                  fill: "#94a3b8",
                }}
              />

              <YAxis
                allowDecimals={false}
                axisLine={false}
                tickLine={false}
                tick={{
                  fontSize: 11,
                  fill: "#94a3b8",
                }}
              />

              <Tooltip
                content={<OrderTooltip />}
                cursor={{
                  stroke: "#cbd5e1",
                  strokeDasharray: "4 4",
                }}
              />

              <Area
                type="monotone"
                dataKey="orders"
                stroke="#3b82f6"
                strokeWidth={3}
                fill="url(#orderGradient)"
                activeDot={{
                  r: 6,
                  strokeWidth: 3,
                  fill: "#ffffff",
                  stroke: "#3b82f6",
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
            Total Orders
          </p>

          <p className="text-sm font-bold text-gray-800 mt-1">
            {loadingOrders
              ? "..."
              : orderStats.total.toLocaleString("en-BD")}
          </p>
        </div>

        <Link
          href="/secret-admin-portal-afia/dashboard/orders"
          className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
        >
          View Orders
          <FiArrowRight size={14} />
        </Link>
      </div>
    </div>

    {/* =========================
        REVENUE ANALYTICS
    ========================= */}

    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-6">
      <div className="flex items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <FiDollarSign size={18} />
            </div>

            <div>
              <h2 className="text-base md:text-lg font-bold text-gray-800">
                Revenue Analytics
              </h2>

              <p className="text-[11px] text-gray-400 mt-0.5">
                Revenue performance
              </p>
            </div>
          </div>
        </div>

        <div className="text-right">
          <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
            Total Revenue
          </p>

          <p className="text-lg font-bold text-gray-800 mt-0.5">
            {loadingOrders
              ? "..."
              : formatMoney(revenueStats.total)}
          </p>
        </div>
      </div>

      <div className="h-[320px] w-full">
        {loadingOrders ? (
          <div className="h-full flex items-center justify-center">
            <FiRefreshCw
              size={25}
              className="animate-spin text-gray-400"
            />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={revenueChartData}
              margin={{
                top: 10,
                right: 10,
                left: -10,
                bottom: 5,
              }}
              barCategoryGap="25%"
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f1f5f9"
              />

              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{
                  fontSize: 10,
                  fill: "#94a3b8",
                }}
                interval={0}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{
                  fontSize: 10,
                  fill: "#94a3b8",
                }}
                tickFormatter={(value) => {
                  if (value >= 1000000) {
                    return `৳${(value / 1000000).toFixed(1)}M`;
                  }

                  if (value >= 1000) {
                    return `৳${(value / 1000).toFixed(0)}K`;
                  }

                  return `৳${value}`;
                }}
              />

              <Tooltip
                content={<RevenueTooltip />}
                cursor={{
                  fill: "#f8fafc",
                }}
              />

              <Bar
                dataKey="revenue"
                fill="#10b981"
                radius={[8, 8, 0, 0]}
                maxBarSize={55}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 md:gap-3 mt-4 pt-4 border-t border-gray-100">
        <div className="rounded-xl bg-gray-50 p-3">
          <p className="text-[9px] uppercase tracking-wider text-gray-400 font-semibold">
            7 Days
          </p>

          <p className="text-xs md:text-sm font-bold text-gray-800 mt-1">
            {loadingOrders
              ? "..."
              : formatMoney(revenueStats.last7Days)}
          </p>
        </div>

        <div className="rounded-xl bg-gray-50 p-3">
          <p className="text-[9px] uppercase tracking-wider text-gray-400 font-semibold">
            1 Month
          </p>

          <p className="text-xs md:text-sm font-bold text-gray-800 mt-1">
            {loadingOrders
              ? "..."
              : formatMoney(revenueStats.last1Month)}
          </p>
        </div>

        <div className="rounded-xl bg-gray-50 p-3">
          <p className="text-[9px] uppercase tracking-wider text-gray-400 font-semibold">
            1 Year
          </p>

          <p className="text-xs md:text-sm font-bold text-gray-800 mt-1">
            {loadingOrders
              ? "..."
              : formatMoney(revenueStats.last1Year)}
          </p>
        </div>
      </div>
    </div>
  </div>


  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-6 overflow-hidden">
    <div className="px-4 md:px-5 pt-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-800">
            Order Overview
          </h2>

          <p className="text-xs text-gray-400 mt-1">
            View your order performance by period.
          </p>
        </div>

        <Link
          href="/secret-admin-portal-afia/dashboard/orders"
          className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
        >
          View All Orders
          <FiArrowRight size={14} />
        </Link>
      </div>
    </div>

    <div className="mt-4 border-t border-gray-100">
      <div className="flex items-center overflow-x-auto px-2">
        <button
          type="button"
          onClick={() => setOrderPeriod("all")}
          className={`relative shrink-0 flex items-center gap-2.5 px-4 py-3.5 border-b-2 transition-all ${
            orderPeriod === "all"
              ? "border-primary text-primary"
              : "border-transparent text-gray-500 hover:text-gray-800"
          }`}
        >
          <span
            className={`w-7 h-7 rounded-lg flex items-center justify-center ${
              orderPeriod === "all"
                ? "bg-primary/10"
                : "bg-gray-100"
            }`}
          >
            <FiShoppingBag size={14} />
          </span>

          <span className="text-left">
            <span className="block text-[11px] font-semibold whitespace-nowrap">
              All Orders
            </span>

            <span className="block text-sm font-bold text-gray-800">
              {orderStats.total.toLocaleString("en-BD")}
            </span>
          </span>
        </button>

        <button
          type="button"
          onClick={() => setOrderPeriod("today")}
          className={`relative shrink-0 flex items-center gap-2.5 px-4 py-3.5 border-b-2 transition-all ${
            orderPeriod === "today"
              ? "border-primary text-primary"
              : "border-transparent text-gray-500 hover:text-gray-800"
          }`}
        >
          <span
            className={`w-7 h-7 rounded-lg flex items-center justify-center ${
              orderPeriod === "today"
                ? "bg-primary/10"
                : "bg-gray-100"
            }`}
          >
            <FiClock size={14} />
          </span>

          <span className="text-left">
            <span className="block text-[11px] font-semibold whitespace-nowrap">
              Today
            </span>

            <span className="block text-sm font-bold text-gray-800">
              {orderStats.today.toLocaleString("en-BD")}
            </span>
          </span>
        </button>

        <button
          type="button"
          onClick={() => setOrderPeriod("7days")}
          className={`relative shrink-0 flex items-center gap-2.5 px-4 py-3.5 border-b-2 transition-all ${
            orderPeriod === "7days"
              ? "border-primary text-primary"
              : "border-transparent text-gray-500 hover:text-gray-800"
          }`}
        >
          <span
            className={`w-7 h-7 rounded-lg flex items-center justify-center ${
              orderPeriod === "7days"
                ? "bg-primary/10"
                : "bg-gray-100"
            }`}
          >
            <FiTrendingUp size={14} />
          </span>

          <span className="text-left">
            <span className="block text-[11px] font-semibold whitespace-nowrap">
              Last 7 Days
            </span>

            <span className="block text-sm font-bold text-gray-800">
              {orderStats.last7Days.toLocaleString("en-BD")}
            </span>
          </span>
        </button>

        <button
          type="button"
          onClick={() => setOrderPeriod("month")}
          className={`relative shrink-0 flex items-center gap-2.5 px-4 py-3.5 border-b-2 transition-all ${
            orderPeriod === "month"
              ? "border-primary text-primary"
              : "border-transparent text-gray-500 hover:text-gray-800"
          }`}
        >
          <span
            className={`w-7 h-7 rounded-lg flex items-center justify-center ${
              orderPeriod === "month"
                ? "bg-primary/10"
                : "bg-gray-100"
            }`}
          >
            <FiCalendar size={14} />
          </span>

          <span className="text-left">
            <span className="block text-[11px] font-semibold whitespace-nowrap">
              Last 1 Month
            </span>

            <span className="block text-sm font-bold text-gray-800">
              {orderStats.last1Month.toLocaleString("en-BD")}
            </span>
          </span>
        </button>

        <button
          type="button"
          onClick={() => setOrderPeriod("year")}
          className={`relative shrink-0 flex items-center gap-2.5 px-4 py-3.5 border-b-2 transition-all ${
            orderPeriod === "year"
              ? "border-primary text-primary"
              : "border-transparent text-gray-500 hover:text-gray-800"
          }`}
        >
          <span
            className={`w-7 h-7 rounded-lg flex items-center justify-center ${
              orderPeriod === "year"
                ? "bg-primary/10"
                : "bg-gray-100"
            }`}
          >
            <FiBarChart2 size={14} />
          </span>

          <span className="text-left">
            <span className="block text-[11px] font-semibold whitespace-nowrap">
              Last 1 Year
            </span>

            <span className="block text-sm font-bold text-gray-800">
              {orderStats.last1Year.toLocaleString("en-BD")}
            </span>
          </span>
        </button>
      </div>
    </div>

    <div className="px-4 md:px-5 py-4 border-t border-gray-100 bg-gray-50/50">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-gray-100 p-3.5">
          <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-400">
            Selected Period
          </p>

          <p className="text-sm font-bold text-gray-800 mt-1">
            {selectedOrderStats.label}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-3.5">
          <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-400">
            Orders
          </p>

          <p className="text-sm font-bold text-gray-800 mt-1">
            {selectedOrderStats.orders.toLocaleString("en-BD")}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-3.5">
          <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-400">
            Revenue
          </p>

          <p className="text-sm font-bold text-emerald-600 mt-1">
            {formatMoney(selectedOrderStats.revenue)}
          </p>
        </div>
      </div>
    </div>
  </div>


  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-5 mb-6">
    <div className="flex items-center justify-between mb-4">
      <div>
        <h2 className="text-base font-bold text-gray-800">
          Order Status
        </h2>

        <p className="text-xs text-gray-400 mt-1">
          Current order pipeline overview.
        </p>
      </div>

      <Link
        href="/secret-admin-portal-afia/dashboard/orders"
        className="text-xs font-semibold text-primary hover:underline"
      >
        Manage Orders
      </Link>
    </div>

    <div className="flex items-center gap-2 overflow-x-auto pb-1">
      <div className="shrink-0 flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-amber-50 border border-amber-100">
        <FiClock size={15} className="text-amber-600" />

        <div>
          <p className="text-[10px] text-amber-600 font-semibold">
            Pending
          </p>

          <p className="text-sm font-bold text-gray-800">
            {orderStats.statusCounts.Pending}
          </p>
        </div>
      </div>

      <div className="shrink-0 flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-blue-50 border border-blue-100">
        <FiActivity size={15} className="text-blue-600" />

        <div>
          <p className="text-[10px] text-blue-600 font-semibold">
            Processing
          </p>

          <p className="text-sm font-bold text-gray-800">
            {orderStats.statusCounts.Processing}
          </p>
        </div>
      </div>

      <div className="shrink-0 flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-indigo-50 border border-indigo-100">
        <FiCheckCircle size={15} className="text-indigo-600" />

        <div>
          <p className="text-[10px] text-indigo-600 font-semibold">
            Confirmed
          </p>

          <p className="text-sm font-bold text-gray-800">
            {orderStats.statusCounts.Confirmed}
          </p>
        </div>
      </div>

      <div className="shrink-0 flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-purple-50 border border-purple-100">
        <FiTruck size={15} className="text-purple-600" />

        <div>
          <p className="text-[10px] text-purple-600 font-semibold">
            Shipped
          </p>

          <p className="text-sm font-bold text-gray-800">
            {orderStats.statusCounts.Shipped}
          </p>
        </div>
      </div>

      <div className="shrink-0 flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-green-50 border border-green-100">
        <FiCheckCircle size={15} className="text-green-600" />

        <div>
          <p className="text-[10px] text-green-600 font-semibold">
            Delivered
          </p>

          <p className="text-sm font-bold text-gray-800">
            {orderStats.statusCounts.Delivered}
          </p>
        </div>
      </div>

      <div className="shrink-0 flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-red-50 border border-red-100">
        <FiXCircle size={15} className="text-red-600" />

        <div>
          <p className="text-[10px] text-red-600 font-semibold">
            Cancelled
          </p>

          <p className="text-sm font-bold text-gray-800">
            {orderStats.statusCounts.Cancelled}
          </p>
        </div>
      </div>
    </div>
  </div>


  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-6 mb-6">
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
      <div>
        <h2 className="text-lg font-bold text-gray-800">
          Product Overview
        </h2>

        <p className="text-xs text-gray-400 mt-1">
          Monitor products, inventory and Flash Sale activity.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={fetchProducts}
          disabled={loadingProducts}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all text-sm font-medium disabled:opacity-50"
        >
          <FiRefreshCw
            size={15}
            className={
              loadingProducts ? "animate-spin" : ""
            }
          />

          Refresh
        </button>

        <Link
          href="/secret-admin-portal-afia/dashboard/products"
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition-all text-sm font-medium"
        >
          All Products
          <FiArrowRight size={15} />
        </Link>
      </div>
    </div>

    <div className="flex items-center gap-2 overflow-x-auto pb-1 mb-5">
      <Link
        href="/secret-admin-portal-afia/dashboard/products"
        className="min-w-[145px] shrink-0 flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3.5 hover:bg-white hover:border-indigo-200 hover:shadow-sm transition-all"
      >
        <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
          <FiPackage size={17} />
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-400">
            Products
          </p>

          <p className="text-lg font-bold text-gray-800">
            {loadingProducts
              ? "..."
              : productStats.total.toLocaleString("en-BD")}
          </p>
        </div>
      </Link>

      <Link
        href="/secret-admin-portal-afia/dashboard/products"
        className="min-w-[145px] shrink-0 flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3.5 hover:bg-white hover:border-orange-200 hover:shadow-sm transition-all"
      >
        <div className="w-9 h-9 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
          <FiZap size={17} />
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-400">
            Flash Sale
          </p>

          <p className="text-lg font-bold text-gray-800">
            {loadingProducts
              ? "..."
              : productStats.flashSale.toLocaleString("en-BD")}
          </p>
        </div>
      </Link>

      <Link
        href="/secret-admin-portal-afia/dashboard/products"
        className="min-w-[145px] shrink-0 flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3.5 hover:bg-white hover:border-green-200 hover:shadow-sm transition-all"
      >
        <div className="w-9 h-9 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
          <FiCheckCircle size={17} />
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-400">
            In Stock
          </p>

          <p className="text-lg font-bold text-gray-800">
            {loadingProducts
              ? "..."
              : productStats.inStock.toLocaleString("en-BD")}
          </p>
        </div>
      </Link>

      <Link
        href="/secret-admin-portal-afia/dashboard/products"
        className="min-w-[145px] shrink-0 flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3.5 hover:bg-white hover:border-amber-200 hover:shadow-sm transition-all"
      >
        <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
          <FiAlertCircle size={17} />
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-400">
            Low Stock
          </p>

          <p className="text-lg font-bold text-gray-800">
            {loadingProducts
              ? "..."
              : productStats.lowStock.toLocaleString("en-BD")}
          </p>
        </div>
      </Link>

      <Link
        href="/secret-admin-portal-afia/dashboard/products"
        className="min-w-[145px] shrink-0 flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3.5 hover:bg-white hover:border-red-200 hover:shadow-sm transition-all"
      >
        <div className="w-9 h-9 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
          <FiXCircle size={17} />
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-400">
            Out of Stock
          </p>

          <p className="text-lg font-bold text-gray-800">
            {loadingProducts
              ? "..."
              : productStats.outOfStock.toLocaleString("en-BD")}
          </p>
        </div>
      </Link>
    </div>

    <div className="border-t border-gray-100 pt-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-gray-800">
            Recent Products
          </h3>

          <p className="text-xs text-gray-400 mt-1">
            Latest products added to your store.
          </p>
        </div>

        <Link
          href="/secret-admin-portal-afia/dashboard/products"
          className="text-xs text-primary font-semibold hover:underline"
        >
          View All
        </Link>
      </div>

      {loadingProducts ? (
        <div className="py-10 text-center">
          <FiRefreshCw
            size={24}
            className="mx-auto text-gray-400 animate-spin"
          />

          <p className="text-sm text-gray-500 mt-3">
            Loading products...
          </p>
        </div>
      ) : productError ? (
        <div className="py-10 text-center">
          <p className="text-sm text-red-500">
            {productError}
          </p>

          <button
            type="button"
            onClick={fetchProducts}
            className="mt-3 text-xs font-semibold text-primary hover:underline"
          >
            Try Again
          </button>
        </div>
      ) : recentProducts.length === 0 ? (
        <div className="py-10 text-center">
          <FiPackage
            size={30}
            className="mx-auto text-gray-300"
          />

          <p className="text-sm text-gray-500 mt-3">
            No products found.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                <th className="py-3 px-2">Product</th>
                <th className="py-3 px-2">Category</th>
                <th className="py-3 px-2">Price</th>
                <th className="py-3 px-2">Stock</th>
                <th className="py-3 px-2">Flash Sale</th>
                <th className="py-3 px-2 text-right">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50 text-sm">
              {recentProducts.map((product, index) => {
                const stock = Number(product?.stock ?? 0);

                const productPrice =
                  product?.discountPrice ||
                  product?.price ||
                  0;

                const productImage =
                  product?.thumbnail ||
                  product?.images?.[0] ||
                  "https://via.placeholder.com/60";

                return (
                  <tr
                    key={product?._id || index}
                    className="hover:bg-gray-50/70 transition-colors"
                  >
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-3 min-w-[220px]">
                        <img
                          src={productImage}
                          alt={product?.title || "Product"}
                          className="w-11 h-11 object-cover rounded-lg border border-gray-200"
                        />

                        <div className="min-w-0">
                          <p className="font-semibold text-gray-800 truncate max-w-[220px]">
                            {product?.title ||
                              "Untitled Product"}
                          </p>

                          {product?.sku && (
                            <p className="text-[10px] text-gray-400 mt-0.5">
                              SKU: {product.sku}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-2 text-gray-500 whitespace-nowrap">
                      {typeof product?.category ===
                      "object"
                        ? product?.category?.name || "-"
                        : product?.category || "-"}
                    </td>

                    <td className="py-3 px-2 whitespace-nowrap">
                      <div className="font-semibold text-gray-800">
                        ৳
                        {Number(
                          productPrice
                        ).toLocaleString("en-BD")}
                      </div>

                      {product?.discountPrice &&
                        Number(product.discountPrice) <
                          Number(product?.price || 0) && (
                          <div className="text-[10px] text-gray-400 line-through">
                            ৳
                            {Number(
                              product.price
                            ).toLocaleString("en-BD")}
                          </div>
                        )}
                    </td>

                    <td className="py-3 px-2">
                      {stock <= 0 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 text-red-700 text-[10px] font-medium whitespace-nowrap">
                          <FiXCircle size={11} />
                          Out of Stock
                        </span>
                      ) : stock <= 5 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-100 text-amber-700 text-[10px] font-medium whitespace-nowrap">
                          <FiAlertCircle size={11} />
                          {stock} left
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-[10px] font-medium whitespace-nowrap">
                          <FiCheckCircle size={11} />
                          {stock}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-2">
                      {product?.isFlashSale ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-orange-100 text-orange-600 text-[10px] font-semibold">
                          <FiZap size={11} />
                          Active
                        </span>
                      ) : (
                        <span className="text-[10px] text-gray-400">
                          Not Active
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-2 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/secret-admin-portal-afia/dashboard/products/edit/${product?._id}`}
                          className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                          title="Edit Product"
                        >
                          <FiEdit size={16} />
                        </Link>

                        <Link
                          href={`/secret-admin-portal-afia/dashboard/products/view/${product?._id}`}
                          className="p-2 text-gray-400 hover:text-primary hover:bg-gray-100 rounded-lg transition-all"
                          title="View Product"
                        >
                          <FiEye size={17} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  </div>

  {/* =========================
      CONTENT GRID
  ========================= */}

  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    {/* =========================
        RECENT ORDERS
    ========================= */}

    <div className="lg:col-span-2 bg-white p-5 md:p-6 rounded-2xl border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-bold text-gray-800">
            Recent Orders
          </h2>

          <p className="text-xs text-gray-400 mt-1">
            Latest 5 orders from your store.
          </p>
        </div>

        <Link
          href="/secret-admin-portal-afia/dashboard/orders"
          className="text-xs text-primary font-semibold hover:underline"
        >
          View All
        </Link>
      </div>

      {loadingOrders ? (
        <div className="py-12 text-center">
          <FiRefreshCw
            size={24}
            className="mx-auto text-gray-400 animate-spin"
          />

          <p className="text-sm text-gray-500 mt-3">
            Loading orders...
          </p>
        </div>
      ) : orderError ? (
        <div className="py-12 text-center">
          <p className="text-sm text-red-500">
            {orderError}
          </p>

          <button
            type="button"
            onClick={fetchOrders}
            className="mt-3 text-xs font-semibold text-primary hover:underline"
          >
            Try Again
          </button>
        </div>
      ) : recentOrders.length === 0 ? (
        <div className="py-12 text-center">
          <FiShoppingBag
            size={30}
            className="mx-auto text-gray-300"
          />

          <p className="text-sm text-gray-500 mt-3">
            No orders found.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                <th className="py-3 px-2">
                  Order ID
                </th>

                <th className="py-3 px-2">
                  Customer
                </th>

                <th className="py-3 px-2">
                  Amount
                </th>

                <th className="py-3 px-2">
                  Status
                </th>

                <th className="py-3 px-2">
                  Date
                </th>

                <th className="py-3 px-2 text-right">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50 text-sm text-gray-700">
              {recentOrders.map((order, index) => {
                const orderId = getOrderId(order);

                const status =
                  order?.status || "Pending";

                const amount = getOrderAmount(order);

                return (
                  <tr
                    key={
                      order?._id ||
                      orderId ||
                      index
                    }
                    className="hover:bg-gray-50/70 transition-colors"
                  >
                    <td className="py-3.5 px-2">
                      <span className="font-semibold text-gray-900 whitespace-nowrap">
                        {orderId}
                      </span>
                    </td>

                    <td className="py-3.5 px-2">
                      <div>
                        <p className="font-medium text-gray-800 whitespace-nowrap">
                          {getCustomerName(order)}
                        </p>

                        {order?.phoneNumber && (
                          <p className="text-[10px] text-gray-400 mt-0.5">
                            {order.phoneNumber}
                          </p>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-2">
                      <span className="font-semibold text-gray-800 whitespace-nowrap">
                        {formatMoney(amount)}
                      </span>
                    </td>

                    <td className="py-3.5 px-2">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-medium whitespace-nowrap ${getStatusClass(
                          status
                        )}`}
                      >
                        {status}
                      </span>
                    </td>

                    <td className="py-3.5 px-2 text-[10px] text-gray-500 whitespace-nowrap">
                      {formatDate(
                        order?.createdAt ||
                          order?.date ||
                          order?.createdDate ||
                          order?.orderDate
                      )}
                    </td>

                    <td className="py-3.5 px-2 text-right">
                      <Link
                        href={`/secret-admin-portal-afia/dashboard/orders/${
                          order?._id || orderId
                        }`}
                        className="text-gray-400 hover:text-primary p-1.5 inline-flex rounded-lg hover:bg-gray-100 transition-all"
                        title="View Order"
                      >
                        <FiEye size={18} />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>

    {/* =========================
        STORE MANAGEMENT
    ========================= */}

    <div className="bg-white p-5 md:p-6 rounded-2xl border border-gray-100 shadow-sm">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-9 h-9 rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center">
          <FiPackage size={17} />
        </div>

        <h2 className="text-lg font-bold text-gray-800">
          Store Management
        </h2>
      </div>

      <p className="text-xs text-gray-400 mb-5">
        Quick access to important sections.
      </p>

      <div className="space-y-2.5">
        <Link
          href="/secret-admin-portal-afia/dashboard/products"
          className="flex items-center justify-between p-3.5 rounded-xl border border-gray-100 hover:border-primary hover:bg-gray-50 transition-all font-medium text-sm text-gray-700"
        >
          <span className="flex items-center gap-2">
            <FiPackage size={16} />
            All Products
          </span>

          <FiArrowRight
            size={16}
            className="text-gray-400"
          />
        </Link>

        <Link
          href="/secret-admin-portal-afia/dashboard/products/create"
          className="flex items-center justify-between p-3.5 rounded-xl border border-gray-100 hover:border-primary hover:bg-gray-50 transition-all font-medium text-sm text-gray-700"
        >
          <span className="flex items-center gap-2">
            <FiPlus size={16} />
            Add New Product
          </span>

          <FiArrowRight
            size={16}
            className="text-gray-400"
          />
        </Link>

        <Link
          href="/secret-admin-portal-afia/dashboard/orders"
          className="flex items-center justify-between p-3.5 rounded-xl border border-gray-100 hover:border-primary hover:bg-gray-50 transition-all font-medium text-sm text-gray-700"
        >
          <span className="flex items-center gap-2">
            <FiShoppingBag size={16} />
            Manage Orders
          </span>

          <FiArrowRight
            size={16}
            className="text-gray-400"
          />
        </Link>

        <Link
          href="/secret-admin-portal-afia/dashboard/users"
          className="flex items-center justify-between p-3.5 rounded-xl border border-gray-100 hover:border-primary hover:bg-gray-50 transition-all font-medium text-sm text-gray-700"
        >
          <span className="flex items-center gap-2">
            <FiActivity size={16} />
            Users & Customers
          </span>

          <FiArrowRight
            size={16}
            className="text-gray-400"
          />
        </Link>
      </div>

      {/* PAYMENT SUMMARY */}

      <div className="mt-5 pt-5 border-t border-gray-100">
        <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-3">
          Payment Summary
        </p>

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-3">
            <p className="text-[10px] text-emerald-600 font-semibold">
              Paid
            </p>

            <p className="text-lg font-bold text-gray-800 mt-1">
              {orderStats.paidOrders}
            </p>
          </div>

          <div className="rounded-xl bg-amber-50 border border-amber-100 p-3">
            <p className="text-[10px] text-amber-600 font-semibold">
              Pending
            </p>

            <p className="text-lg font-bold text-gray-800 mt-1">
              {orderStats.pendingPayment}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>


);
};

export default AdminDashboardPage;
