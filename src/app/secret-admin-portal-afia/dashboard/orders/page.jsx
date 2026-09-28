"use client";
import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Spinner } from "@heroui/react";
import {ShieldCheck, Truck, Loader2, Copy, CheckCircle2, AlertTriangle, HelpCircle, PackageCheck, Pencil, Save, X, ShoppingBag, CalendarDays, CalendarRange, Clock3, Trash2, Search, MapPin, Phone, User, Package, Ruler, DollarSign, CreditCard, CircleDollarSign, FileText,Download,} from "lucide-react";
import { toast } from "react-hot-toast";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [copiedId, setCopiedId] = useState("");
  const [orderPeriod, setOrderPeriod] = useState("all");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [orderSearch, setOrderSearch] = useState("");
  const [editingCustomerId, setEditingCustomerId] = useState(null);
  const [editingPhone, setEditingPhone] =  useState("");
  const [editingAddress, setEditingAddress] = useState("");
  const [deleteOrder, setDeleteOrder] = useState(null);
  const apiUrl = (
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:5000"
  ).replace(/\/+$/, "");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${apiUrl}/api/orders`, {
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
        "Failed to fetch orders:", error );
      toast.error( error.message || "Failed to load orders"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const orderStats = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

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

    let today = 0;
    let last7Days = 0;
    let lastMonth = 0;
    let lastYear = 0;

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

    let paidOrders = 0;
    let pendingPayment = 0;
    let totalRevenue = 0;

    orders.forEach((order) => {
      if (!order?.createdAt) return;

      const createdAt = new Date(
        order.createdAt
      );

      if (
        Number.isNaN(
          createdAt.getTime()
        )
      ) {
        return;
      }

      if (createdAt >= startOfToday) {
        today++;
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

      const status =
        order.status || "Pending";

      if (
        Object.prototype.hasOwnProperty.call(
          statusCounts,
          status
        )
      ) {
        statusCounts[status]++;
      }

      const paymentStatus =
        order.paymentStatus ||
        "Pending";

      if (
        paymentStatus === "Paid"
      ) {
        paidOrders++;

        totalRevenue += Number(
          order.totalCost || 0
        );
      }

      if (
        paymentStatus === "Pending"
      ) {
        pendingPayment++;
      }
    });

    return {
      total: orders.length,
      today,
      last7Days,
      lastMonth,
      lastYear,
      statusCounts,
      paidOrders,
      pendingPayment,
      totalRevenue,
    };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    let result = orders;
    if (orderPeriod !== "all") {
      const now = new Date();
      if (orderPeriod === "today") {
        const startOfToday = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate()
        );

        result = result.filter(
          (order) => {
            if (!order?.createdAt) {
              return false;
            }

            const createdAt =
              new Date(
                order.createdAt
              );

            if (
              Number.isNaN(
                createdAt.getTime()
              )
            ) {
              return false;
            }

            return (
              createdAt >=
              startOfToday
            );
          }
        );
      }

      if (
        orderPeriod === "7days" ||
        orderPeriod === "month" ||
        orderPeriod === "year"
      ) {
        const startDate = new Date(
          now
        );

        if (
          orderPeriod === "7days"
        ) {
          startDate.setDate(
            startDate.getDate() - 7
          );
        }

        if (
          orderPeriod === "month"
        ) {
          startDate.setMonth(
            startDate.getMonth() - 1
          );
        }

        if (
          orderPeriod === "year"
        ) {
          startDate.setFullYear(
            startDate.getFullYear() - 1
          );
        }

        result = result.filter(
          (order) => {
            if (!order?.createdAt) {
              return false;
            }

            const createdAt =
              new Date(
                order.createdAt
              );

            if (
              Number.isNaN(
                createdAt.getTime()
              )
            ) {
              return false;
            }

            return (
              createdAt >=
              startDate
            );
          }
        );
      }
    }

    if (
      orderStatusFilter !==
      "all"
    ) {
      result = result.filter(
        (order) =>
          (
            order?.status ||
            "Pending"
          ) ===
          orderStatusFilter
      );
    }

    if (
      paymentFilter !== "all"
    ) {
      result = result.filter(
        (order) =>
          (
            order?.paymentStatus ||
            "Pending"
          ) === paymentFilter
      );
    }

    const search = orderSearch
      .trim()
      .toLowerCase();

    if (search) {
      result = result.filter(
        (order) => {
          const customerName =
            String(
              order?.fullName || ""
            ).toLowerCase();

          const phoneNumber =
            String(
              order?.phoneNumber || ""
            ).toLowerCase();

          const orderId =
            String(
              order?.orderId || ""
            ).toLowerCase();

          return (
            customerName.includes(
              search
            ) ||
            phoneNumber.includes(
              search
            ) ||
            orderId.includes(
              search
            )
          );
        }
      );
    }

    return result;
  }, [
    orders,
    orderPeriod,
    orderStatusFilter,
    paymentFilter,
    orderSearch,
  ]);

  const selectedPeriodLabel =
    useMemo(() => {
      switch (orderPeriod) {
        case "today":
          return "Today Orders";

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

  const selectedFilterLabel =
    useMemo(() => {
      let label =
        selectedPeriodLabel;

      if (
        orderStatusFilter !==
        "all"
      ) {
        label += ` · ${orderStatusFilter}`;
      }

      if (
        paymentFilter !== "all"
      ) {
        label += ` · Payment: ${paymentFilter}`;
      }

      return label;
    }, [
      selectedPeriodLabel,
      orderStatusFilter,
      paymentFilter,
    ]);

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

  const handleOrderStatusChange =
    async (
      order,
      newStatus
    ) => {
      if (!order?._id) {
        toast.error(
          "Invalid order."
        );

        return;
      }

      if (
        !newStatus ||
        newStatus === order.status
      ) {
        return;
      }

      setAction(
        order._id,
        "status",
        true
      );

      try {
        const res = await fetch(
          `${apiUrl}/api/orders/${order._id}/status`,
          {
            method: "PUT",

            headers: {
              Accept:
                "application/json",

              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              status:
                newStatus,
            }),
          }
        );

        const data =
          await res.json();

        if (
          !res.ok ||
          !data.success
        ) {
          throw new Error(
            data.message ||
              "Failed to update order status."
          );
        }

        setOrders(
          (prevOrders) =>
            prevOrders.map(
              (item) =>
                item?._id ===
                order._id
                  ? {
                      ...item,

                      status:
                        data.order
                          ?.status ||
                        newStatus,

                      trackingHistory:
                        data.order
                          ?.trackingHistory ||
                        item.trackingHistory,

                      updatedAt:
                        data.order
                          ?.updatedAt ||
                        item.updatedAt,
                    }
                  : item
            )
        );

        toast.success(
          `Order status changed to ${newStatus}.`
        );
      } catch (error) {
        console.error(
          "Order status update error:",
          error
        );

        toast.error(
          error.message ||
            "Failed to update order status."
        );
      } finally {
        setAction(
          order._id,
          "status",
          false
        );
      }
    };

  const handlePaymentStatusChange =
    async (
      order,
      newPaymentStatus
    ) => {
      if (!order?._id) {
        toast.error(
          "Invalid order."
        );

        return;
      }

      const currentPaymentStatus =
        order.paymentStatus ||
        "Pending";

      if (
        !newPaymentStatus ||
        newPaymentStatus ===
          currentPaymentStatus
      ) {
        return;
      }

      setAction(
        order._id,
        "paymentStatus",
        true
      );

      try {
        const res = await fetch(
          `${apiUrl}/api/orders/${order._id}/payment-status`,
          {
            method: "PUT",

            headers: {
              Accept:
                "application/json",

              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              paymentStatus:
                newPaymentStatus,
            }),
          }
        );

        const data =
          await res.json();

        if (
          !res.ok ||
          !data.success
        ) {
          throw new Error(
            data.message ||
              "Failed to update payment status."
          );
        }

        setOrders(
          (prevOrders) =>
            prevOrders.map(
              (item) =>
                item?._id ===
                order._id
                  ? {
                      ...item,

                      paymentStatus:
                        data.order
                          ?.paymentStatus ||
                        newPaymentStatus,

                      updatedAt:
                        data.order
                          ?.updatedAt ||
                        item.updatedAt,
                    }
                  : item
            )
        );

        toast.success(
          `Payment marked as ${newPaymentStatus}.`
        );
      } catch (error) {
        console.error(
          "Payment status update error:",
          error
        );

        toast.error(
          error.message ||
            "Failed to update payment status."
        );
      } finally {
        setAction(
          order._id,
          "paymentStatus",
          false
        );
      }
    };

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

  const handleCancelCustomerEdit =
    () => {
      setEditingCustomerId(null);

      setEditingPhone("");

      setEditingAddress("");
    };

  const handleSaveCustomerInfo =
    async (order) => {
      if (!order?._id) {
        toast.error(
          "Invalid order."
        );

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
              Accept:
                "application/json",

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

        const data =
          await res.json();

        if (
          !res.ok ||
          !data.success
        ) {
          throw new Error(
            data.message ||
              "Failed to update customer information."
          );
        }

        setOrders(
          (prevOrders) =>
            prevOrders.map(
              (item) =>
                item?._id ===
                order._id
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

        setEditingCustomerId(
          null
        );

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

const handleFraudCheck = async (order, force = false) => {
  if (!order?._id) {
    toast.error("Invalid order.");
    return;
  }

  setAction(order._id, "fraud", true);

  try {
    const res = await fetch(
      `${apiUrl}/api/fraud/check/${order._id}${force ? "?force=true" : ""}`,
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
      throw new Error(data.message || "Fraud check failed");
    }

    const fraudResult = data.fraudCheck || data.result || null;

    if (!fraudResult) {
      throw new Error("Fraud check returned no data.");
    }

    setOrders((prevOrders) =>
      prevOrders.map((item) =>
        item?._id === order._id
          ? {
              ...item,
              fraudCheck: fraudResult,
            }
          : item
      )
    );

    if (data.cached) {
      toast.success("Saved fraud result loaded.");
      return;
    }

    if (
      fraudResult.riskLevel === "Unverified" ||
      fraudResult.riskLevel === "Unknown"
    ) {
      toast.success("No SteadFast history found for this number.");
    } else {
      toast.success(
        `Fraud check completed — ${fraudResult.riskLevel} risk`
      );
    }
  } catch (error) {
    console.error("Fraud check error:", error);

    toast.error(error.message || "Fraud check failed");
  } finally {
    setAction(order._id, "fraud", false);
  }
};

  const handlePathaoEntry = async (
    order
  ) => {
    if (!order?._id) {
      toast.error(
        "Invalid order."
      );

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
            Accept:
              "application/json",

            "Content-Type":
              "application/json",
          },
        }
      );

      const data =
        await res.json();

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
        setOrders(
          (prevOrders) =>
            prevOrders.map(
              (item) =>
                item?._id ===
                order._id
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

  const handleSteadFastEntry =
    async (order) => {
      if (!order?._id) {
        toast.error(
          "Invalid order."
        );

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
              Accept:
                "application/json",

              "Content-Type":
                "application/json",
            },
          }
        );

        const data =
          await res.json();

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

  const handleDeleteOrder =
    async () => {
      if (!deleteOrder?._id) {
        toast.error(
          "Invalid order."
        );

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
              Accept:
                "application/json",
            },
          }
        );

        const data =
          await res.json();

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
                order?._id !==
                orderId
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

const handleDownloadInvoice = async (order) => {
  if (!order?._id) {
    toast.error("Invalid order.");
    return;
  }

  if (isActionLoading(order._id, "invoice")) {
    return;
  }

  setAction(order._id, "invoice", true);

  let iframe = null;

  try {
    iframe = document.createElement("iframe");

    iframe.style.position = "fixed";
    iframe.style.left = "-10000px";
    iframe.style.top = "0";
    iframe.style.width = "800px";
    iframe.style.height = "1200px";
    iframe.style.border = "0";
    iframe.style.visibility = "hidden";

    document.body.appendChild(iframe);

    const iframeDocument =
      iframe.contentDocument ||
      iframe.contentWindow?.document;

    if (!iframeDocument) {
      throw new Error(
        "Unable to create invoice document."
      );
    }

    const orderId =
      order.orderId ||
      order._id ||
      "Afis";

    const customerName =
      order.fullName ||
      "Valued Customer";

    const customerPhone =
      order.phoneNumber ||
      "N/A";

    const customerAddress =
      order.streetAddress ||
      "Dhaka";

    const paymentMethod =
      order.paymentMethod ||
      "Cash on Delivery";

    const shippingCost =
      Number(order.shippingCharge || 0);

    const total =
      Number(order.totalCost || 0);

    const cart =
      Array.isArray(order.cart)
        ? order.cart
        : [];

    const subtotal =
      cart.reduce(
        (acc, item) =>
          acc +
          Number(item?.price || 0) *
            (Number(item?.quantity) || 1),
        0
      );

    const orderDate = order.createdAt
      ? new Date(
          order.createdAt
        ).toLocaleDateString()
      : new Date().toLocaleDateString();

    const productRows =
      cart.length > 0
        ? cart
            .map((item, idx) => {
              const quantity =
                Number(item?.quantity) || 1;

              const price =
                Number(item?.price) || 0;

              const itemTotal =
                price * quantity;

              const customization =
                item?.customization || {};

              return `
                <tr
                  style="
                    border-bottom:
                      1px solid #e2e8f0;
                  "
                >

                  <td
                    style="
                      padding: 12px 10px;
                    "
                  >

                    <div
                      style="
                        font-weight: bold;
                      "
                    >
                      ${String(
                        item?.title ||
                          "Product"
                      )}
                    </div>

                    <div
                      style="
                        font-size: 11px;
                        color: #666666;
                        margin-top: 2px;
                      "
                    >

                      ${
                        item?.selectedColor
                          ? `Color: ${String(
                              item.selectedColor
                            )}`
                          : ""
                      }

                      ${
                        item?.selectedColor &&
                        item?.selectedSize
                          ? " | "
                          : ""
                      }

                      ${
                        item?.selectedSize
                          ? `Size: ${String(
                              item.selectedSize
                            )}`
                          : ""
                      }

                    </div>

                    ${
                      customization &&
                      (
                        customization.length ||
                        customization.width ||
                        customization.sleeve ||
                        customization.instructions
                      )
                        ? `
                          <div
                            style="
                              font-size: 11px;
                              color: #b45309;
                              margin-top: 2px;
                            "
                          >

                            ${
                              customization.length
                                ? `Length: ${String(
                                    customization.length
                                  )}" `
                                : ""
                            }

                            ${
                              customization.width
                                ? `Width: ${String(
                                    customization.width
                                  )}" `
                                : ""
                            }

                            ${
                              customization.sleeve
                                ? `Sleeve: ${String(
                                    customization.sleeve
                                  )}"`
                                : ""
                            }

                            ${
                              customization.instructions
                                ? `
                                  <div
                                    style="
                                      font-style: italic;
                                    "
                                  >
                                    Note:
                                    ${String(
                                      customization.instructions
                                    )}
                                  </div>
                                `
                                : ""
                            }

                          </div>
                        `
                        : ""
                    }

                    ${
                      item?.productNote
                        ? `
                          <div
                            style="
                              font-size: 11px;
                              color: #4f46e5;
                              margin-top: 3px;
                              font-style: italic;
                            "
                          >
                            Note:
                            ${String(
                              item.productNote
                            )}
                          </div>
                        `
                        : ""
                    }

                  </td>

                  <td
                    style="
                      padding: 12px 10px;
                      text-align: center;
                    "
                  >
                    ${quantity}
                  </td>

                  <td
                    style="
                      padding: 12px 10px;
                      text-align: right;
                    "
                  >
                    ৳${price.toFixed(2)}
                  </td>

                  <td
                    style="
                      padding: 12px 10px;
                      text-align: right;
                      font-weight: bold;
                    "
                  >
                    ৳${itemTotal.toFixed(2)}
                  </td>

                </tr>
              `;
            })
            .join("")
        : `
          <tr>
            <td
              colspan="4"
              style="
                padding: 20px;
                text-align: center;
                color: #888888;
              "
            >
              No products found.
            </td>
          </tr>
        `;

    iframeDocument.open();

    iframeDocument.write(`
      <!DOCTYPE html>

      <html>

        <head>

          <meta charset="UTF-8" />

          <style>

            * {
              box-sizing: border-box;
            }

            html,
            body {
              margin: 0;
              padding: 0;
              background: #ffffff;
              color: #333333;
              font-family:
                Arial,
                Helvetica,
                sans-serif;
            }

            body {
              width: 800px;
            }

            table {
              border-collapse: collapse;
            }

            img {
              max-width: 100%;
            }

            p,
            h1,
            h2,
            h3,
            h4 {
              margin-top: 0;
            }

          </style>

        </head>

        <body>

          <div
            id="invoice"
            style="
              width: 800px;
              padding: 40px;
              background: #ffffff;
              color: #333333;
              font-family:
                Arial,
                Helvetica,
                sans-serif;
              font-size: 14px;
              line-height: 1.4;
              box-sizing: border-box;
            "
          >

            <!-- HEADER -->

            <div
              style="
                display: flex;
                justify-content: space-between;
                border-bottom:
                  2px solid #b45309;
                padding-bottom: 20px;
                margin-bottom: 20px;
              "
            >

              <div>

                <h1
                  style="
                    font-size: 26px;
                    color: #b45309;
                    margin:
                      0 0 5px 0;
                    font-weight: bold;
                  "
                >
                  Afis Creation
                </h1>

                <p
                  style="
                    margin: 0;
                    font-size: 12px;
                    color: #666666;
                  "
                >
                  Elegance in Every Stitch
                </p>

                <p
                  style="
                    margin:
                      5px 0 0 0;
                    font-size: 12px;
                    color: #666666;
                  "
                >
                  Email:
                  support@afiscreation.com
                </p>

              </div>

              <div
                style="
                  text-align: right;
                "
              >

                <h2
                  style="
                    font-size: 22px;
                    margin:
                      0 0 5px 0;
                    color: #333333;
                  "
                >
                  INVOICE
                </h2>

                <p
                  style="
                    margin: 0;
                    font-size: 14px;
                    font-weight: bold;
                    color: #b45309;
                  "
                >
                  Order ID:
                  ${String(orderId)}
                </p>

                <p
                  style="
                    margin:
                      5px 0 0 0;
                    font-size: 12px;
                    color: #666666;
                  "
                >
                  Date:
                  ${orderDate}
                </p>

              </div>

            </div>

            <!-- BILLING -->

            <div
              style="
                display: flex;
                justify-content:
                  space-between;
                margin-bottom: 30px;
                font-size: 14px;
              "
            >

              <div>

                <h4
                  style="
                    margin:
                      0 0 5px 0;
                    color: #b45309;
                  "
                >
                  Billed To:
                </h4>

                <p
                  style="
                    margin:
                      0 0 3px 0;
                    font-weight: bold;
                  "
                >
                  ${String(customerName)}
                </p>

                <p
                  style="
                    margin:
                      0 0 3px 0;
                  "
                >
                  Phone:
                  ${String(customerPhone)}
                </p>

                <p
                  style="
                    margin: 0;
                  "
                >
                  Address:
                  ${String(customerAddress)}
                </p>

              </div>

              <div
                style="
                  text-align: right;
                "
              >

                <h4
                  style="
                    margin:
                      0 0 5px 0;
                    color: #b45309;
                  "
                >
                  Payment Method:
                </h4>

                <p
                  style="
                    margin: 0;
                  "
                >
                  ${String(paymentMethod)}
                </p>

              </div>

            </div>

            <!-- TABLE -->

            <table
              style="
                width: 100%;
                border-collapse:
                  collapse;
                margin-bottom: 30px;
                font-size: 13px;
              "
            >

              <thead>

                <tr
                  style="
                    background-color:
                      #f8fafc;
                    border-bottom:
                      1px solid #cbd5e1;
                  "
                >

                  <th
                    style="
                      padding: 10px;
                      text-align: left;
                    "
                  >
                    Item Description
                  </th>

                  <th
                    style="
                      padding: 10px;
                      text-align: center;
                    "
                  >
                    Qty
                  </th>

                  <th
                    style="
                      padding: 10px;
                      text-align: right;
                    "
                  >
                    Price
                  </th>

                  <th
                    style="
                      padding: 10px;
                      text-align: right;
                    "
                  >
                    Total
                  </th>

                </tr>

              </thead>

              <tbody>

                ${productRows}

              </tbody>

            </table>

            <!-- TOTAL -->

            <div
              style="
                display: flex;
                justify-content:
                  flex-end;
              "
            >

              <div
                style="
                  width: 250px;
                  font-size: 14px;
                "
              >

                <div
                  style="
                    display: flex;
                    justify-content:
                      space-between;
                    padding: 6px 0;
                    border-bottom:
                      1px solid #e2e8f0;
                  "
                >

                  <span>
                    Subtotal:
                  </span>

                  <span>
                    ৳${subtotal.toFixed(2)}
                  </span>

                </div>

                <div
                  style="
                    display: flex;
                    justify-content:
                      space-between;
                    padding: 6px 0;
                    border-bottom:
                      1px solid #e2e8f0;
                  "
                >

                  <span>
                    Shipping:
                  </span>

                  <span>
                    ৳${shippingCost.toFixed(2)}
                  </span>

                </div>

                <div
                  style="
                    display: flex;
                    justify-content:
                      space-between;
                    padding: 10px 0;
                    font-weight: bold;
                    font-size: 16px;
                    color: #b45309;
                  "
                >

                  <span>
                    Total:
                  </span>

                  <span>
                    ৳${total.toFixed(2)}
                  </span>

                </div>

              </div>

            </div>

            <!-- FOOTER -->

            <div
              style="
                margin-top: 50px;
                text-align: center;
                font-size: 11px;
                color: #888888;
                border-top:
                  1px solid #e2e8f0;
                padding-top: 15px;
              "
            >

              <p
                style="
                  margin: 0;
                "
              >
                Thank you for your purchase
                with Afis Creation! For any
                query, contact us at
                support@afiscreation.com
              </p>

            </div>

          </div>

        </body>

      </html>
    `);

    iframeDocument.close();

    await new Promise((resolve) => {
      setTimeout(resolve, 300);
    });

    const invoiceElement =
      iframeDocument.getElementById(
        "invoice"
      );

    if (!invoiceElement) {
      throw new Error(
        "Invoice content could not be generated."
      );
    }

    const canvas =
      await html2canvas(
        invoiceElement,
        {
          scale: 2,

          backgroundColor:
            "#ffffff",

          useCORS: false,

          allowTaint: false,

          logging: false,

          foreignObjectRendering:
            false,

          imageTimeout: 10000,

          removeContainer: true,
        }
      );

    if (
      !canvas ||
      canvas.width === 0 ||
      canvas.height === 0
    ) {
      throw new Error(
        "Invoice canvas could not be generated."
      );
    }

    const imgData =
      canvas.toDataURL(
        "image/png",
        1.0
      );

    const pdf =
      new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true,
      });

    const pdfWidth =
      pdf.internal.pageSize.getWidth();

    const pdfHeight =
      pdf.internal.pageSize.getHeight();

    const imgHeight =
      (canvas.height * pdfWidth) /
      canvas.width;

    let heightLeft =
      imgHeight;

    let position = 0;

    pdf.addImage(
      imgData,
      "PNG",
      0,
      position,
      pdfWidth,
      imgHeight,
      undefined,
      "FAST"
    );

    heightLeft -= pdfHeight;

    while (heightLeft > 0) {
      position =
        heightLeft - imgHeight;

      pdf.addPage();

      pdf.addImage(
        imgData,
        "PNG",
        0,
        position,
        pdfWidth,
        imgHeight,
        undefined,
        "FAST"
      );

      heightLeft -= pdfHeight;
    }

    const safeOrderId =
      String(orderId).replace(
        /[^a-zA-Z0-9-_]/g,
        "-"
      );

    pdf.save(
      `Invoice-${safeOrderId}.pdf`
    );

    toast.success(
      "Invoice downloaded successfully."
    );

  } catch (error) {
    console.error(
      "Invoice generation failed:",
      error
    );

    toast.error(
      error?.message ||
        "Invoice download failed. Please try again."
    );

  } finally {

    if (
      iframe &&
      iframe.parentNode
    ) {
      iframe.parentNode.removeChild(
        iframe
      );
    }

    setAction(
      order._id,
      "invoice",
      false
    );
  }
};

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

    if (
      normalized.includes(
        "confirmed"
      )
    ) {
      return "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400";
    }

    return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
  };

  const getPaymentStyle = (
    paymentStatus
  ) => {
    switch (
      paymentStatus ||
      "Pending"
    ) {
      case "Paid":
        return "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-900/50";

      case "Failed":
        return "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-900/50";

      case "Refunded":
        return "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-900/50";

      case "Pending":
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-900/50";
    }
  };

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
      case "Unknown":
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
  // PROFESSIONAL FILTER TABS
  // ========================================

 const OrderStatCard = ({
  id,
  title,
  count,
  icon: Icon,
  type = "period",
}) => {
  const isActive =
    type === "status"
      ? orderStatusFilter === id
      : type === "payment"
      ? paymentFilter === id
      : orderPeriod === id;

  const handleClick = () => {
    if (type === "status") {
      setOrderStatusFilter(id);
      setPaymentFilter("all");
    } else if (type === "payment") {
      setPaymentFilter(id);
      setOrderStatusFilter("all");
    } else {
      setOrderPeriod(id);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`
        group relative shrink-0
        h-[62px] px-4
        flex items-center gap-2.5
        border-b-2
        transition-all duration-200
        ${
          isActive
            ? "border-amber-500 text-gray-900 dark:text-white"
            : "border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white"
        }
      `}
    >
      {/* small marker */}
      <span
        className={`
          w-1.5 h-1.5 rounded-full transition-all
          ${
            isActive
              ? "bg-amber-500"
              : "bg-gray-300 dark:bg-slate-600 group-hover:bg-gray-400"
          }
        `}
      />

      <span className="text-left leading-none">
        <span className="block text-[11px] font-medium whitespace-nowrap">
          {title}
        </span>

        <span
          className={`
            block mt-1 text-sm font-bold tracking-tight
            ${
              isActive
                ? "text-gray-950 dark:text-white"
                : "text-gray-700 dark:text-slate-300"
            }
          `}
        >
          {Number(count || 0).toLocaleString()}
        </span>
      </span>

      {/* very subtle icon */}
      <Icon
        size={13}
        strokeWidth={1.7}
        className={`
          ml-1 transition-colors
          ${
            isActive
              ? "text-amber-500"
              : "text-gray-300 dark:text-slate-600 group-hover:text-gray-400"
          }
        `}
      />
    </button>
  );
};
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

      <div className="mb-6 bg-white dark:bg-slate-800 border-y border-gray-200 dark:border-slate-700">
  <div className="flex items-stretch overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-slate-600">

    {/* PERIOD */}
    <div className="flex items-center shrink-0 px-2">
      <span className="px-2 text-[9px] font-bold uppercase tracking-[0.18em] text-gray-300 dark:text-slate-600">
        Period
      </span>

      <OrderStatCard
        id="all"
        title="All Orders"
        count={orderStats.total}
        icon={ShoppingBag}
      />

      <OrderStatCard
        id="today"
        title="Today"
        count={orderStats.today}
        icon={Clock3}
      />

      <OrderStatCard
        id="7days"
        title="7 Days"
        count={orderStats.last7Days}
        icon={CalendarDays}
      />

      <OrderStatCard
        id="month"
        title="1 Month"
        count={orderStats.lastMonth}
        icon={CalendarDays}
      />

      <OrderStatCard
        id="year"
        title="1 Year"
        count={orderStats.lastYear}
        icon={CalendarRange}
      />
    </div>

    {/* SEPARATOR */}
    <div className="my-3 w-px bg-gray-200 dark:bg-slate-700 shrink-0" />

    {/* STATUS */}
    <div className="flex items-center shrink-0 px-2">
      <span className="px-2 text-[9px] font-bold uppercase tracking-[0.18em] text-gray-300 dark:text-slate-600">
        Status
      </span>

      <OrderStatCard
        id="Pending"
        title="Pending"
        count={orderStats.statusCounts.Pending}
        icon={Clock3}
        type="status"
      />

      <OrderStatCard
        id="Processing"
        title="Processing"
        count={orderStats.statusCounts.Processing}
        icon={Loader2}
        type="status"
      />

      <OrderStatCard
        id="Confirmed"
        title="Confirmed"
        count={orderStats.statusCounts.Confirmed}
        icon={CheckCircle2}
        type="status"
      />

      <OrderStatCard
        id="Ready To Ship"
        title="Ready To Ship"
        count={orderStats.statusCounts["Ready To Ship"]}
        icon={PackageCheck}
        type="status"
      />

      <OrderStatCard
        id="Shipped"
        title="Shipped"
        count={orderStats.statusCounts.Shipped}
        icon={Truck}
        type="status"
      />

      <OrderStatCard
        id="Delivered"
        title="Delivered"
        count={orderStats.statusCounts.Delivered}
        icon={CheckCircle2}
        type="status"
      />

      <OrderStatCard
        id="Cancelled"
        title="Cancelled"
        count={orderStats.statusCounts.Cancelled}
        icon={X}
        type="status"
      />

      <OrderStatCard
        id="Returned"
        title="Returned"
        count={orderStats.statusCounts.Returned}
        icon={Package}
        type="status"
      />

      <OrderStatCard
        id="Failed"
        title="Failed"
        count={orderStats.statusCounts.Failed}
        icon={AlertTriangle}
        type="status"
      />
    </div>

    {/* SEPARATOR */}
    <div className="my-3 w-px bg-gray-200 dark:bg-slate-700 shrink-0" />

    {/* PAYMENT */}
    <div className="flex items-center shrink-0 px-2 pr-4">
      <span className="px-2 text-[9px] font-bold uppercase tracking-[0.18em] text-gray-300 dark:text-slate-600">
        Payment
      </span>

      <OrderStatCard
        id="Pending"
        title="Payment Pending"
        count={orderStats.pendingPayment}
        icon={CreditCard}
        type="payment"
      />

      <OrderStatCard
        id="Paid"
        title="Paid"
        count={orderStats.paidOrders}
        icon={CircleDollarSign}
        type="payment"
      />
    </div>
  </div>

  <div className="border-t border-gray-100 dark:border-slate-700 px-4 md:px-5">

    <div className="min-h-[58px] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

      {/* LEFT */}
      <div className="flex items-center gap-3 min-w-0">

        {/* tiny index */}
        <div className="hidden sm:flex items-center justify-center w-6 h-6 border border-gray-200 dark:border-slate-700 text-[10px] font-bold text-gray-400 dark:text-slate-500">
          #
        </div>

        <div className="min-w-0">

          <div className="flex items-center gap-2">

            <h2 className="text-xs font-semibold text-gray-800 dark:text-slate-200 truncate">
              {selectedFilterLabel}
            </h2>

            {(orderPeriod !== "all" ||
              orderStatusFilter !== "all" ||
              paymentFilter !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setOrderPeriod("all");
                  setOrderStatusFilter("all");
                  setPaymentFilter("all");
                }}
                className="
                  inline-flex items-center gap-1
                  text-[10px] font-semibold
                  text-gray-400
                  hover:text-amber-600
                  transition-colors
                "
              >
                <X size={11} />
                Clear
              </button>
            )}
          </div>

          <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-0.5">
            {filteredOrders.length.toLocaleString()}{" "}
            {filteredOrders.length === 1 ? "order" : "orders"} found
          </p>
        </div>
      </div>

      {/* RIGHT / REVENUE */}
      <div className="flex items-center gap-4 sm:border-l border-gray-200 dark:border-slate-700 sm:pl-5">

        <div className="text-right">
          <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-gray-400 dark:text-slate-500">
            Paid Revenue
          </p>

          <p className="text-base font-bold tracking-tight text-gray-900 dark:text-white mt-0.5">
            ৳{Number(orderStats.totalRevenue).toLocaleString()}
          </p>
        </div>

        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
      </div>

    </div>
  </div>
