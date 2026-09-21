"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import {
  FiSearch,
  FiPackage,
  FiArrowLeft,
  FiAlertTriangle,
  FiCheck,
  FiMapPin,
} from "react-icons/fi";

import {
  Truck,
  Calendar,
  Clock,
  ChevronRight,
} from "lucide-react";

import { CiDeliveryTruck } from "react-icons/ci";

const OrderTrack = () => {
  const searchParams = useSearchParams();

  const [orderNumber, setOrderNumber] = useState("");
  const [orderData, setOrderData] = useState(null);

  const [isSearched, setIsSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:5000";

  // =====================================
  // AUTO LOAD ORDER ID FROM THANK YOU PAGE
  // =====================================

  useEffect(() => {
    const orderId = searchParams.get("orderId");

    if (!orderId) return;

    const cleanId = orderId.trim().toUpperCase();

    setOrderNumber(cleanId);

    searchOrder(cleanId);
  }, [searchParams]);

  // =====================================
  // SEARCH ORDER
  // =====================================

  const searchOrder = async (orderId) => {
    const cleanId = String(orderId || "")
      .trim()
      .toUpperCase();

    if (!cleanId) {
      return;
    }

    setLoading(true);
    setIsSearched(true);
    setOrderData(null);

    try {
      const res = await fetch(
        `${apiUrl}/api/orders/track/${encodeURIComponent(
          cleanId
        )}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
          cache: "no-store",
        }
      );

      const data = await res.json();

      if (!res.ok || !data.success || !data.order) {
        setOrderData(null);
        return;
      }

      setOrderData(data.order);
    } catch (error) {
      console.error("Order tracking error:", error);

      setOrderData(null);
    } finally {
      setLoading(false);
    }
  };

  // =====================================
  // FORM SEARCH
  // =====================================

  const handleSearch = (e) => {
    e.preventDefault();

    searchOrder(orderNumber);
  };

  // =====================================
  // COURIER DATA
  // =====================================

  const courierProvider =
    orderData?.courier?.provider ||
    orderData?.courierName ||
    "Not Assigned";

  const trackingCode =
    orderData?.courier?.trackingCode ||
    orderData?.tracking_code ||
    null;

  const consignmentId =
    orderData?.courier?.consignmentId ||
    orderData?.consignment_id ||
    null;

  const courierStatus =
    orderData?.courier?.status ||
    orderData?.delivery_status ||
    null;

  // =====================================
  // CURRENT STATUS
  // =====================================

  const currentStatus =
    orderData?.status ||
    courierStatus ||
    "Pending";

  // =====================================
  // TRACKING HISTORY
  // =====================================

  const trackingHistory =
    Array.isArray(orderData?.trackingHistory)
      ? orderData.trackingHistory
      : [];

  // =====================================
  // STATUS STYLE
  // =====================================

  const getStatusStyle = (status) => {
    const normalized = String(status || "")
      .toLowerCase()
      .trim();

    if (normalized.includes("delivered")) {
      return "bg-emerald-50 text-emerald-700 border-emerald-100";
    }

    if (
      normalized.includes("cancel") ||
      normalized.includes("return") ||
      normalized.includes("failed")
    ) {
      return "bg-red-50 text-red-700 border-red-100";
    }

    if (
      normalized.includes("shipped") ||
      normalized.includes("transit") ||
      normalized.includes("rider") ||
      normalized.includes("dispatch") ||
      normalized.includes("warehouse") ||
      normalized.includes("hub") ||
      normalized.includes("out for delivery")
    ) {
      return "bg-blue-50 text-blue-700 border-blue-100";
    }

    if (
      normalized.includes("processing") ||
      normalized.includes("ready")
    ) {
      return "bg-orange-50 text-orange-700 border-orange-100";
    }

    return "bg-yellow-50 text-yellow-700 border-yellow-100";
  };

  return (
    <section className="min-h-screen bg-[#f3f4f6] font-poppins py-12 md:py-20 px-4 relative overflow-hidden">
      <div className="container">
        {/* BACKGROUND DECORATION */}

        <div className="absolute top-0 right-0 w-96 h-96 bg-[#eb6e1b]/5 rounded-full blur-3xl -z-10"></div>

        <div className="absolute bottom-0 left-0 w-96 h-96 bg-slate-900/5 rounded-full blur-3xl -z-10"></div>

        <div>
          {/* =====================================
              HEADER
          ===================================== */}

          <div className="mb-10 flex items-center justify-between">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-black hover:text-secondary transition-all bg-white px-4 py-2.5 rounded-xl shadow-sm border border-gray-100 group"
            >
              <FiArrowLeft className="transform group-hover:-translate-x-1 transition-transform text-sm" />

              <span>Back to Shop</span>
            </Link>

            <span className="flex items-center gap-1.5 text-xs font-bold bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-sm tracking-wide select-none">
              <CiDeliveryTruck
                size={18}
                className="text-white animate-bounce"
              />

              Live Tracking
            </span>
          </div>

          <div className="space-y-6">
            {/* =====================================
                SEARCH BOX
            ===================================== */}

            <div className="bg-white rounded-br-4xl rounded-tl-4xl p-6 md:p-8 shadow-[0_15px_40px_rgba(0,0,0,0.02)] border border-gray-100">
              <div className="max-w-xl mx-auto text-center mb-8">
                <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                  Track Your{" "}
                  <span className="text-primary relative inline-block">
                    Order

                    <span className="absolute left-0 bottom-1 w-full h-[4px] bg-primary/20 rounded"></span>
                  </span>
                </h1>

                <p className="text-xs text-gray-400 mt-2 font-medium">
                  Enter your order ID to check the latest
                  delivery status.
                </p>
              </div>

              <form
                onSubmit={handleSearch}
                className="max-w-xl mx-auto"
              >
                <div className="relative flex flex-col sm:flex-row items-center gap-2.5 p-1.5 bg-gray-50 rounded-2xl border border-gray-200 focus-within:bg-white focus-within:border-secondary focus-within:ring-4 focus-within:ring-secondary/5 transition-all duration-300">
                  <div className="relative w-full flex items-center">
                    <FiSearch className="text-slate-400 text-lg absolute left-4" />

                    <input
                      type="text"
                      placeholder="Enter Order ID e.g. AFIS-123456..."
                      value={orderNumber}
                      onChange={(e) =>
                        setOrderNumber(e.target.value)
                      }
                      className="w-full pl-12 pr-4 py-3 bg-transparent text-sm text-slate-800 placeholder-gray-400 outline-none font-medium"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={
                      loading ||
                      !orderNumber.trim()
                    }
                    className="w-full sm:w-auto bg-primary hover:bg-secondary text-white px-8 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer shadow-md shadow-orange-600/10 active:scale-[0.98] whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading
                      ? "Searching..."
                      : "Search"}
                  </button>
                </div>
              </form>
            </div>

            {/* =====================================
                RESULT
            ===================================== */}

            <div className="transition-all duration-500">
              {loading ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm">
                  <div className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-primary animate-spin mx-auto"></div>

                  <p className="text-xs text-gray-400 mt-4 font-medium">
                    Checking order status...
                  </p>
                </div>
              ) : orderData ? (
                <div className="space-y-5 animate-fadeIn">
                  {/* =====================================
                      ORDER SUMMARY CARDS
                  ===================================== */}

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {/* ORDER ID */}

                    <div className="bg-white p-4 rounded-bl-2xl rounded-tr-2xl border border-gray-100 shadow-sm flex items-center gap-3">
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-gray-100">
                        <FiPackage className="text-primary" />
                      </div>

                      <div className="flex flex-col min-w-0">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                          Order ID
                        </span>

                        <span className="text-xs font-bold tracking-tight text-slate-800 truncate">
                          {orderData.orderId ||
                            orderNumber}
                        </span>
                      </div>
                    </div>

                    {/* COURIER */}

                    <div className="bg-white p-4 rounded-bl-2xl rounded-tr-2xl border border-gray-100 shadow-sm flex items-center gap-3">
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-gray-100">
                        <Truck
                          size={14}
                          className="text-primary"
                        />
                      </div>

                      <div className="flex flex-col min-w-0">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                          Courier
                        </span>

                        <span className="text-xs font-bold tracking-tight text-slate-800 truncate">
                          {courierProvider}
                        </span>
                      </div>
                    </div>

                    {/* TRACKING ID */}

                    <div className="bg-white p-4 rounded-bl-2xl rounded-tr-2xl border border-gray-100 shadow-sm flex items-center gap-3">
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-gray-100">
                        <Calendar
                          size={14}
                          className="text-primary"
                        />
                      </div>

                      <div className="flex flex-col min-w-0">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                          Tracking ID
                        </span>

                        <span
                          className={`text-xs font-bold tracking-tight truncate ${
                            trackingCode ||
                            consignmentId
                              ? "text-primary"
                              : "text-slate-800"
                          }`}
                        >
                          {trackingCode ||
                            consignmentId ||
                            "Not Available"}
                        </span>
                      </div>
                    </div>

                    {/* CURRENT STATUS */}

                    <div className="bg-white p-4 rounded-bl-2xl rounded-tr-2xl border border-gray-100 shadow-sm flex items-center gap-3">
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-gray-100">
                        <FiMapPin className="text-primary" />
                      </div>

                      <div className="flex flex-col min-w-0">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                          Current Status
                        </span>

                        <span
                          className={`mt-0.5 px-2 py-0.5 border rounded-lg text-[10px] font-extrabold self-start uppercase truncate max-w-full ${getStatusStyle(
                            currentStatus
                          )}`}
                        >
                          {currentStatus}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* =====================================
                      CUSTOMER INFO
                  ===================================== */}

                  {(orderData.fullName ||
                    orderData.shippingMethod) && (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        {orderData.fullName && (
                          <div>
                            <p className="text-[10px] font-bold uppercase text-gray-400">
                              Customer
                            </p>

                            <p className="font-semibold text-slate-800 mt-1">
                              {orderData.fullName}
                            </p>
                          </div>
                        )}

                        {orderData.shippingMethod && (
                          <div>
                            <p className="text-[10px] font-bold uppercase text-gray-400">
                              Shipping Method
                            </p>

                            <p className="font-semibold text-slate-800 mt-1 capitalize">
                              {orderData.shippingMethod}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* =====================================
                      CONSIGNMENT ID
                  ===================================== */}

                  {(consignmentId ||
                    trackingCode) && (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {trackingCode && (
                          <div>
                            <p className="text-[10px] font-bold uppercase text-gray-400">
                              Tracking Code
                            </p>

                            <p className="font-mono font-bold text-primary mt-1 break-all">
                              {trackingCode}
                            </p>
                          </div>
                        )}

                        {consignmentId && (
                          <div>
                            <p className="text-[10px] font-bold uppercase text-gray-400">
                              Consignment ID
                            </p>

                            <p className="font-mono font-bold text-slate-800 mt-1 break-all">
                              {consignmentId}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* =====================================
                      ORDER INFO
                  ===================================== */}

                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-[10px] font-bold uppercase text-gray-400">
                          Order Status
                        </p>

                        <p className="font-semibold text-slate-800 mt-1">
                          {currentStatus}
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] font-bold uppercase text-gray-400">
                          Courier
                        </p>

                        <p className="font-semibold text-slate-800 mt-1">
                          {courierProvider}
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] font-bold uppercase text-gray-400">
                          Last Updated
                        </p>

                        <p className="font-semibold text-slate-800 mt-1">
                          {orderData.updatedAt
                            ? new Date(
                                orderData.updatedAt
                              ).toLocaleString()
                            : "N/A"}
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] font-bold uppercase text-gray-400">
                          Order Date
                        </p>

                        <p className="font-semibold text-slate-800 mt-1">
                          {orderData.createdAt
                            ? new Date(
                                orderData.createdAt
                              ).toLocaleDateString()
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* =====================================
                      TIMELINE
                  ===================================== */}

                  <div className="bg-white rounded-tr-4xl rounded-bl-4xl p-6 md:p-8 shadow-[0_15px_40px_rgba(0,0,0,0.02)] border border-gray-100">
                    <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                      <span>Journey Timeline</span>

                      <span className="h-[1px] bg-gray-100 flex-1"></span>
                    </h3>

                    {trackingHistory.length > 0 ? (
                      <div className="relative pl-8 space-y-6 before:absolute before:bottom-6 before:top-2 before:left-[13px] before:w-[2px] before:bg-slate-100">
                        {trackingHistory.map(
                          (step, index) => {
                            const isLast =
                              index ===
                              trackingHistory.length - 1;

                            return (
                              <div
                                key={
                                  step._id ||
                                  `${step.status}-${step.timestamp}-${index}`
                                }
                                className={`relative flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border transition-all duration-300 ${
                                  isLast
                                    ? "bg-gradient-to-r from-orange-50/50 to-transparent border-orange-200/60 shadow-sm"
                                    : "bg-transparent border-transparent"
                                }`}
                              >
                                {/* TIMELINE DOT */}

                                <div
                                  className={`absolute -left-[27px] w-3 h-3 rounded-full flex items-center justify-center transition-all duration-500 z-10 ${
                                    isLast
                                      ? "bg-primary ring-4 ring-orange-100"
                                      : "bg-gray-300 ring-4 ring-gray-50"
                                  }`}
                                >
                                  <FiCheck className="text-[7px] text-white stroke-[4]" />
                                </div>

                                {/* STATUS INFO */}

                                <div className="space-y-0.5 min-w-0 flex-1 pr-4">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h4
                                      className={`text-xs font-extrabold tracking-tight ${
                                        isLast
                                          ? "text-primary"
                                          : "text-slate-800"
                                      }`}
                                    >
                                      {step.status ||
                                        "Status Updated"}
                                    </h4>

                                    {isLast && (
                                      <span className="text-[9px] font-black uppercase bg-primary text-white px-1.5 py-0.5 rounded tracking-wider">
                                        Current
                                      </span>
                                    )}
                                  </div>

                                  {step.courierStatus && (
                                    <p className="text-[11px] text-gray-400 font-medium">
                                      Courier status:{" "}
                                      {
                                        step.courierStatus
                                      }
                                    </p>
                                  )}

                                  {step.message && (
                                    <p className="text-xs text-gray-400 font-medium">
                                      {step.message}
                                    </p>
                                  )}
                                </div>

                                {/* TIME */}

                                <div className="mt-2 sm:mt-0 flex items-center gap-1.5 text-[11px] font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-xl border border-gray-100 self-start sm:self-auto">
                                  <Clock size={11} />

                                  <span>
                                    {step.timestamp
                                      ? new Date(
                                          step.timestamp
                                        ).toLocaleString()
                                      : "N/A"}
                                  </span>
                                </div>
                              </div>
                            );
                          }
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <FiPackage
                          size={24}
                          className="mx-auto text-gray-300"
                        />

                        <p className="text-xs text-gray-400 mt-3">
                          Tracking history is not
                          available yet.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* =====================================
                      TRACKING NOTE
                  ===================================== */}

                  <div className="bg-slate-900 rounded-2xl p-5 text-white">
                    <div className="flex items-start gap-3">
                      <div className="shrink-0 p-2 bg-white/10 rounded-xl">
                        <CiDeliveryTruck
                          size={22}
                        />
                      </div>

                      <div>
                        <h4 className="text-xs font-bold">
                          Delivery Tracking
                        </h4>

                        <p className="text-[11px] text-white/60 mt-1 leading-relaxed">
                          Courier status may take some
                          time to update after your
                          order is handed over to the
                          delivery partner.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : isSearched ? (
                /* =====================================
                   ORDER NOT FOUND
                ===================================== */

                <div className="bg-white rounded-3xl p-8 text-center max-w-md mx-auto border border-red-100 shadow-sm animate-fadeIn">
                  <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 mx-auto mb-4 border border-red-100">
                    <FiAlertTriangle size={20} />
                  </div>

                  <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                    Order Not Found
                  </h3>

                  <p className="text-xs text-gray-400 leading-relaxed mt-1.5 px-4">
                    We could not find an order with
                    the ID{" "}
                    <span className="font-bold text-slate-700">
                      {orderNumber}
                    </span>
                    .
                  </p>

                  <p className="text-[11px] text-gray-400 mt-3">
                    Please check your Order ID and
                    try again.
                  </p>
                </div>
              ) : (
                /* =====================================
                   INITIAL STATE
                ===================================== */

                <div className="bg-white rounded-3xl p-10 text-center max-w-sm mx-auto border border-dashed border-gray-200 select-none">
                  <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-gray-400 mx-auto mb-4 border border-gray-100">
                    <FiPackage size={18} />
                  </div>

                  <p className="text-xs font-medium text-gray-400 leading-relaxed px-2">
                    Enter your order ID above to see
                    your latest order and delivery
                    status.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* =====================================
              SUPPORT
          ===================================== */}

          <div className="mt-12 text-center text-[11px] font-bold tracking-wide text-gray-400 uppercase flex items-center justify-center gap-1.5">
            <span>Stuck somewhere?</span>

            <Link
              href="/contact"
              className="text-primary hover:underline flex items-center gap-0.5"
            >
              Open Support Ticket
              <ChevronRight size={12} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OrderTrack;