"use client";

import React, { useEffect, useMemo, useState } from "react";

import Image from "next/image";

import { Spinner } from "@heroui/react";

import {
  ShieldCheck,
  Truck,
  Loader2,
  Copy,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  PackageCheck,
  Pencil,
  Save,
  X,
  ShoppingBag,
  CalendarDays,
  CalendarRange,
  Clock3,
  Trash2,
  Search,
  MapPin,
  Phone,
  User,
  Package,
  Ruler,
} from "lucide-react";

import { toast } from "react-hot-toast";

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);

  const [actionLoading, setActionLoading] = useState({});

  const [copiedId, setCopiedId] = useState("");

  // ========================================
  // ORDER FILTER STATE
  // ========================================

  const [orderPeriod, setOrderPeriod] = useState("all");

  // ========================================
  // ORDER SEARCH STATE
  // ========================================

  const [orderSearch, setOrderSearch] = useState("");

  // ========================================
  // CUSTOMER EDIT STATE
  // ========================================

  const [editingCustomerId, setEditingCustomerId] =
    useState(null);

  const [editingPhone, setEditingPhone] =
    useState("");

  const [editingAddress, setEditingAddress] =
    useState("");

  // ========================================
  // DELETE ORDER STATE
  // ========================================

  const [deleteOrder, setDeleteOrder] =
    useState(null);

  const apiUrl = (
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:5000"
  ).replace(/\/+$/, "");

  // ========================================
  // FETCH ORDERS
  // ========================================

  const fetchOrders = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        `${apiUrl}/api/orders`,
        {
          method: "GET",

          headers: {
            Accept: "application/json",
          },

          cache: "no-store",
        }
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to load orders"
        );
      }

      setOrders(
        Array.isArray(data.orders)
          ? data.orders.filter(
              (order) =>
                order &&
                typeof order === "object"
            )
          : []
      );
    } catch (error) {
      console.error(
        "Failed to fetch orders:",
        error
      );

      toast.error(
        error.message ||
          "Failed to load orders"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // ========================================
  // ORDER STATISTICS
  // ========================================

  const orderStats = useMemo(() => {
    const now = new Date();

    const sevenDaysAgo = new Date(now);

    sevenDaysAgo.setDate(
      sevenDaysAgo.getDate() - 7
    );

    const oneMonthAgo = new Date(now);

    oneMonthAgo.setMonth(
      oneMonthAgo.getMonth() - 1
    );

    const oneYearAgo = new Date(now);

    oneYearAgo.setFullYear(
      oneYearAgo.getFullYear() - 1
    );

    let last7Days = 0;
    let lastMonth = 0;
    let lastYear = 0;

    orders.forEach((order) => {
      if (!order?.createdAt) return;

      const createdAt = new Date(
        order.createdAt
      );

      if (Number.isNaN(createdAt.getTime())) {
        return;
      }

      if (createdAt >= sevenDaysAgo) {
        last7Days++;
      }

      if (createdAt >= oneMonthAgo) {
        lastMonth++;
      }

      if (createdAt >= oneYearAgo) {
        lastYear++;
      }
    });

    return {
      total: orders.length,
      last7Days,
      lastMonth,
      lastYear,
    };
  }, [orders]);

  // ========================================
  // FILTER + SEARCH ORDERS
  // ========================================

  const filteredOrders = useMemo(() => {
    let result = orders;

    if (orderPeriod !== "all") {
      const now = new Date();

      const startDate = new Date(now);

      if (orderPeriod === "7days") {
        startDate.setDate(
          startDate.getDate() - 7
        );
      }

      if (orderPeriod === "month") {
        startDate.setMonth(
          startDate.getMonth() - 1
        );
      }

      if (orderPeriod === "year") {
        startDate.setFullYear(
          startDate.getFullYear() - 1
        );
      }

      result = result.filter((order) => {
        if (!order?.createdAt) {
          return false;
        }

        const createdAt = new Date(
          order.createdAt
        );

        if (
          Number.isNaN(
            createdAt.getTime()
          )
        ) {
          return false;
        }

        return createdAt >= startDate;
      });
    }

    const search = orderSearch
      .trim()
      .toLowerCase();

    if (search) {
      result = result.filter((order) => {
        const customerName = String(
          order?.fullName || ""
        ).toLowerCase();

        const phoneNumber = String(
          order?.phoneNumber || ""
        ).toLowerCase();

        const orderId = String(
          order?.orderId || ""
        ).toLowerCase();

        return (
          customerName.includes(search) ||
          phoneNumber.includes(search) ||
          orderId.includes(search)
        );
      });
    }

    return result;
  }, [
    orders,
    orderPeriod,
    orderSearch,
  ]);

  // ========================================
  // PERIOD LABEL
  // ========================================

  const selectedPeriodLabel = useMemo(() => {
    switch (orderPeriod) {
      case "7days":
        return "Last 7 Days";

      case "month":
        return "Last 1 Month";

      case "year":
        return "Last 1 Year";

      default:
        return "All Orders";
    }
  }, [orderPeriod]);

  // ========================================
  // ACTION LOADING
  // ========================================

  const setAction = (
    orderId,
    action,
    value
  ) => {
    setActionLoading((prev) => ({
      ...prev,

      [`${orderId}-${action}`]:
        value,
    }));
  };

  const isActionLoading = (
    orderId,
    action
  ) => {
    return !!actionLoading[
      `${orderId}-${action}`
    ];
  };

  // ========================================
  // START CUSTOMER EDIT
  // ========================================

  const handleStartCustomerEdit = (
    order
  ) => {
    if (!order?._id) return;

    setEditingCustomerId(order._id);

    setEditingPhone(
      order.phoneNumber || ""
    );

    setEditingAddress(
      order.streetAddress || ""
    );
  };

  // ========================================
  // CANCEL CUSTOMER EDIT
  // ========================================

  const handleCancelCustomerEdit = () => {
    setEditingCustomerId(null);

    setEditingPhone("");

    setEditingAddress("");
  };

  // ========================================
  // SAVE CUSTOMER PHONE + ADDRESS
  // ========================================

  const handleSaveCustomerInfo = async (
    order
  ) => {
    if (!order?._id) {
      toast.error("Invalid order.");

      return;
    }

    const cleanPhone =
      editingPhone.trim();

    const cleanAddress =
      editingAddress.trim();

    if (!cleanPhone) {
      toast.error(
        "Customer phone number cannot be empty."
      );

      return;
    }

    if (!cleanAddress) {
      toast.error(
        "Customer address cannot be empty."
      );

      return;
    }

    setAction(
      order._id,
      "customerInfo",
      true
    );

    try {
      const res = await fetch(
        `${apiUrl}/api/orders/${order._id}/customer-info`,
        {
          method: "PUT",

          headers: {
            Accept: "application/json",

            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            phoneNumber:
              cleanPhone,

            streetAddress:
              cleanAddress,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to update customer information."
        );
      }

      setOrders(
        (prevOrders) =>
          prevOrders.map(
            (item) =>
              item?._id === order._id
                ? {
                    ...item,

                    phoneNumber:
                      data.order
                        ?.phoneNumber ||
                      cleanPhone,

                    streetAddress:
                      data.order
                        ?.streetAddress ||
                      cleanAddress,

                    updatedAt:
                      data.order
                        ?.updatedAt ||
                      item.updatedAt,
                  }
                : item
          )
      );

      setEditingCustomerId(null);

      setEditingPhone("");

      setEditingAddress("");

      toast.success(
        "Customer phone and address updated successfully."
      );
    } catch (error) {
      console.error(
        "Customer information update error:",
        error
      );

      toast.error(
        error.message ||
          "Failed to update customer information."
      );
    } finally {
      setAction(
        order._id,
        "customerInfo",
        false
      );
    }
  };

  // ========================================
  // FRAUD CHECK
  // ========================================

  const handleFraudCheck = async (
    order
  ) => {
    if (!order?._id) {
      toast.error("Invalid order.");

      return;
    }

    setAction(
      order._id,
      "fraud",
      true
    );

    try {
      const res = await fetch(
        `${apiUrl}/api/fraud/check/${order._id}`,
        {
          method: "GET",

          headers: {
            Accept: "application/json",
          },

          cache: "no-store",
        }
      );

      const data = await res.json();

      if (
        !res.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Fraud check failed"
        );
      }

      const fraudResult =
        data.fraudCheck ||
        data.result ||
        null;

      if (!fraudResult) {
        throw new Error(
          "Fraud check returned no data."
        );
      }

      setOrders(
        (prevOrders) =>
          prevOrders.map(
            (item) =>
              item?._id === order._id
                ? {
                    ...item,

                    fraudCheck:
                      fraudResult,
                  }
                : item
          )
      );

      if (
        fraudResult.riskLevel ===
        "Unverified"
      ) {
        toast.success(
          "No SteadFast history found for this number."
        );
      } else {
        toast.success(
          `Fraud check completed — ${fraudResult.riskLevel} risk`
        );
      }
    } catch (error) {
      console.error(
        "Fraud check error:",
        error
      );

      toast.error(
        error.message ||
          "Fraud check failed"
      );
    } finally {
      setAction(
        order._id,
        "fraud",
        false
      );
    }
  };

  // ========================================
  // PATHAO ENTRY
  // ========================================

  const handlePathaoEntry = async (
    order
  ) => {
    if (!order?._id) {
      toast.error("Invalid order.");

      return;
    }

    const existingCourier =
      order.courier?.provider ||
      order.courier?.name ||
      order.courierName ||
      null;

    const existingConsignment =
      order.courier?.consignmentId ||
      order.consignmentId ||
      order.consignment_id ||
      null;

    if (
      existingCourier ||
      existingConsignment
    ) {
      toast.error(
        "This order has already been submitted to a courier."
      );

      return;
    }

    if (
      !String(
        order.streetAddress || ""
      ).trim()
    ) {
      toast.error(
        "Please add the customer's address before sending to Pathao."
      );

      return;
    }

    if (
      !String(
        order.phoneNumber || ""
      ).trim()
    ) {
      toast.error(
        "Please add the customer's phone number before sending to Pathao."
      );

      return;
    }

    const confirmed =
      window.confirm(
        `Are you sure you want to send ${order.orderId} to Pathao?`
      );

    if (!confirmed) return;

    setAction(
      order._id,
      "pathao",
      true
    );

    try {
      const res = await fetch(
        `${apiUrl}/api/courier/push-to-pathao/${order._id}`,
        {
          method: "POST",

          headers: {
            Accept: "application/json",

            "Content-Type":
              "application/json",
          },
        }
      );

      const data = await res.json();

      if (
        !res.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Failed to send order to Pathao"
        );
      }

      toast.success(
        "Order successfully sent to Pathao."
      );

      if (
        data?.order &&
        typeof data.order ===
          "object" &&
        data.order._id
      ) {
        setOrders((prevOrders) =>
          prevOrders.map(
            (item) =>
              item?._id === order._id
                ? data.order
                : item
          )
        );
      } else {
        await fetchOrders();
      }
    } catch (error) {
      console.error(
        "Pathao entry error:",
        error
      );

      toast.error(
        error.message ||
          "Pathao entry failed"
      );
    } finally {
      setAction(
        order._id,
        "pathao",
        false
      );
    }
  };

  // ========================================
  // STEADFAST ENTRY
  // ========================================

  const handleSteadFastEntry = async (
    order
  ) => {
    if (!order?._id) {
      toast.error("Invalid order.");

      return;
    }

    const existingCourier =
      order.courier?.provider ||
      order.courier?.name ||
      order.courierName ||
      null;

    const existingConsignment =
      order.courier?.consignmentId ||
      order.consignmentId ||
      order.consignment_id ||
      null;

    if (
      existingCourier ||
      existingConsignment
    ) {
      toast.error(
        "This order has already been submitted to a courier."
      );

      return;
    }

    if (
      !String(
        order.streetAddress || ""
      ).trim()
    ) {
      toast.error(
        "Please add the customer's address before sending to SteadFast."
      );

      return;
    }

    if (
      !String(
        order.phoneNumber || ""
      ).trim()
    ) {
      toast.error(
        "Please add the customer's phone number before sending to SteadFast."
      );

      return;
    }

    const confirmed =
      window.confirm(
        `Are you sure you want to send ${order.orderId} to SteadFast?`
      );

    if (!confirmed) return;

    setAction(
      order._id,
      "steadfast",
      true
    );

    try {
      const res = await fetch(
        `${apiUrl}/api/courier/push-to-steadfast/${order._id}`,
        {
          method: "POST",

          headers: {
            Accept: "application/json",

            "Content-Type":
              "application/json",
          },
        }
      );

      const data = await res.json();

      if (
        !res.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Failed to send order to SteadFast"
        );
      }

      toast.success(
        "Order successfully sent to SteadFast."
      );

      await fetchOrders();
    } catch (error) {
      console.error(
        "SteadFast entry error:",
        error
      );

      toast.error(
        error.message ||
          "SteadFast entry failed"
      );
    } finally {
      setAction(
        order._id,
        "steadfast",
        false
      );
    }
  };

  // ========================================
  // DELETE ORDER
  // ========================================

  const handleDeleteOrder = async () => {
    if (!deleteOrder?._id) {
      toast.error("Invalid order.");

      return;
    }

    const orderId =
      deleteOrder._id;

    setAction(
      orderId,
      "delete",
      true
    );

    try {
      const res = await fetch(
        `${apiUrl}/api/orders/${orderId}`,
        {
          method: "DELETE",

          headers: {
            Accept: "application/json",
          },
        }
      );

      const data = await res.json();

      if (
        !res.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Failed to delete order."
        );
      }

      setOrders(
        (prevOrders) =>
          prevOrders.filter(
            (order) =>
              order?._id !== orderId
          )
      );

      setDeleteOrder(null);

      toast.success(
        "Order deleted successfully."
      );
    } catch (error) {
      console.error(
        "Delete order error:",
        error
      );

      toast.error(
        error.message ||
          "Failed to delete order."
      );
    } finally {
      setAction(
        orderId,
        "delete",
        false
      );
    }
  };

  // ========================================
  // COPY TRACKING
  // ========================================

  const copyTracking = async (
    value
  ) => {
    if (!value) return;

    try {
      await navigator.clipboard.writeText(
        value
      );

      setCopiedId(value);

      setTimeout(() => {
        setCopiedId("");
      }, 1500);

      toast.success("Copied");
    } catch (error) {
      console.error(
        "Copy failed:",
        error
      );
    }
  };

  // ========================================
  // STATUS STYLE
  // ========================================

  const getStatusStyle = (
    status
  ) => {
    const normalized = String(
      status || ""
    )
      .toLowerCase()
      .trim();

    if (
      normalized.includes(
        "delivered"
      )
    ) {
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
    }

    if (
      normalized.includes(
        "shipped"
      ) ||
      normalized.includes(
        "transit"
      ) ||
      normalized.includes(
        "out for delivery"
      )
    ) {
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
    }

    if (
      normalized.includes(
        "cancel"
      ) ||
      normalized.includes(
        "failed"
      ) ||
      normalized.includes(
        "return"
      )
    ) {
      return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    }

    if (
      normalized.includes(
        "processing"
      )
    ) {
      return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
    }

    if (
      normalized.includes(
        "ready"
      )
    ) {
      return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
    }

    return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
  };

  // ========================================
  // FRAUD RISK STYLE
  // ========================================

  const getFraudRiskStyle = (
    riskLevel
  ) => {
    switch (riskLevel) {
      case "High":
        return {
          Icon: AlertTriangle,

          boxClass:
            "bg-red-50 border-red-100 dark:bg-red-950/30 dark:border-red-900/50",

          iconClass:
            "text-red-500",

          textClass:
            "text-red-600 dark:text-red-400",
        };

      case "Medium":
        return {
          Icon: AlertTriangle,

          boxClass:
            "bg-orange-50 border-orange-100 dark:bg-orange-950/30 dark:border-orange-900/50",

          iconClass:
            "text-orange-500",

          textClass:
            "text-orange-600 dark:text-orange-400",
        };

      case "Unverified":
        return {
          Icon: HelpCircle,

          boxClass:
            "bg-gray-50 border-gray-200 dark:bg-slate-800 dark:border-slate-700",

          iconClass:
            "text-gray-400",

          textClass:
            "text-gray-500 dark:text-gray-400",
        };

      case "Low":
      default:
        return {
          Icon: CheckCircle2,

          boxClass:
            "bg-emerald-50 border-emerald-100 dark:bg-emerald-950/30 dark:border-emerald-900/50",

          iconClass:
            "text-emerald-500",

          textClass:
            "text-emerald-600 dark:text-emerald-400",
        };
    }
  };

  // ========================================
  // ORDER STAT CARD
  // ========================================

  const OrderStatCard = ({
    id,
    title,
    count,
    subtitle,
    icon: Icon,
  }) => {
    const isActive =
      orderPeriod === id;

    return (
      <button
        type="button"
        onClick={() =>
          setOrderPeriod(id)
        }
        className={`w-full text-left rounded-2xl border p-4 md:p-5 transition-all duration-200 ${
          isActive
            ? "border-amber-400 bg-amber-50 shadow-md ring-1 ring-amber-300 dark:bg-amber-950/30 dark:border-amber-500 dark:ring-amber-600"
            : "border-gray-200 bg-white hover:border-amber-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:hover:border-amber-500"
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs md:text-sm font-medium text-gray-500 dark:text-slate-400">
              {title}
            </p>

            <p className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mt-1">
              {count.toLocaleString()}
            </p>

            <p className="text-[11px] md:text-xs text-gray-400 dark:text-slate-500 mt-1">
              {subtitle}
            </p>
          </div>

          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              isActive
                ? "bg-amber-500 text-white"
                : "bg-gray-100 text-gray-500 dark:bg-slate-700 dark:text-slate-300"
            }`}
          >
            <Icon size={19} />
          </div>
        </div>

        {isActive && (
          <div className="mt-3 text-[11px] font-semibold text-amber-700 dark:text-amber-400">
            Currently viewing
          </div>
        )}
      </button>
    );
  };

  // ========================================
  // LOADING
  // ========================================

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spinner color="danger" />
      </div>
    );
  }

  return (
    <div className="admin-orders-page p-4 md:p-6 max-w-[1800px] mx-auto">

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Manage Customer Orders
        </h1>

        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
          Manage orders, customer information,
          fraud checks and courier shipments.
        </p>
      </div>

      {/* ========================================
          ORDER STATISTICS
      ======================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <OrderStatCard
          id="all"
          title="Total Orders"
          count={orderStats.total}
          subtitle="All customer orders"
          icon={ShoppingBag}
        />

        <OrderStatCard
          id="7days"
          title="Last 7 Days"
          count={orderStats.last7Days}
          subtitle="Orders in the last 7 days"
          icon={Clock3}
        />

        <OrderStatCard
          id="month"
          title="Last 1 Month"
          count={orderStats.lastMonth}
          subtitle="Orders in the last month"
          icon={CalendarDays}
        />

        <OrderStatCard
          id="year"
          title="Last 1 Year"
          count={orderStats.lastYear}
          subtitle="Orders in the last year"
          icon={CalendarRange}
        />
      </div>

      {/* ========================================
          ALL ORDERS + SEARCH
      ======================================== */}

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              {selectedPeriodLabel}
            </h2>

            {orderPeriod !== "all" && (
              <button
                type="button"
                onClick={() =>
                  setOrderPeriod("all")
                }
                className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 text-[10px] font-semibold"
              >
                <X size={11} />

                Clear
              </button>
            )}
          </div>

          <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
            Showing{" "}
            <span className="font-semibold text-gray-700 dark:text-slate-200">
              {filteredOrders.length.toLocaleString()}
            </span>{" "}
            order
            {filteredOrders.length !==
            1
              ? "s"
              : ""}
          </p>
        </div>

        {/* SEARCH DIRECTLY BESIDE ALL ORDERS */}

        <div className="w-full lg:w-[390px]">
          <div className="relative">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={orderSearch}
              onChange={(e) =>
                setOrderSearch(
                  e.target.value
                )
              }
              placeholder="Search name, phone or order ID..."
              className="w-full h-11 rounded-xl border border-gray-200 bg-white dark:border-slate-700 dark:bg-slate-800 pl-10 pr-10 text-sm text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400 transition"
            />

            {orderSearch && (
              <button
                type="button"
                onClick={() =>
                  setOrderSearch("")
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 dark:hover:text-white"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ========================================
          ORDERS
      ======================================== */}

      {filteredOrders.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-12 text-center">
          <PackageCheck
            className="mx-auto text-gray-300 dark:text-slate-600 mb-3"
            size={45}
          />

          <p className="text-gray-500 dark:text-slate-400 font-medium">
            No orders found for{" "}
            {selectedPeriodLabel.toLowerCase()}.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map(
            (order) => {
              if (
                !order ||
                typeof order !==
                  "object"
              ) {
                return null;
              }

              const courierProvider =
                order.courier
                  ?.provider ||
                order.courier?.name ||
                order.courierName ||
                null;

              const consignmentId =
                order.courier
                  ?.consignmentId ||
                order.consignmentId ||
                order.consignment_id ||
                null;

              const trackingCode =
                order.courier
                  ?.trackingCode ||
                order.trackingCode ||
                order.tracking_code ||
                null;

              const courierStatus =
                order.courier
                  ?.status ||
                order.delivery_status ||
                null;

              const courierSubmitted =
                !!courierProvider ||
                !!consignmentId;

              const fraud =
                order.fraudCheck;

              const fraudRiskStyle =
                fraud?.checked
                  ? getFraudRiskStyle(
                      fraud.riskLevel
                    )
                  : null;

              const fraudReportCount =
                Array.isArray(
                  fraud?.fraudReports
                )
                  ? fraud.fraudReports
                      .length
                  : 0;

              const isEditingCustomer =
                editingCustomerId ===
                order._id;

              return (
                <div
                  key={order._id}
                  className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-md transition overflow-hidden"
                >
                  {/* ========================================
                      TOP BAR
                  ======================================== */}

                  <div className="px-4 md:px-5 py-3 border-b border-gray-100 dark:border-slate-700 bg-gray-50/70 dark:bg-slate-900/50">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <div>
                          <p className="text-[10px] uppercase tracking-wide font-bold text-gray-400 dark:text-slate-500">
                            Order ID
                          </p>

                          <p className="font-mono font-bold text-amber-700 dark:text-amber-400 text-sm">
                            {order.orderId ||
                              "N/A"}
                          </p>
                        </div>

                        <div className="h-7 w-px bg-gray-200 dark:bg-slate-700 hidden sm:block" />

                        <div>
                          <p className="text-[10px] uppercase tracking-wide font-bold text-gray-400 dark:text-slate-500">
                            Order Date
                          </p>

                          <p className="text-xs font-medium text-gray-700 dark:text-slate-300">
                            {order.createdAt
                              ? new Date(
                                  order.createdAt
                                ).toLocaleString()
                              : "N/A"}
                          </p>
                        </div>

                        <div className="h-7 w-px bg-gray-200 dark:bg-slate-700 hidden sm:block" />

                        <span
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap ${getStatusStyle(
                            order.status
                          )}`}
                        >
                          {order.status ||
                            "Pending"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 dark:text-slate-400">
                          Total:
                        </span>

                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                          ৳
                          {Number(
                            order.totalCost ||
                              0
                          ).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* ========================================
                      MAIN CONTENT
                  ======================================== */}

                  <div className="p-4 md:p-5">
                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">

                      {/* ========================================
                          CUSTOMER
                      ======================================== */}

                      <div className="xl:col-span-3">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                            <User size={16} />
                          </div>

                          <div>
                            <p className="text-xs font-bold text-gray-900 dark:text-white">
                              Customer
                            </p>

                            <p className="text-[10px] text-gray-400 dark:text-slate-500">
                              Customer information
                            </p>
                          </div>
                        </div>

                        {isEditingCustomer ? (
                          <div className="space-y-3">
                            <div>
                              <label className="block text-[10px] font-semibold text-gray-500 dark:text-slate-400 mb-1">
                                Phone Number
                              </label>

                              <div className="relative">
                                <Phone
                                  size={13}
                                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                                />

                                <input
                                  type="text"
                                  value={
                                    editingPhone
                                  }
                                  onChange={(
                                    e
                                  ) =>
                                    setEditingPhone(
                                      e
                                        .target
                                        .value
                                    )
                                  }
                                  className="w-full h-9 border border-orange-300 dark:border-orange-700 rounded-lg pl-8 pr-2 text-xs text-gray-800 dark:text-white bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-200"
                                  placeholder="01XXXXXXXXX"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-[10px] font-semibold text-gray-500 dark:text-slate-400 mb-1">
                                Address
                              </label>

                              <div className="relative">
                                <MapPin
                                  size={13}
                                  className="absolute left-2.5 top-2.5 text-gray-400"
                                />

                                <textarea
                                  value={
                                    editingAddress
                                  }
                                  onChange={(
                                    e
                                  ) =>
                                    setEditingAddress(
                                      e
                                        .target
                                        .value
                                    )
                                  }
                                  rows={4}
                                  className="w-full border border-orange-300 dark:border-orange-700 rounded-lg py-2 pl-8 pr-2 text-xs text-gray-800 dark:text-white bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-200 resize-none"
                                  placeholder="Enter complete customer address..."
                                />
                              </div>
                            </div>

                            {courierSubmitted && (
                              <div className="bg-orange-50 dark:bg-orange-950/30 border border-orange-100 dark:border-orange-900/50 rounded-lg p-2">
                                <p className="text-[10px] text-orange-700 dark:text-orange-400 leading-4">
                                  This order is already
                                  submitted to{" "}
                                  <b>
                                    {
                                      courierProvider
                                    }
                                  </b>
                                  . Updating here changes
                                  your website order only.
                                </p>
                              </div>
                            )}

                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  handleSaveCustomerInfo(
                                    order
                                  )
                                }
                                disabled={isActionLoading(
                                  order._id,
                                  "customerInfo"
                                )}
                                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 text-[11px] font-semibold"
                              >
                                {isActionLoading(
                                  order._id,
                                  "customerInfo"
                                ) ? (
                                  <Loader2
                                    size={
                                      13
                                    }
                                    className="animate-spin"
                                  />
                                ) : (
                                  <Save
                                    size={
                                      13
                                    }
                                  />
                                )}

                                Save
                              </button>

                              <button
                                type="button"
                                onClick={
                                  handleCancelCustomerEdit
                                }
                                disabled={isActionLoading(
                                  order._id,
                                  "customerInfo"
                                )}
                                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 text-[11px] font-semibold"
                              >
                                <X
                                  size={
                                    13
                                  }
                                />

                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <p className="font-semibold text-sm text-gray-900 dark:text-white">
                              {order.fullName ||
                                "Unknown Customer"}
                            </p>

                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-slate-400">
                              <Phone
                                size={13}
                              />

                              <span>
                                {order.phoneNumber ||
                                  "No phone"}
                              </span>
                            </div>

                            <div className="flex items-start gap-2">
                              <MapPin
                                size={13}
                                className="text-gray-400 mt-0.5 shrink-0"
                              />

                              <p className="text-xs text-gray-500 dark:text-slate-400 leading-5">
                                {order.streetAddress ||
                                  "No address"}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                handleStartCustomerEdit(
                                  order
                                )
                              }
                              className="inline-flex items-center gap-1.5 mt-1 text-[10px] font-semibold text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 hover:underline"
                            >
                              <Pencil
                                size={
                                  11
                                }
                              />

                              Edit Phone & Address
                            </button>

                            {order.orderNotes && (
                              <div className="mt-2 bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 rounded-lg p-2">
                                <p className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">
                                  Order Note
                                </p>

                                <p className="text-xs italic text-blue-700 dark:text-blue-300 mt-0.5">
                                  {
                                    order.orderNotes
                                  }
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* ========================================
                          PRODUCTS
                      ======================================== */}

                      <div className="xl:col-span-4">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                            <Package
                              size={16}
                            />
                          </div>

                          <div>
                            <p className="text-xs font-bold text-gray-900 dark:text-white">
                              Products
                            </p>

                            <p className="text-[10px] text-gray-400 dark:text-slate-500">
                              {order.cart
                                ?.length ||
                                0}{" "}
                              item(s)
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                          {Array.isArray(
                            order.cart
                          ) &&
                            order.cart.map(
                              (
                                item,
                                idx
                              ) => {
                                const customization =
                                  item?.customization ||
                                  {};

                                const hasCustomization =
                                  Boolean(
                                    customization.length ||
                                    customization.height ||
                                    customization.width
                                  );

                                return (
                                  <div
                                    key={
                                      item?.cartItemId ||
                                      idx
                                    }
                                    className="flex items-start gap-2.5 border border-gray-100 dark:border-slate-700 rounded-xl p-2.5 bg-gray-50/50 dark:bg-slate-900/50"
                                  >
                                    <div className="w-11 h-11 relative bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shrink-0 overflow-hidden">
                                      <Image
                                        src={
                                          item?.thumbnail ||
                                          "/placeholder.png"
                                        }
                                        alt={
                                          item?.title ||
                                          "Product"
                                        }
                                        fill
                                        sizes="44px"
                                        className="object-cover"
                                      />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                      <p className="font-semibold text-xs text-gray-800 dark:text-white line-clamp-2">
                                        {item?.title ||
                                          "Product"}
                                      </p>

                                      <p className="text-[10px] text-gray-500 dark:text-slate-400 mt-0.5">
                                        ৳
                                        {item?.price ??
                                          0}{" "}
                                        ×{" "}
                                        {item?.quantity ||
                                          1}
                                      </p>

                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {item?.selectedColor && (
                                          <span className="bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-200 text-[9px] px-1.5 py-0.5 rounded border border-gray-200 dark:border-slate-600 font-medium">
                                            Color:{" "}
                                            {
                                              item.selectedColor
                                            }
                                          </span>
                                        )}

                                        {item?.selectedSize && (
                                          <span className="bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-[9px] px-1.5 py-0.5 rounded font-medium">
                                            Size:{" "}
                                            {
                                              item.selectedSize
                                            }
                                          </span>
                                        )}
                                      </div>

                                      {/* ========================================
                                          CUSTOM MEASUREMENT
                                      ======================================== */}

                                      {hasCustomization && (
                                        <div className="mt-2 rounded-lg border border-orange-100 dark:border-orange-900/50 bg-orange-50/70 dark:bg-orange-950/30 p-2">
                                          <div className="flex items-center gap-1.5 mb-1.5">
                                            <Ruler
                                              size={11}
                                              className="text-orange-600 dark:text-orange-400"
                                            />

                                            <p className="text-[9px] font-bold uppercase tracking-wide text-orange-700 dark:text-orange-400">
                                              Custom Measurement
                                            </p>
                                          </div>

                                          <div className="grid grid-cols-3 gap-1.5">
                                            {customization.length && (
                                              <div className="bg-white dark:bg-slate-800 border border-orange-100 dark:border-orange-900/50 rounded-md px-1.5 py-1">
                                                <p className="text-[8px] text-gray-400 dark:text-slate-500">
                                                  Length
                                                </p>

                                                <p className="text-[10px] font-bold text-gray-700 dark:text-slate-200">
                                                  {
                                                    customization.length
                                                  }{" "}
                                                  inch
                                                </p>
                                              </div>
                                            )}

                                            {customization.height && (
                                              <div className="bg-white dark:bg-slate-800 border border-orange-100 dark:border-orange-900/50 rounded-md px-1.5 py-1">
                                                <p className="text-[8px] text-gray-400 dark:text-slate-500">
                                                  Height
                                                </p>

                                                <p className="text-[10px] font-bold text-gray-700 dark:text-slate-200">
                                                  {
                                                    customization.height
                                                  }{" "}
                                                  inch
                                                </p>
                                              </div>
                                            )}

                                            {customization.width && (
                                              <div className="bg-white dark:bg-slate-800 border border-orange-100 dark:border-orange-900/50 rounded-md px-1.5 py-1">
                                                <p className="text-[8px] text-gray-400 dark:text-slate-500">
                                                  Width
                                                </p>

                                                <p className="text-[10px] font-bold text-gray-700 dark:text-slate-200">
                                                  {
                                                    customization.width
                                                  }{" "}
                                                  inch
                                                </p>
                                              </div>
                                            )}
                                          </div>

                                          <p className="text-[8px] text-orange-600 dark:text-orange-400 mt-1.5">
                                            No extra charge
                                          </p>
                                        </div>
                                      )}

                                      {item?.productNote && (
                                        <p className="text-[9px] italic text-indigo-600 dark:text-indigo-400 mt-1">
                                          Note:{" "}
                                          {
                                            item.productNote
                                          }
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                );
                              }
                            )}
                        </div>
                      </div>

                      {/* ========================================
                          SHIPPING
                      ======================================== */}

                      <div className="xl:col-span-2">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                            <Truck
                              size={16}
                            />
                          </div>

                          <div>
                            <p className="text-xs font-bold text-gray-900 dark:text-white">
                              Shipping
                            </p>

                            <p className="text-[10px] text-gray-400 dark:text-slate-500">
                              Delivery details
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div>
                            <p className="text-[10px] text-gray-400 dark:text-slate-500">
                              Method
                            </p>

                            <p className="text-xs font-semibold text-gray-700 dark:text-slate-300 capitalize">
                              {order.shippingMethod ||
                                "N/A"}
                            </p>
                          </div>

                          <div>
                            <p className="text-[10px] text-gray-400 dark:text-slate-500">
                              Shipping Charge
                            </p>

                            <p className="text-sm font-bold text-gray-800 dark:text-white">
                              ৳
                              {Number(
                                order.shippingCharge ||
                                  0
                              ).toLocaleString()}
                            </p>
                          </div>

                          <div>
                            <p className="text-[10px] text-gray-400 dark:text-slate-500">
                              Courier
                            </p>

                            {courierProvider ? (
                              <div className="mt-1">
                                <div className="flex items-center gap-1.5">
                                  <Truck
                                    size={
                                      13
                                    }
                                    className="text-blue-600 dark:text-blue-400"
                                  />

                                  <span className="font-bold text-xs text-gray-800 dark:text-white">
                                    {
                                      courierProvider
                                    }
                                  </span>
                                </div>

                                <p className="text-[10px] text-gray-500 dark:text-slate-400 mt-1">
                                  {courierStatus ||
                                    "Pending"}
                                </p>
                              </div>
                            ) : (
                              <span className="inline-block mt-1 text-[10px] text-gray-400 dark:text-slate-500">
                                Not assigned
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* ========================================
                          FRAUD
                      ======================================== */}

                      <div className="xl:col-span-3">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                            <ShieldCheck
                              size={16}
                            />
                          </div>

                          <div>
                            <p className="text-xs font-bold text-gray-900 dark:text-white">
                              Fraud Check
                            </p>

                            <p className="text-[10px] text-gray-400 dark:text-slate-500">
                              Customer risk analysis
                            </p>
                          </div>
                        </div>

                        {fraud?.checked ? (
                          <div
                            className={`rounded-xl border p-3 ${
                              fraudRiskStyle?.boxClass ||
                              "bg-gray-50 border-gray-100 dark:bg-slate-800 dark:border-slate-700"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5">
                                {fraudRiskStyle &&
                                  React.createElement(
                                    fraudRiskStyle.Icon,
                                    {
                                      size: 16,

                                      className:
                                        fraudRiskStyle.iconClass,
                                    }
                                  )}

                                <span
                                  className={`text-xs font-bold ${
                                    fraudRiskStyle?.textClass ||
                                    "text-gray-600 dark:text-slate-300"
                                  }`}
                                >
                                  {fraud.riskLevel ||
                                    "Unverified"}
                                </span>
                              </div>

                              <span className="text-[9px] font-semibold text-gray-500 dark:text-slate-400">
                                {fraud.cancellationRate !==
                                undefined
                                  ? `${fraud.cancellationRate}% cancel`
                                  : ""}
                              </span>
                            </div>

                            {fraud.riskLevel ===
                            "Unverified" ? (
                              <p className="text-[10px] text-gray-500 dark:text-slate-400 mt-1">
                                No SteadFast history found.
                              </p>
                            ) : (
                              <>
                                <p className="text-[10px] text-gray-600 dark:text-slate-300 mt-1">
                                  {fraud.totalOrders ||
                                    0}{" "}
                                  parcels via SteadFast
                                </p>

                                <p className="text-[10px] text-gray-500 dark:text-slate-400">
                                  {fraud.deliveredOrders ||
                                    0}{" "}
                                  delivered ·{" "}
                                  {fraud.cancelledOrders ||
                                    0}{" "}
                                  cancelled
                                </p>

                                {fraud.returnedOrders >
                                  0 && (
                                  <p className="text-[10px] text-orange-600 dark:text-orange-400">
                                    {
                                      fraud.returnedOrders
                                    }{" "}
                                    returned
                                  </p>
                                )}

                                {fraudReportCount >
                                  0 && (
                                  <p className="text-[10px] font-semibold text-red-600 dark:text-red-400 mt-1">
                                    {
                                      fraudReportCount
                                    }{" "}
                                    fraud report
                                    {fraudReportCount >
                                    1
                                      ? "s"
                                      : ""}{" "}
                                    on file
                                  </p>
                                )}

                                <p className="text-[10px] font-semibold text-gray-600 dark:text-slate-300 mt-1">
                                  Risk based on cancellation
                                  history
                                </p>
                              </>
                            )}

                            {fraud.checkedAt && (
                              <p className="text-[9px] text-gray-400 dark:text-slate-500 mt-1">
                                {new Date(
                                  fraud.checkedAt
                                ).toLocaleString()}
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="rounded-xl border border-dashed border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 p-3">
                            <p className="text-xs text-gray-400 dark:text-slate-500">
                              Fraud check not completed.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* ========================================
                        BOTTOM ACTION BAR
                    ======================================== */}

                    <div className="mt-5 pt-4 border-t border-gray-100 dark:border-slate-700">
                      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">

                        {/* TRACKING */}

                        <div className="flex flex-wrap items-center gap-4">
                          {consignmentId && (
                            <div>
                              <p className="text-[9px] uppercase font-bold text-gray-400 dark:text-slate-500">
                                Consignment
                              </p>

                              <button
                                type="button"
                                onClick={() =>
                                  copyTracking(
                                    consignmentId
                                  )
                                }
                                className="flex items-center gap-1 text-xs font-mono font-semibold text-blue-600 dark:text-blue-400 hover:underline mt-0.5"
                              >
                                {
                                  consignmentId
                                }

                                {copiedId ===
                                consignmentId ? (
                                  <CheckCircle2
                                    size={
                                      12
                                    }
                                  />
                                ) : (
                                  <Copy
                                    size={
                                      12
                                    }
                                  />
                                )}
                              </button>
                            </div>
                          )}

                          {trackingCode && (
                            <div>
                              <p className="text-[9px] uppercase font-bold text-gray-400 dark:text-slate-500">
                                Tracking
                              </p>

                              <button
                                type="button"
                                onClick={() =>
                                  copyTracking(
                                    trackingCode
                                  )
                                }
                                className="flex items-center gap-1 text-xs font-mono font-semibold text-blue-600 dark:text-blue-400 hover:underline mt-0.5"
                              >
                                {
                                  trackingCode
                                }

                                {copiedId ===
                                trackingCode ? (
                                  <CheckCircle2
                                    size={
                                      12
                                    }
                                  />
                                ) : (
                                  <Copy
                                    size={
                                      12
                                    }
                                  />
                                )}
                              </button>
                            </div>
                          )}

                          {courierStatus && (
                            <div>
                              <p className="text-[9px] uppercase font-bold text-gray-400 dark:text-slate-500">
                                Courier Status
                              </p>

                              <p className="text-xs font-semibold text-gray-700 dark:text-slate-300 mt-0.5">
                                {
                                  courierStatus
                                }
                              </p>
                            </div>
                          )}
                        </div>

                        {/* ACTION BUTTONS */}

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">

                          {/* FRAUD */}

                          <button
                            type="button"
                            onClick={() =>
                              handleFraudCheck(
                                order
                              )
                            }
                            disabled={isActionLoading(
                              order._id,
                              "fraud"
                            )}
                            className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-900/50 hover:bg-purple-100 dark:hover:bg-purple-900/40 disabled:opacity-50 text-[11px] font-bold transition"
                          >
                            {isActionLoading(
                              order._id,
                              "fraud"
                            ) ? (
                              <Loader2
                                size={
                                  14
                                }
                                className="animate-spin"
                              />
                            ) : (
                              <ShieldCheck
                                size={
                                  14
                                }
                              />
                            )}

                            {fraud?.checked
                              ? "Check Again"
                              : "Fraud Check"}
                          </button>

                          {/* PATHAO */}

                          <button
                            type="button"
                            onClick={() =>
                              handlePathaoEntry(
                                order
                              )
                            }
                            disabled={
                              courierSubmitted ||
                              isActionLoading(
                                order._id,
                                "pathao"
                              )
                            }
                            className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-900/50 hover:bg-orange-100 dark:hover:bg-orange-900/40 disabled:opacity-50 disabled:cursor-not-allowed text-[11px] font-bold transition"
                          >
                            {isActionLoading(
                              order._id,
                              "pathao"
                            ) ? (
                              <Loader2
                                size={
                                  14
                                }
                                className="animate-spin"
                              />
                            ) : (
                              <Truck
                                size={
                                  14
                                }
                              />
                            )}

                            {String(
                              courierProvider ||
                                ""
                            ).toLowerCase() ===
                            "pathao"
                              ? "Pathao Submitted"
                              : courierSubmitted
                              ? "Courier Submitted"
                              : "Send to Pathao"}
                          </button>

                          {/* STEADFAST */}

                          <button
                            type="button"
                            onClick={() =>
                              handleSteadFastEntry(
                                order
                              )
                            }
                            disabled={
                              courierSubmitted ||
                              isActionLoading(
                                order._id,
                                "steadfast"
                              )
                            }
                            className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50 hover:bg-blue-100 dark:hover:bg-blue-900/40 disabled:opacity-50 disabled:cursor-not-allowed text-[11px] font-bold transition"
                          >
                            {isActionLoading(
                              order._id,
                              "steadfast"
                            ) ? (
                              <Loader2
                                size={
                                  14
                                }
                                className="animate-spin"
                              />
                            ) : (
                              <Truck
                                size={
                                  14
                                }
                              />
                            )}

                            {String(
                              courierProvider ||
                                ""
                            ).toLowerCase() ===
                            "steadfast"
                              ? "SteadFast Submitted"
                              : courierSubmitted
                              ? "Courier Submitted"
                              : "Send to SteadFast"}
                          </button>

                          {/* DELETE */}

                          <button
                            type="button"
                            onClick={() =>
                              setDeleteOrder(
                                order
                              )
                            }
                            disabled={isActionLoading(
                              order._id,
                              "delete"
                            )}
                            className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 hover:bg-red-100 dark:hover:bg-red-900/40 disabled:opacity-50 text-[11px] font-bold transition"
                          >
                            <Trash2
                              size={14}
                            />

                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }
          )}
        </div>
      )}

      {/* ========================================
          DELETE MODAL
      ======================================== */}

      {deleteOrder && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden">

            <div className="px-5 py-4 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 flex items-center justify-center">
                  <Trash2 size={19} />
                </div>

                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    Delete Order
                  </h3>

                  <p className="text-[11px] text-gray-400 dark:text-slate-500">
                    Permanent action
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setDeleteOrder(null)
                }
                disabled={isActionLoading(
                  deleteOrder._id,
                  "delete"
                )}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700"
              >
                <X size={17} />
              </button>
            </div>

            <div className="p-5">
              <div className="bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle
                    size={18}
                    className="text-red-500 mt-0.5 shrink-0"
                  />

                  <div>
                    <p className="text-sm font-semibold text-red-800 dark:text-red-400">
                      Are you sure?
                    </p>

                    <p className="text-xs text-red-700 dark:text-red-300 mt-1 leading-5">
                      This order will be permanently
                      deleted from your website database.
                      This action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>

              {(
                deleteOrder.courier?.provider ||
                deleteOrder.courierName ||
                deleteOrder.consignmentId ||
                deleteOrder.consignment_id
              ) && (
                <div className="mt-3 bg-orange-50 dark:bg-orange-950/30 border border-orange-100 dark:border-orange-900/50 rounded-xl p-3">
                  <p className="text-[11px] text-orange-700 dark:text-orange-400 leading-5">
                    <b>Warning:</b> This order has
                    already been submitted to a courier.
                    Deleting it from your website will
                    not automatically cancel the courier
                    shipment.
                  </p>
                </div>
              )}

              <div className="mt-4 rounded-xl border border-gray-200 dark:border-slate-700 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-gray-400 dark:text-slate-500">
                      Order ID
                    </p>

                    <p className="font-mono text-sm font-bold text-amber-700 dark:text-amber-400 mt-0.5">
                      {deleteOrder.orderId ||
                        "N/A"}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-[10px] uppercase font-bold text-gray-400 dark:text-slate-500">
                      Customer
                    </p>

                    <p className="text-xs font-semibold text-gray-700 dark:text-slate-300 mt-0.5">
                      {deleteOrder.fullName ||
                        "Unknown"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-5">
                <button
                  type="button"
                  onClick={() =>
                    setDeleteOrder(null)
                  }
                  disabled={isActionLoading(
                    deleteOrder._id,
                    "delete"
                  )}
                  className="flex-1 h-11 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-600 text-sm font-semibold"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={
                    handleDeleteOrder
                  }
                  disabled={isActionLoading(
                    deleteOrder._id,
                    "delete"
                  )}
                  className="flex-1 h-11 rounded-xl bg-red-600 text-white hover:bg-red-700 text-sm font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isActionLoading(
                    deleteOrder._id,
                    "delete"
                  ) ? (
                    <>
                      <Loader2
                        size={16}
                        className="animate-spin"
                      />

                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} />

                      Delete Order
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;