</div>

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-5">

        <div>

          <div className="flex flex-wrap items-center gap-2">

            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Orders
            </h2>

            <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 dark:bg-slate-700 text-[10px] font-bold text-gray-600 dark:text-slate-300">
              {selectedFilterLabel}
            </span>

          </div>

          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
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

      {filteredOrders.length ===
      0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-12 text-center">

          <PackageCheck
            className="mx-auto text-gray-300 dark:text-slate-600 mb-3"
            size={45}
          />

          <p className="text-gray-500 dark:text-slate-400 font-medium">
            No orders found for{" "}
            {selectedFilterLabel.toLowerCase()}.
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
                  : Number(
                      fraud?.fraudReports ||
                        0
                    );

              const isEditingCustomer =
                editingCustomerId ===
                order._id;

              const currentPaymentStatus =
                order.paymentStatus ||
                "Pending";

              return (
 <div
  key={order._id}
  className="
    overflow-hidden
    border border-slate-200 dark:border-slate-700
    bg-white dark:bg-slate-900
    shadow-[0_2px_10px_rgba(15,23,42,0.04)]
    transition-shadow duration-300
    hover:shadow-[0_6px_20px_rgba(15,23,42,0.07)]
  "
>
  <div
    className="
      border-b border-slate-200 dark:border-slate-700
      px-5 py-4
      bg-slate-50/60 dark:bg-slate-950/40
    "
  >
    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">

      {/* LEFT */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">

        {/* ORDER ID */}
        <div>
          <p className="mb-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            Order
          </p>

          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />

            <p className="font-mono text-sm font-bold text-slate-800 dark:text-slate-100">
              {order.orderId || "N/A"}
            </p>
          </div>
        </div>

        <div className="hidden sm:block h-7 w-px bg-slate-200 dark:bg-slate-700" />

        {/* DATE */}
        <div>
          <p className="mb-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            Placed
          </p>

          <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
            {order.createdAt
              ? new Date(order.createdAt).toLocaleString()
              : "N/A"}
          </p>
        </div>

        <div className="hidden lg:block h-7 w-px bg-slate-200 dark:bg-slate-700" />

        {/* STATUS */}
        <div className="flex items-center gap-2">
          <select
            value={order.status || "Pending"}
            onChange={(e) =>
              handleOrderStatusChange(order, e.target.value)
            }
            disabled={isActionLoading(order._id, "status")}
            className={`
              min-w-[120px]
              rounded-lg
              border
              px-3 py-2
              text-[10px]
              font-bold
              outline-none
              cursor-pointer
              transition
              focus:ring-2 focus:ring-slate-200
              dark:focus:ring-slate-700
              ${getStatusStyle(order.status)}
            `}
          >
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Processing">Processing</option>
            <option value="Ready To Ship">Ready To Ship</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Returned">Returned</option>
            <option value="Failed">Failed</option>
          </select>

          {isActionLoading(order._id, "status") && (
            <Loader2
              size={13}
              className="animate-spin text-slate-400"
            />
          )}
        </div>

        {/* PAYMENT */}
        <div className="flex items-center gap-2">
          <select
            value={currentPaymentStatus}
            onChange={(e) =>
              handlePaymentStatusChange(order, e.target.value)
            }
            disabled={isActionLoading(order._id, "paymentStatus")}
            className={`
              min-w-[125px]
              rounded-lg
              border
              px-3 py-2
              text-[10px]
              font-bold
              outline-none
              cursor-pointer
              transition
              focus:ring-2 focus:ring-slate-200
              dark:focus:ring-slate-700
              ${getPaymentStyle(currentPaymentStatus)}
            `}
          >
            <option value="Pending">Payment Pending</option>
            <option value="Paid">Paid</option>
            <option value="Failed">Payment Failed</option>
            <option value="Refunded">Refunded</option>
          </select>

          {isActionLoading(order._id, "paymentStatus") && (
            <Loader2
              size={13}
              className="animate-spin text-slate-400"
            />
          )}
        </div>
      </div>

      {/* TOTAL */}
      <div className="flex items-center gap-3 xl:border-l xl:border-slate-200 xl:pl-6 dark:xl:border-slate-700">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            Total
          </p>

          <p className="mt-0.5 text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            ৳{Number(order.totalCost || 0).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  </div>
  <div className="p-4 md:p-5">

    <div className="grid grid-cols-1 gap-0 xl:grid-cols-12">
      <div
        className="
          xl:col-span-3
          border-b border-slate-200 pb-5
          xl:border-b-0 xl:border-r xl:pb-0 xl:pr-5
          dark:border-slate-700
        "
      >
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center border border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
            <User size={14} />
          </div>

          <div>
            <p className="text-xs font-bold text-slate-800 dark:text-white">
              Customer
            </p>

            <p className="text-[9px] text-slate-400">
              Contact details
            </p>
          </div>
        </div>

        {isEditingCustomer ? (

          <div className="space-y-3">

            <div>
              <label className="mb-1 block text-[9px] font-semibold uppercase tracking-wide text-slate-400">
                Phone
              </label>

              <div className="relative">
                <Phone
                  size={13}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  value={editingPhone}
                  onChange={(e) =>
                    setEditingPhone(e.target.value)
                  }
                  className="
                    h-9 w-full
                    rounded-lg
                    border border-slate-200
                    bg-white
                    pl-9 pr-3
                    text-xs text-slate-700
                    outline-none
                    focus:border-slate-400
                    focus:ring-2 focus:ring-slate-100
                    dark:border-slate-700
                    dark:bg-slate-800
                    dark:text-white
                    dark:focus:border-slate-500
                  "
                  placeholder="01XXXXXXXXX"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-[9px] font-semibold uppercase tracking-wide text-slate-400">
                Address
              </label>

              <div className="relative">
                <MapPin
                  size={13}
                  className="absolute left-3 top-3 text-slate-400"
                />

                <textarea
                  value={editingAddress}
                  onChange={(e) =>
                    setEditingAddress(e.target.value)
                  }
                  rows={4}
                  className="
                    w-full
                    resize-none
                    rounded-lg
                    border border-slate-200
                    bg-white
                    py-2.5 pl-9 pr-3
                    text-xs text-slate-700
                    outline-none
                    focus:border-slate-400
                    focus:ring-2 focus:ring-slate-100
                    dark:border-slate-700
                    dark:bg-slate-800
                    dark:text-white
                  "
                  placeholder="Enter complete customer address..."
                />
              </div>
            </div>

            {courierSubmitted && (
              <div className="border-l-2 border-orange-400 bg-orange-50 px-3 py-2.5 dark:bg-orange-950/20">
                <p className="text-[10px] leading-4 text-orange-700 dark:text-orange-400">
                  This order is already submitted to{" "}
                  <b>{courierProvider}</b>. Updating here changes
                  your website order only.
                </p>
              </div>
            )}

            <div className="flex gap-2">

              <button
                type="button"
                onClick={() =>
                  handleSaveCustomerInfo(order)
                }
                disabled={isActionLoading(
                  order._id,
                  "customerInfo"
                )}
                className="
                  flex-1
                  inline-flex items-center justify-center gap-1.5
                  rounded-lg
                  bg-slate-900
                  px-3 py-2.5
                  text-[10px] font-bold text-white
                  transition
                  hover:bg-slate-800
                  disabled:opacity-50
                  dark:bg-white dark:text-slate-900
                  dark:hover:bg-slate-100
                "
              >
                {isActionLoading(
                  order._id,
                  "customerInfo"
                ) ? (
                  <Loader2
                    size={13}
                    className="animate-spin"
                  />
                ) : (
                  <Save size={13} />
                )}

                Save
              </button>

              <button
                type="button"
                onClick={handleCancelCustomerEdit}
                disabled={isActionLoading(
                  order._id,
                  "customerInfo"
                )}
                className="
                  flex-1
                  inline-flex items-center justify-center gap-1.5
                  rounded-lg
                  border border-slate-200
                  bg-white
                  px-3 py-2.5
                  text-[10px] font-bold text-slate-600
                  transition
                  hover:bg-slate-50
                  dark:border-slate-700
                  dark:bg-slate-800
                  dark:text-slate-300
                  dark:hover:bg-slate-700
                "
              >
                <X size={13} />
                Cancel
              </button>

            </div>
          </div>

        ) : (

          <div className="space-y-4">

            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {order.fullName || "Unknown Customer"}
              </p>
            </div>

            <div className="space-y-3">

              <div className="flex items-start gap-2.5">
                <Phone
                  size={13}
                  className="mt-0.5 shrink-0 text-slate-400"
                />

                <div className="min-w-0">
                  <p className="text-[8px] font-semibold uppercase tracking-wide text-slate-400">
                    Phone
                  </p>

                  <p className="mt-0.5 break-all text-xs font-medium text-slate-700 dark:text-slate-300">
                    {order.phoneNumber || "No phone"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <MapPin
                  size={13}
                  className="mt-0.5 shrink-0 text-slate-400"
                />

                <div className="min-w-0">
                  <p className="text-[8px] font-semibold uppercase tracking-wide text-slate-400">
                    Address
                  </p>

                  <p className="mt-0.5 text-xs leading-5 text-slate-600 dark:text-slate-400">
                    {order.streetAddress || "No address"}
                  </p>
                </div>
              </div>

            </div>

            <button
              type="button"
              onClick={() => handleStartCustomerEdit(order)}
              className="
                inline-flex items-center gap-1.5
                text-[10px] font-bold
                text-slate-500
                transition
                hover:text-amber-600
                dark:text-slate-400
                dark:hover:text-amber-400
              "
            >
              <Pencil size={11} />
              Edit Phone & Address
            </button>

            {order.orderNotes && (
              <div className="border-l-2 border-blue-400 bg-blue-50/60 px-3 py-2.5 dark:bg-blue-950/20">
                <p className="text-[8px] font-bold uppercase tracking-wide text-blue-600 dark:text-blue-400">
                  Order Note
                </p>

                <p className="mt-1 text-xs italic leading-5 text-blue-700 dark:text-blue-300">
                  {order.orderNotes}
                </p>
              </div>
            )}

          </div>
        )}
      </div>

      <div
        className="
          xl:col-span-4
          border-b border-slate-200 py-5
          xl:border-b-0 xl:border-r xl:px-5
          dark:border-slate-700
        "
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center border border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
              <Package size={14} />
            </div>

            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-white">
                Products
              </p>

              <p className="text-[9px] text-slate-400">
                {order.cart?.length || 0} item(s)
              </p>
            </div>
          </div>
        </div>

        <div className="max-h-60 space-y-2 overflow-y-auto pr-1 custom-scrollbar">

          {Array.isArray(order.cart) &&
            order.cart.map((item, idx) => {

              const customization =
                item?.customization || {};

              const hasCustomization =
                Boolean(
                  customization.length ||
                  customization.height ||
                  customization.width
                );

              return (
                <div
                  key={item?.cartItemId || idx}
                  className="
                    flex items-start gap-3
                    border border-slate-200/80
                    bg-white
                    p-2.5
                    transition
                    hover:border-slate-300
                    hover:bg-slate-50/50
                    dark:border-slate-700
                    dark:bg-slate-800/50
                    dark:hover:border-slate-600
                  "
                >
                  <div className="relative h-11 w-11 shrink-0 overflow-hidden border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900">
                    <Image
                      src={
                        item?.thumbnail ||
                        "/placeholder.png"
                      }
                      alt={item?.title || "Product"}
                      fill
                      sizes="44px"
                      className="object-cover"
                    />
                  </div>

                  <div className="min-w-0 flex-1">

                    <p className="line-clamp-2 text-xs font-semibold text-slate-800 dark:text-white">
                      {item?.title || "Product"}
                    </p>

                    <p className="mt-0.5 text-[10px] text-slate-500 dark:text-slate-400">
                      ৳{item?.price ?? 0} × {item?.quantity || 1}
                    </p>

                    <div className="mt-1.5 flex flex-wrap gap-1">

                      {item?.selectedColor && (
                        <span className="border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[8px] font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                          Color: {item.selectedColor}
                        </span>
                      )}

                      {item?.selectedSize && (
                        <span className="border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[8px] font-semibold text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-300">
                          Size: {item.selectedSize}
                        </span>
                      )}

                    </div>

                    {hasCustomization && (
                      <div className="mt-2 border-l-2 border-amber-400 bg-amber-50/60 p-2 dark:bg-amber-950/20">

                        <div className="mb-1.5 flex items-center gap-1.5">
                          <Ruler
                            size={11}
                            className="text-amber-600 dark:text-amber-400"
                          />

                          <p className="text-[8px] font-bold uppercase tracking-wide text-amber-700 dark:text-amber-400">
                            Custom Measurement
                          </p>
                        </div>

                        <div className="grid grid-cols-3 gap-1.5">

                          {customization.length && (
                            <div className="border border-amber-100 bg-white/70 px-1.5 py-1.5 dark:border-amber-900/40 dark:bg-slate-800">
                              <p className="text-[7px] text-slate-400">
                                Length
                              </p>

                              <p className="text-[9px] font-bold text-slate-700 dark:text-slate-200">
                                {customization.length} inch
                              </p>
                            </div>
                          )}

                          {customization.height && (
                            <div className="border border-amber-100 bg-white/70 px-1.5 py-1.5 dark:border-amber-900/40 dark:bg-slate-800">
                              <p className="text-[7px] text-slate-400">
                                Height
                              </p>

                              <p className="text-[9px] font-bold text-slate-700 dark:text-slate-200">
                                {customization.height} inch
                              </p>
                            </div>
                          )}

                          {customization.width && (
                            <div className="border border-amber-100 bg-white/70 px-1.5 py-1.5 dark:border-amber-900/40 dark:bg-slate-800">
                              <p className="text-[7px] text-slate-400">
                                Width
                              </p>

                              <p className="text-[9px] font-bold text-slate-700 dark:text-slate-200">
                                {customization.width} inch
                              </p>
                            </div>
                          )}

                        </div>

                        <p className="mt-1.5 text-[8px] font-semibold text-amber-600 dark:text-amber-400">
                          No extra charge
                        </p>
                      </div>
                    )}

                    {item?.productNote && (
                      <p className="mt-1.5 text-[9px] italic text-indigo-600 dark:text-indigo-400">
                        Note: {item.productNote}
                      </p>
                    )}

                  </div>
                </div>
              );
            })}

        </div>
      </div>

      <div
        className="
          xl:col-span-2
          border-b border-slate-200 py-5
          xl:border-b-0 xl:border-r xl:px-5
          dark:border-slate-700
        "
      >
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center border border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
            <Truck size={14} />
          </div>

          <div>
            <p className="text-xs font-bold text-slate-800 dark:text-white">
              Shipping
            </p>

            <p className="text-[9px] text-slate-400">
              Delivery details
            </p>
          </div>
        </div>

        <div className="space-y-4">

          <div>
            <p className="text-[8px] font-semibold uppercase tracking-wide text-slate-400">
              Method
            </p>

            <p className="mt-1 text-xs font-semibold capitalize text-slate-700 dark:text-slate-300">
              {order.shippingMethod || "N/A"}
            </p>
          </div>

          <div>
            <p className="text-[8px] font-semibold uppercase tracking-wide text-slate-400">
              Shipping Charge
            </p>

            <p className="mt-1 text-base font-bold text-slate-900 dark:text-white">
              ৳{Number(order.shippingCharge || 0).toLocaleString()}
            </p>
          </div>

          <div>
            <p className="text-[8px] font-semibold uppercase tracking-wide text-slate-400">
              Courier
            </p>

            {courierProvider ? (
              <div className="mt-1.5">
                <p className="text-xs font-semibold text-slate-800 dark:text-white">
                  {courierProvider}
                </p>

                <p className="mt-0.5 text-[9px] text-slate-400">
                  {courierStatus || "Pending"}
                </p>
              </div>
            ) : (
              <p className="mt-1.5 text-[10px] text-slate-400">
                Not assigned
              </p>
            )}
          </div>

        </div>
      </div>

      <div
        className="
          xl:col-span-3
          pt-5
          xl:pt-0 xl:pl-5
        "
      >
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center border border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
            <ShieldCheck size={14} />
          </div>

          <div>
            <p className="text-xs font-bold text-slate-800 dark:text-white">
              Fraud Check
            </p>

            <p className="text-[9px] text-slate-400">
              Customer risk analysis
            </p>
          </div>
        </div>

        {fraud?.checked ? (

          <div
            className={`
              border
              p-3
              ${fraudRiskStyle?.boxClass ||
                "bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700"}
            `}
          >

            <div className="flex items-center justify-between gap-2">

              <div className="flex items-center gap-2">

                {fraudRiskStyle &&
                  React.createElement(
                    fraudRiskStyle.Icon,
                    {
                      size: 16,
                      className: fraudRiskStyle.iconClass,
                    }
                  )}

                <span
                  className={`text-xs font-bold ${
                    fraudRiskStyle?.textClass ||
                    "text-slate-600 dark:text-slate-300"
                  }`}
                >
                  {fraud.riskLevel || "Unverified"}
                </span>

              </div>

              <span className="text-[8px] font-semibold text-slate-500 dark:text-slate-400">
                {fraud.cancellationRate !== undefined
                  ? `${fraud.cancellationRate}% cancel`
                  : ""}
              </span>

            </div>

            {fraud.riskLevel === "Unverified" ||
            fraud.riskLevel === "Unknown" ? (

              <p className="mt-3 text-[10px] text-slate-500 dark:text-slate-400">
                No SteadFast history found.
              </p>

            ) : (

              <>
                <p className="mt-3 text-[10px] font-medium text-slate-600 dark:text-slate-300">
                  {fraud.deliveryRatio ?? 0}% delivered ·{" "}
                  {fraud.cancellationRate ?? 0}% cancelled
                </p>

                {fraud.volumeBand && (
                  <p className="text-[10px] capitalize text-slate-500 dark:text-slate-400">
                    Order volume: {fraud.volumeBand}
                  </p>
                )}

                {fraud.returnedOrders > 0 && (
                  <p className="mt-1 text-[10px] font-medium text-orange-600 dark:text-orange-400">
                    {fraud.returnedOrders} returned
                  </p>
                )}

                {fraudReportCount > 0 && (
                  <p className="mt-1 text-[10px] font-bold text-red-600 dark:text-red-400">
                    {fraudReportCount} fraud report
                    {fraudReportCount > 1 ? "s" : ""} on file
                  </p>
                )}

                <p className="mt-2 text-[10px] text-slate-500 dark:text-slate-400">
                  Risk based on cancellation history
                </p>
              </>
            )}

            {fraud.checkedAt && (
              <p className="mt-2 text-[9px] text-slate-400">
                {new Date(fraud.checkedAt).toLocaleString()}
              </p>
            )}

          </div>

        ) : (

          <div className="flex min-h-[105px] items-center justify-center border border-dashed border-slate-200 bg-slate-50/50 p-4 dark:border-slate-700 dark:bg-slate-950/40">
            <p className="text-center text-[10px] text-slate-400">
              Fraud check not completed.
            </p>
          </div>

        )}

      </div>
    </div>

    <div
      className="
        mt-5
        border-t border-slate-200
        pt-4
        dark:border-slate-700
      "
    >
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">

        {/* TRACKING */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">

          {consignmentId && (
            <div>
              <p className="text-[8px] font-semibold uppercase tracking-wide text-slate-400">
                Consignment
              </p>

              <button
                type="button"
                onClick={() => copyTracking(consignmentId)}
                className="mt-0.5 flex items-center gap-1 font-mono text-[10px] font-bold text-blue-600 hover:underline dark:text-blue-400"
              >
                {consignmentId}

                {copiedId === consignmentId ? (
                  <CheckCircle2 size={11} />
                ) : (
                  <Copy size={11} />
                )}
              </button>
            </div>
          )}

          {trackingCode && (
            <div>
              <p className="text-[8px] font-semibold uppercase tracking-wide text-slate-400">
                Tracking
              </p>

              <button
                type="button"
                onClick={() => copyTracking(trackingCode)}
                className="mt-0.5 flex items-center gap-1 font-mono text-[10px] font-bold text-indigo-600 hover:underline dark:text-indigo-400"
              >
                {trackingCode}

                {copiedId === trackingCode ? (
                  <CheckCircle2 size={11} />
                ) : (
                  <Copy size={11} />
                )}
              </button>
            </div>
          )}

          {courierStatus && (
            <div>
              <p className="text-[8px] font-semibold uppercase tracking-wide text-slate-400">
                Courier Status
              </p>

              <p className="mt-0.5 text-[10px] font-semibold text-slate-700 dark:text-slate-300">
                {courierStatus}
              </p>
            </div>
          )}

          <div>
            <p className="text-[8px] font-semibold uppercase tracking-wide text-slate-400">
              Payment
            </p>

            <span
              className={`mt-0.5 inline-flex text-[9px] font-bold ${getPaymentStyle(
                currentPaymentStatus
              )} border-0 bg-transparent p-0`}
            >
              {currentPaymentStatus}
            </span>
          </div>

        </div>

        {/* BUTTONS */}
        <div className="flex flex-wrap items-center gap-2">

          <button
            type="button"
            onClick={() => handleFraudCheck(order, Boolean(fraud?.checked))}
            disabled={isActionLoading(order._id, "fraud")}
            className="
              inline-flex h-9 items-center justify-center gap-1.5
              border border-purple-200
              bg-white px-3
              text-[9px] font-bold text-purple-700
              transition
              hover:bg-purple-50
              disabled:opacity-50
              dark:border-purple-900/50
              dark:bg-slate-800
              dark:text-purple-400
            "
          >
            {isActionLoading(order._id, "fraud") ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <ShieldCheck size={13} />
            )}

            {fraud?.checked ? "Check Again" : "Fraud Check"}
          </button>

          <button
            type="button"
            onClick={() => handlePathaoEntry(order)}
            disabled={
              courierSubmitted ||
              isActionLoading(order._id, "pathao")
            }
            className="
              inline-flex h-9 items-center justify-center gap-1.5
              border border-orange-200
              bg-white px-3
              text-[9px] font-bold text-orange-700
              transition
              hover:bg-orange-50
              disabled:opacity-50
              dark:border-orange-900/50
              dark:bg-slate-800
              dark:text-orange-400
            "
          >
            {isActionLoading(order._id, "pathao") ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Truck size={13} />
            )}

            {String(courierProvider || "").toLowerCase() ===
            "pathao"
              ? "Pathao Submitted"
              : courierSubmitted
              ? "Courier Submitted"
              : "Send to Pathao"}
          </button>

          <button
            type="button"
            onClick={() => handleSteadFastEntry(order)}
            disabled={
              courierSubmitted ||
              isActionLoading(order._id, "steadfast")
            }
            className="
              inline-flex h-9 items-center justify-center gap-1.5
              border border-blue-200
              bg-white px-3
              text-[9px] font-bold text-blue-700
              transition
              hover:bg-blue-50
              disabled:opacity-50
              dark:border-blue-900/50
              dark:bg-slate-800
              dark:text-blue-400
            "
          >
            {isActionLoading(order._id, "steadfast") ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Truck size={13} />
            )}

            {String(courierProvider || "").toLowerCase() ===
            "steadfast"
              ? "SteadFast Submitted"
              : courierSubmitted
              ? "Courier Submitted"
              : "Send to SteadFast"}
          </button>

          <button
            type="button"
            onClick={() => handleDownloadInvoice(order)}
            disabled={isActionLoading(order._id, "invoice")}
            className="
              inline-flex h-9 items-center justify-center gap-1.5
              border border-emerald-200
              bg-white px-3
              text-[9px] font-bold text-emerald-700
              transition
              hover:bg-emerald-50
              disabled:opacity-50
              dark:border-emerald-900/50
              dark:bg-slate-800
              dark:text-emerald-400
            "
          >
            {isActionLoading(order._id, "invoice") ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Download size={13} />
            )}

            {isActionLoading(order._id, "invoice")
              ? "Generating..."
              : "Invoice"}
          </button>

          <button
            type="button"
            onClick={() => setDeleteOrder(order)}
            disabled={isActionLoading(order._id, "delete")}
            className="
              inline-flex h-9 items-center justify-center gap-1.5
              border border-red-200
              bg-white px-3
              text-[9px] font-bold text-red-600
              transition
              hover:bg-red-50
              disabled:opacity-50
              dark:border-red-900/50
              dark:bg-slate-800
              dark:text-red-400
            "
          >
            <Trash2 size={13} />
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