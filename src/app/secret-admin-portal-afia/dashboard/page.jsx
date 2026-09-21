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

  // =========================
  // FETCH PRODUCTS
  // =========================
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

  // =========================
  // INITIAL FETCH
  // =========================
  useEffect(() => {
    fetchOrders();
    fetchProducts();
  }, []);

  // =========================
  // ORDER DATE
  // =========================
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

  // =========================
  // ORDER STATISTICS
  // =========================
  const orderStats = useMemo(() => {
    const now = new Date();

    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    // Last 7 calendar days including today
    const last7Days = new Date(startOfToday);
    last7Days.setDate(last7Days.getDate() - 6);

    // Last 1 month
    const last1Month = new Date(startOfToday);
    last1Month.setMonth(last1Month.getMonth() - 1);

    // Last 1 year
    const last1Year = new Date(startOfToday);
    last1Year.setFullYear(last1Year.getFullYear() - 1);

    const countSince = (startDate) => {
      return orders.filter((order) => {
        const date = getOrderDate(order);

        if (!date) return false;

        return date >= startDate && date <= now;
      }).length;
    };

    return {
      total: orders.length,
      last7Days: countSince(last7Days),
      last1Month: countSince(last1Month),
      last1Year: countSince(last1Year),
    };
  }, [orders]);

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
  // TOTAL REVENUE
  // =========================
  const totalRevenue = useMemo(() => {
    return orders.reduce((total, order) => {
      return total + getOrderAmount(order);
    }, 0);
  }, [orders]);

  // =========================
  // REVENUE PERIODS
  // =========================
  const revenueStats = useMemo(() => {
    const now = new Date();

    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const last7Days = new Date(startOfToday);
    last7Days.setDate(last7Days.getDate() - 6);

    const last1Month = new Date(startOfToday);
    last1Month.setMonth(last1Month.getMonth() - 1);

    const last1Year = new Date(startOfToday);
    last1Year.setFullYear(last1Year.getFullYear() - 1);

    const calculateRevenue = (startDate) => {
      return orders.reduce((total, order) => {
        const date = getOrderDate(order);

        if (!date) return total;

        if (date >= startDate && date <= now) {
          return total + getOrderAmount(order);
        }

        return total;
      }, 0);
    };

    return {
      last7Days: calculateRevenue(last7Days),
      last1Month: calculateRevenue(last1Month),
      last1Year: calculateRevenue(last1Year),
      total: totalRevenue,
    };
  }, [orders, totalRevenue]);

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
        name: "Last 7 Days",
        revenue: revenueStats.last7Days,
      },
      {
        name: "Last 1 Month",
        revenue: revenueStats.last1Month,
      },
      {
        name: "Last 1 Year",
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
      normalized.includes("return")
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
      value: formatMoney(totalRevenue),
      icon: FiDollarSign,
      color: "bg-emerald-500",
    },
    {
      id: 2,
      title: "Total Orders",
      value: orderStats.total.toLocaleString("en-BD"),
      icon: FiShoppingBag,
      color: "bg-blue-500",
    },
    {
      id: 3,
      title: "Total Products",
      value: productStats.total.toLocaleString("en-BD"),
      icon: FiPackage,
      color: "bg-indigo-500",
    },
    {
      id: 4,
      title: "Total Stock",
      value: productStats.totalStock.toLocaleString("en-BD"),
      icon: FiBarChart2,
      color: "bg-amber-500",
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
          Revenue: {formatMoney(payload[0]?.payload?.revenue || 0)}
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

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-poppins">

      {/* =========================
          DASHBOARD HEADER
      ========================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Admin Dashboard
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Manage your products, orders, revenue, and store overview.
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            href="/secret-admin-portal-afia/dashboard/products/create"
            className="flex items-center gap-2 bg-primary hover:bg-secondary text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-all shadow-sm"
          >
            <FiPlus size={18} />
            Add New Product
          </Link>
        </div>
      </div>

      {/* =========================
          MAIN STATS
      ========================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {stats.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.id}
              className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between"
            >
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                  {item.title}
                </p>

                <h3 className="text-2xl font-bold text-gray-800 mt-1">
                  {item.value}
                </h3>
              </div>

              <div
                className={`p-3.5 rounded-xl text-white ${item.color}`}
              >
                <Icon size={22} />
              </div>
            </div>
          );
        })}
      </div>

      {/* =========================
          PROFESSIONAL ANALYTICS
      ========================= */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">

        {/* =========================
            ORDER OVERVIEW CHART
        ========================= */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-6">

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                  <FiTrendingUp size={18} />
                </div>

                <h2 className="text-lg font-bold text-gray-800">
                  Order Overview
                </h2>
              </div>

              <p className="text-xs text-gray-400 mt-2">
                Daily order activity for the last 7 days
              </p>
            </div>

            <div className="text-right">
              <p className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold">
                Last 7 Days
              </p>

              <p className="text-xl font-bold text-gray-800 mt-0.5">
                {loadingOrders
                  ? "..."
                  : orderStats.last7Days.toLocaleString("en-BD")}
              </p>
            </div>
          </div>

          <div className="h-[300px] w-full">
            {loadingOrders ? (
              <div className="h-full flex items-center justify-center">
                <FiRefreshCw
                  size={25}
                  className="animate-spin text-gray-400"
                />
              </div>
            ) : orderChartData.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <FiShoppingBag
                    size={30}
                    className="mx-auto text-gray-300"
                  />

                  <p className="text-sm text-gray-400 mt-2">
                    No order data available
                  </p>
                </div>
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

          <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400">
                Total Orders
              </p>

              <p className="text-sm font-bold text-gray-800 mt-0.5">
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
            REVENUE ANALYTICS CHART
        ========================= */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-6">

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                  <FiDollarSign size={18} />
                </div>

                <h2 className="text-lg font-bold text-gray-800">
                  Revenue Analytics
                </h2>
              </div>

              <p className="text-xs text-gray-400 mt-2">
                Revenue performance across different periods
              </p>
            </div>

            <div className="text-right">
              <p className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold">
                Total Revenue
              </p>

              <p className="text-xl font-bold text-gray-800 mt-0.5">
                {loadingOrders
                  ? "..."
                  : formatMoney(revenueStats.total)}
              </p>
            </div>
          </div>

          <div className="h-[300px] w-full">
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

          {/* Revenue Summary */}
          <div className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-gray-100">

            <div className="rounded-xl bg-gray-50 p-3">
              <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
                7 Days
              </p>

              <p className="text-sm font-bold text-gray-800 mt-1">
                {loadingOrders
                  ? "..."
                  : formatMoney(revenueStats.last7Days)}
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-3">
              <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
                1 Month
              </p>

              <p className="text-sm font-bold text-gray-800 mt-1">
                {loadingOrders
                  ? "..."
                  : formatMoney(revenueStats.last1Month)}
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-3">
              <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
                1 Year
              </p>

              <p className="text-sm font-bold text-gray-800 mt-1">
                {loadingOrders
                  ? "..."
                  : formatMoney(revenueStats.last1Year)}
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* =========================
          ORDER OVERVIEW
      ========================= */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 md:p-6 mb-8">

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">

          <div>
            <h2 className="text-lg md:text-xl font-bold text-gray-800">
              Order Overview
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Monitor your store orders by time period.
            </p>
          </div>

          <div className="flex items-center gap-2">

            <button
              type="button"
              onClick={fetchOrders}
              disabled={loadingOrders}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all text-sm font-medium disabled:opacity-50"
            >
              <FiRefreshCw
                size={15}
                className={loadingOrders ? "animate-spin" : ""}
              />

              Refresh
            </button>

            <Link
              href="/secret-admin-portal-afia/dashboard/orders"
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition-all text-sm font-medium"
            >
              View Orders
              <FiArrowRight size={15} />
            </Link>

          </div>
        </div>

        {/* Order Time Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

          {/* Total Orders */}
          <Link
            href="/secret-admin-portal-afia/dashboard/orders"
            className="group rounded-xl border border-gray-100 bg-gray-50 p-5 hover:bg-white hover:border-blue-200 hover:shadow-sm transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
                <FiShoppingBag size={20} />
              </div>

              <FiArrowRight
                size={17}
                className="text-gray-300 group-hover:text-blue-500 transition-all"
              />
            </div>

            <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mt-4">
              Total Orders
            </p>

            <h3 className="text-2xl font-bold text-gray-800 mt-1">
              {loadingOrders
                ? "..."
                : orderStats.total.toLocaleString("en-BD")}
            </h3>

            <p className="text-xs text-gray-400 mt-1">
              All orders
            </p>
          </Link>

          {/* Last 7 Days */}
          <Link
            href="/secret-admin-portal-afia/dashboard/orders"
            className="group rounded-xl border border-gray-100 bg-gray-50 p-5 hover:bg-white hover:border-emerald-200 hover:shadow-sm transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-xl bg-emerald-100 text-emerald-600">
                <FiTrendingUp size={20} />
              </div>

              <FiArrowRight
                size={17}
                className="text-gray-300 group-hover:text-emerald-500 transition-all"
              />
            </div>

            <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mt-4">
              Last 7 Days
            </p>

            <h3 className="text-2xl font-bold text-gray-800 mt-1">
              {loadingOrders
                ? "..."
                : orderStats.last7Days.toLocaleString("en-BD")}
            </h3>

            <p className="text-xs text-gray-400 mt-1">
              Orders placed recently
            </p>
          </Link>

          {/* Last 1 Month */}
          <Link
            href="/secret-admin-portal-afia/dashboard/orders"
            className="group rounded-xl border border-gray-100 bg-gray-50 p-5 hover:bg-white hover:border-amber-200 hover:shadow-sm transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-xl bg-amber-100 text-amber-600">
                <FiCalendar size={20} />
              </div>

              <FiArrowRight
                size={17}
                className="text-gray-300 group-hover:text-amber-500 transition-all"
              />
            </div>

            <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mt-4">
              Last 1 Month
            </p>

            <h3 className="text-2xl font-bold text-gray-800 mt-1">
              {loadingOrders
                ? "..."
                : orderStats.last1Month.toLocaleString("en-BD")}
            </h3>

            <p className="text-xs text-gray-400 mt-1">
              Monthly order activity
            </p>
          </Link>

          {/* Last 1 Year */}
          <Link
            href="/secret-admin-portal-afia/dashboard/orders"
            className="group rounded-xl border border-gray-100 bg-gray-50 p-5 hover:bg-white hover:border-violet-200 hover:shadow-sm transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-xl bg-violet-100 text-violet-600">
                <FiBarChart2 size={20} />
              </div>

              <FiArrowRight
                size={17}
                className="text-gray-300 group-hover:text-violet-500 transition-all"
              />
            </div>

            <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mt-4">
              Last 1 Year
            </p>

            <h3 className="text-2xl font-bold text-gray-800 mt-1">
              {loadingOrders
                ? "..."
                : orderStats.last1Year.toLocaleString("en-BD")}
            </h3>

            <p className="text-xs text-gray-400 mt-1">
              Yearly order activity
            </p>
          </Link>

        </div>
      </div>

      {/* =========================
          PRODUCT OVERVIEW
      ========================= */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 md:p-6 mb-8">

        {/* Product Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">

          <div>
            <h2 className="text-lg md:text-xl font-bold text-gray-800">
              Product Overview
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Monitor your products, inventory, and Flash Sale activity.
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
                className={loadingProducts ? "animate-spin" : ""}
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

        {/* Product Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">

          {/* Total Products */}
          <Link
            href="/secret-admin-portal-afia/dashboard/products"
            className="group rounded-xl border border-gray-100 bg-gray-50 p-4 hover:bg-white hover:border-indigo-200 hover:shadow-sm transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-indigo-100 text-indigo-600">
                <FiPackage size={19} />
              </div>

              <FiArrowRight
                size={16}
                className="text-gray-300 group-hover:text-indigo-500"
              />
            </div>

            <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mt-3">
              Total Products
            </p>

            <h3 className="text-2xl font-bold text-gray-800 mt-1">
              {loadingProducts
                ? "..."
                : productStats.total.toLocaleString("en-BD")}
            </h3>
          </Link>

          {/* Flash Sale */}
          <Link
            href="/secret-admin-portal-afia/dashboard/products"
            className="group rounded-xl border border-gray-100 bg-gray-50 p-4 hover:bg-white hover:border-orange-200 hover:shadow-sm transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-orange-100 text-orange-600">
                <FiZap size={19} />
              </div>

              <FiArrowRight
                size={16}
                className="text-gray-300 group-hover:text-orange-500"
              />
            </div>

            <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mt-3">
              Flash Sale
            </p>

            <h3 className="text-2xl font-bold text-gray-800 mt-1">
              {loadingProducts
                ? "..."
                : productStats.flashSale.toLocaleString("en-BD")}
            </h3>
          </Link>

          {/* In Stock */}
          <Link
            href="/secret-admin-portal-afia/dashboard/products"
            className="group rounded-xl border border-gray-100 bg-gray-50 p-4 hover:bg-white hover:border-green-200 hover:shadow-sm transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-green-100 text-green-600">
                <FiCheckCircle size={19} />
              </div>

              <FiArrowRight
                size={16}
                className="text-gray-300 group-hover:text-green-500"
              />
            </div>

            <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mt-3">
              In Stock
            </p>

            <h3 className="text-2xl font-bold text-gray-800 mt-1">
              {loadingProducts
                ? "..."
                : productStats.inStock.toLocaleString("en-BD")}
            </h3>
          </Link>

          {/* Low Stock */}
          <Link
            href="/secret-admin-portal-afia/dashboard/products"
            className="group rounded-xl border border-gray-100 bg-gray-50 p-4 hover:bg-white hover:border-amber-200 hover:shadow-sm transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-amber-100 text-amber-600">
                <FiAlertCircle size={19} />
              </div>

              <FiArrowRight
                size={16}
                className="text-gray-300 group-hover:text-amber-500"
              />
            </div>

            <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mt-3">
              Low Stock
            </p>

            <h3 className="text-2xl font-bold text-gray-800 mt-1">
              {loadingProducts
                ? "..."
                : productStats.lowStock.toLocaleString("en-BD")}
            </h3>

            <p className="text-[11px] text-gray-400 mt-1">
              1 - 5 units
            </p>
          </Link>

          {/* Out Of Stock */}
          <Link
            href="/secret-admin-portal-afia/dashboard/products"
            className="group rounded-xl border border-gray-100 bg-gray-50 p-4 hover:bg-white hover:border-red-200 hover:shadow-sm transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-red-100 text-red-600">
                <FiXCircle size={19} />
              </div>

              <FiArrowRight
                size={16}
                className="text-gray-300 group-hover:text-red-500"
              />
            </div>

            <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mt-3">
              Out of Stock
            </p>

            <h3 className="text-2xl font-bold text-gray-800 mt-1">
              {loadingProducts
                ? "..."
                : productStats.outOfStock.toLocaleString("en-BD")}
            </h3>
          </Link>

        </div>

        {/* Recent Products */}
        <div className="border-t border-gray-100 pt-5">

          <div className="flex items-center justify-between mb-4">

            <div>
              <h3 className="text-base font-bold text-gray-800">
                Recent Products
              </h3>

              <p className="text-xs text-gray-400 mt-1">
                Latest products added to your store
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
            <div className="py-12 text-center">

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
                  <tr className="border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase">

                    <th className="py-3 px-2">
                      Product
                    </th>

                    <th className="py-3 px-2">
                      Category
                    </th>

                    <th className="py-3 px-2">
                      Price
                    </th>

                    <th className="py-3 px-2">
                      Stock
                    </th>

                    <th className="py-3 px-2">
                      Flash Sale
                    </th>

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

                        {/* Product */}
                        <td className="py-3 px-2">

                          <div className="flex items-center gap-3 min-w-[220px]">

                            <img
                              src={productImage}
                              alt={product?.title || "Product"}
                              className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                            />

                            <div className="min-w-0">

                              <p className="font-semibold text-gray-800 truncate max-w-[220px]">
                                {product?.title || "Untitled Product"}
                              </p>

                              {product?.sku && (
                                <p className="text-[11px] text-gray-400 mt-0.5">
                                  SKU: {product.sku}
                                </p>
                              )}

                            </div>

                          </div>

                        </td>

                        {/* Category */}
                        <td className="py-3 px-2 text-gray-500 whitespace-nowrap">
                          {typeof product?.category === "object"
                            ? product?.category?.name || "-"
                            : product?.category || "-"}
                        </td>

                        {/* Price */}
                        <td className="py-3 px-2 whitespace-nowrap">

                          <div className="font-semibold text-gray-800">
                            ৳
                            {Number(productPrice).toLocaleString(
                              "en-BD"
                            )}
                          </div>

                          {product?.discountPrice &&
                            Number(product.discountPrice) <
                              Number(product?.price || 0) && (
                              <div className="text-[11px] text-gray-400 line-through">
                                ৳
                                {Number(product.price).toLocaleString(
                                  "en-BD"
                                )}
                              </div>
                            )}

                        </td>

                        {/* Stock */}
                        <td className="py-3 px-2">

                          {stock <= 0 ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-xs font-medium">

                              <FiXCircle size={12} />

                              Out of Stock
                            </span>
                          ) : stock <= 5 ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">

                              <FiAlertCircle size={12} />

                              {stock} left
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">

                              <FiCheckCircle size={12} />

                              {stock}
                            </span>
                          )}

                        </td>

                        {/* Flash Sale */}
                        <td className="py-3 px-2">

                          {product?.isFlashSale ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-100 text-orange-600 text-xs font-semibold">

                              <FiZap size={12} />

                              Active
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">
                              Not Active
                            </span>
                          )}

                        </td>

                        {/* Action */}
                        <td className="py-3 px-2 text-right">

                          <div className="flex items-center justify-end gap-1">

                            {/* Edit */}
                            <Link
                              href={`/secret-admin-portal-afia/dashboard/products/edit/${product?._id}`}
                              className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                              title="Edit Product"
                            >
                              <FiEdit size={16} />
                            </Link>

                            {/* View Product */}
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* =========================
            RECENT ORDERS
        ========================= */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">

          <div className="flex items-center justify-between mb-5">

            <div>
              <h2 className="text-lg font-bold text-gray-800">
                Recent Orders
              </h2>

              <p className="text-xs text-gray-400 mt-1">
                Latest 5 orders from your store
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
            <div className="py-14 text-center">

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
                  <tr className="border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase">

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
                          <span className="font-semibold text-gray-900">
                            {orderId}
                          </span>
                        </td>

                        <td className="py-3.5 px-2">

                          <div>

                            <p className="font-medium text-gray-800">
                              {getCustomerName(order)}
                            </p>

                            {order?.phoneNumber && (
                              <p className="text-xs text-gray-400 mt-0.5">
                                {order.phoneNumber}
                              </p>
                            )}

                          </div>

                        </td>

                        <td className="py-3.5 px-2">

                          <span className="font-semibold text-gray-800">
                            {formatMoney(amount)}
                          </span>

                        </td>

                        <td className="py-3.5 px-2">

                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusClass(
                              status
                            )}`}
                          >
                            {status}
                          </span>

                        </td>

                        <td className="py-3.5 px-2 text-xs text-gray-500 whitespace-nowrap">
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
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">

          <h2 className="text-lg font-bold text-gray-800 mb-1">
            Store Management
          </h2>

          <p className="text-xs text-gray-400 mb-5">
            Quick access to important sections.
          </p>

          <div className="space-y-3">

            <Link
              href="/secret-admin-portal-afia/dashboard/products"
              className="flex items-center justify-between p-3.5 rounded-lg border border-gray-100 hover:border-primary hover:bg-gray-50 transition-all font-medium text-sm text-gray-700"
            >
              <span>📦 All Products List</span>

              <FiArrowRight
                size={16}
                className="text-gray-400"
              />
            </Link>

            <Link
              href="/secret-admin-portal-afia/dashboard/products/create"
              className="flex items-center justify-between p-3.5 rounded-lg border border-gray-100 hover:border-primary hover:bg-gray-50 transition-all font-medium text-sm text-gray-700"
            >
              <span>➕ Add New Product</span>

              <FiArrowRight
                size={16}
                className="text-gray-400"
              />
            </Link>

            <Link
              href="/secret-admin-portal-afia/dashboard/orders"
              className="flex items-center justify-between p-3.5 rounded-lg border border-gray-100 hover:border-primary hover:bg-gray-50 transition-all font-medium text-sm text-gray-700"
            >
              <span>🛒 Manage Orders</span>

              <FiArrowRight
                size={16}
                className="text-gray-400"
              />
            </Link>

            <Link
              href="/secret-admin-portal-afia/dashboard/users"
              className="flex items-center justify-between p-3.5 rounded-lg border border-gray-100 hover:border-primary hover:bg-gray-50 transition-all font-medium text-sm text-gray-700"
            >
              <span>👥 Users & Customers</span>

              <FiArrowRight
                size={16}
                className="text-gray-400"
              />
            </Link>

          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboardPage;

