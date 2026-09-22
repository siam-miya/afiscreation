"use client";

import React, {
  useEffect,
  useState,
  useRef,
  Suspense,
} from "react";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

import {
  CheckCircle2,
  Download,
  Home,
  Package,
  MapPin,
  Phone,
  Check,
} from "lucide-react";

import html2canvas from "html2canvas";
import jsPDF from "jspdf";

function ThankYouContent() {
  const searchParams = useSearchParams();

  const [orderDetails, setOrderDetails] = useState({
    orderId: "",
    name: "",
    phone: "",
    email: "support@afiscreation.com",
    address: "",
    city: "Dhaka",
    shippingCost: 0,
    paymentMethod: "Cash on Delivery",
    cart: [],
    total: 0,
  });

  const [isGeneratingPdf, setIsGeneratingPdf] =
    useState(false);

  const invoiceRef = useRef(null);

  useEffect(() => {
    const orderId = searchParams.get("orderId");

    if (!orderId) return;

    const cleanOrderId = orderId.trim().toUpperCase();

    const savedOrder = localStorage.getItem(
      `order_${orderId}`
    );

    if (savedOrder) {
      try {
        const parsedData = JSON.parse(savedOrder);

        setOrderDetails((prev) => ({
          ...prev,
          ...parsedData,

          orderId:
            parsedData.orderId ||
            cleanOrderId,

          cart: Array.isArray(parsedData.cart)
            ? parsedData.cart
            : [],

          total:
            Number(parsedData.total) || 0,

          shippingCost:
            Number(parsedData.shippingCost) || 0,
        }));

        return;
      } catch (error) {
        console.error(
          "Failed to parse order from localStorage:",
          error
        );
      }
    }

    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:5000";

    fetch(
      `${apiUrl}/api/orders/details/${encodeURIComponent(
        cleanOrderId
      )}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        cache: "no-store",
      }
    )
      .then(async (res) => {
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(
            data.message ||
            "Failed to fetch order"
          );
        }

        return data;
      })
      .then((data) => {
        const order = data.order;

        if (!order) return;

        setOrderDetails((prev) => ({
          ...prev,

          orderId:
            order.orderId ||
            cleanOrderId,

          name:
            order.fullName ||
            "Valued Customer",

          phone:
            order.phoneNumber ||
            "N/A",

          email:
            "support@afiscreation.com",

          address:
            order.streetAddress ||
            "Dhaka",

          city:
            "Dhaka",

          shippingCost:
            Number(order.shippingCharge) || 0,

          paymentMethod:
            "Cash on Delivery",

          cart:
            Array.isArray(order.cart)
              ? order.cart
              : [],

          total:
            Number(order.totalCost) || 0,
        }));
      })
      .catch((error) => {
        console.error(
          "Error fetching order from backend:",
          error
        );
      });
  }, [searchParams]);

 const downloadInvoicePdf = async () => {
  if (
    !invoiceRef.current ||
    isGeneratingPdf
  ) {
    return;
  }

  setIsGeneratingPdf(true);

  try {
    await new Promise((resolve) =>
      requestAnimationFrame(resolve)
    );

    const canvas = await html2canvas(
      invoiceRef.current,
      {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#ffffff",
        logging: false,
        imageTimeout: 15000,
        removeContainer: true,
        foreignObjectRendering: false,
      }
    );

    const imgData =
      canvas.toDataURL(
        "image/png",
        1.0
      );

    const pdf = new jsPDF(
      "p",
      "mm",
      "a4"
    );

    const pdfWidth =
      pdf.internal.pageSize.getWidth();

    const pdfPageHeight =
      pdf.internal.pageSize.getHeight();

    const imgHeight =
      (canvas.height * pdfWidth) /
      canvas.width;

    let heightLeft = imgHeight;
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

    heightLeft -= pdfPageHeight;

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

      heightLeft -= pdfPageHeight;
    }

    const fileName =
      `Invoice-${orderDetails.orderId || "Afis"}.pdf`;

    const pdfBlob =
      pdf.output("blob");

    const blobUrl =
      URL.createObjectURL(pdfBlob);

    const downloadLink =
      document.createElement("a");

    downloadLink.href =
      blobUrl;

    downloadLink.download =
      fileName;

    downloadLink.style.display =
      "none";

    document.body.appendChild(
      downloadLink
    );

    downloadLink.click();

    document.body.removeChild(
      downloadLink
    );

    setTimeout(() => {
      URL.revokeObjectURL(blobUrl);
    }, 1000);

  } catch (error) {
    console.error(
      "PDF generation failed:",
      error
    );

    alert(
      "Invoice download failed. Please try again."
    );

  } finally {
    setIsGeneratingPdf(false);
  }
};

  const subtotalAmount =
    Array.isArray(orderDetails.cart)
      ? orderDetails.cart.reduce(
        (acc, item) =>
          acc +
          Number(item.price || 0) *
          (Number(item.quantity) || 1),
        0
      )
      : 0;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-bl-4xl rounded-tr-4xl shadow  border border-gray-100 p-8 text-center mb-8">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-10 h-10"/>  
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Order Placed Successfully!
          </h1>
          <p className="text-gray-600 mb-6">
            Thank you for shopping with{" "}
            <span className="font-semibold text-primary">
              Afis Creation
            </span>
            . We have received your order.
          </p>

          <div className="inline-block bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 mb-6">
            <span className="text-sm text-gray-500">
              Order ID:{" "}
            </span>

            <span className="font-mono font-bold text-gray-800">
              {orderDetails.orderId ||
                "Processing..."}
            </span>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={downloadInvoicePdf}
              disabled={isGeneratingPdf}
              className="inline-flex items-center gap-2 bg-primary hover:bg-secondary text-white font-medium px-6 py-2.5 transition-colors shadow-sm disabled:opacity-50 cursor-pointer rounded-tl-2xl"
            >
              <Download className="w-4 h-4" />

              {isGeneratingPdf
                ? "Generating PDF..."
                : "Download Invoice"}
            </button>
            <Link
              href={`/order/ordertrack?orderId=${encodeURIComponent(
                orderDetails.orderId
              )}`}
              className="inline-flex items-center gap-2 bg-secondary hover:bg-slate-800 text-white font-medium px-6 py-2.5 transition-colors shadow-sm rounded-br-2xl"
            >
              <Package className="w-4 h-4" />
              Track My Order
            </Link>

            <Link
              href="/"
              className="inline-flex items-center gap-2 text-white bg-black hover:bg-secondary font-medium px-6 py-2.5 rounded-br-3xl rounded-tl-2xl border border-gray-300 transition-colors "
            >
              <Home className="w-4 h-4" />
              Back to Home
            </Link>
          </div>
        </div>
 
        <div className="bg-white rounded-bl-4xl rounded-tr-4xl shadow border border-gray-100 p-6 sm:p-8 mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
            <Package className="w-5 h-5 text-amber-700" />
            Order Summary
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 text-sm">
            {/* CUSTOMER */}

            <div>
              <p className="text-gray-500 font-medium">
                Customer Information:
              </p>

              <p className="text-gray-800 font-semibold mt-1">
                {orderDetails.name}
              </p>

              <p className="text-gray-600 flex items-center gap-1 mt-0.5">
                <Phone className="w-3.5 h-3.5" />
                {orderDetails.phone}
              </p>
            </div>

            {/* ADDRESS */}

            <div>
              <p className="text-gray-500 font-medium">
                Shipping Address:
              </p>

              <p className="text-gray-800 flex items-start gap-1 mt-1">
                <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />

                <span>
                  {orderDetails.address}
                </span>
              </p>
            </div>
          </div>

          {/* ==========================================
              PRODUCT LIST
          ========================================== */}

          <div className="border-t border-gray-100 pt-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">
              Ordered Items:
            </h4>

            <div className="space-y-4">
              {orderDetails.cart.map(
                (item, idx) => (
                  <div
                    key={
                      item.cartItemId ||
                      idx
                    }
                    className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-sm py-3 border-b border-gray-100 gap-4"
                  >
                    {/* PRODUCT INFO */}

                    <div className="flex items-start gap-3">
                      {/* IMAGE */}

                      <div className="w-14 h-14 bg-gray-100 border border-gray-200 rounded-lg overflow-hidden relative shrink-0">
                        <Image
                          src={
                            item.thumbnail ||
                            "/placeholder.png"
                          }
                          alt={
                            item.title ||
                            "Product"
                          }
                          fill
                          className="object-cover"
                        />
                      </div>

                      {/* DETAILS */}

                      <div>
                        <p className="text-gray-900 font-semibold">
                          {item.title}
                        </p>

                        <p className="text-xs text-gray-500">
                          Qty:{" "}
                          {item.quantity || 1}
                          {" | "}
                          Price: ৳
                          {item.price} each
                        </p>

                        {/* COLOR + SIZE */}

                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {item.selectedColor && (
                            <span className="bg-gray-100 text-gray-800 text-[10px] px-1.5 py-0.5 rounded border border-gray-200 font-medium">
                              Color:{" "}
                              {item.selectedColor}
                            </span>
                          )}

                          {item.selectedSize && (
                            <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.5 rounded font-medium">
                              Size:{" "}
                              {item.selectedSize}
                            </span>
                          )}
                        </div>

                        {/* CUSTOMIZATION */}

                        {item.customization &&
                          (item.customization
                            .length ||
                            item.customization
                              .width ||
                            item.customization
                              .sleeve ||
                            item.customization
                              .instructions) && (
                            <div className="mt-1.5 text-xs bg-amber-50 text-amber-900 p-2 rounded border border-amber-200 space-y-0.5">
                              <p className="font-bold">
                                Customization:
                              </p>

                              {item.customization
                                .length && (
                                  <p>
                                    Length:{" "}
                                    {
                                      item
                                        .customization
                                        .length
                                    }
                                    "
                                  </p>
                                )}

                              {item.customization
                                .width && (
                                  <p>
                                    Width:{" "}
                                    {
                                      item
                                        .customization
                                        .width
                                    }
                                    "
                                  </p>
                                )}

                              {item.customization
                                .sleeve && (
                                  <p>
                                    Sleeve:{" "}
                                    {
                                      item
                                        .customization
                                        .sleeve
                                    }
                                    "
                                  </p>
                                )}

                              {item.customization
                                .instructions && (
                                  <p className="italic">
                                    Note:{" "}
                                    {
                                      item
                                        .customization
                                        .instructions
                                    }
                                  </p>
                                )}
                            </div>
                          )}

                        {/* PRODUCT NOTE */}

                        {item.productNote && (
                          <p className="text-xs italic text-indigo-600 mt-1">
                            Note:{" "}
                            {item.productNote}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* ITEM TOTAL */}

                    <span className="text-gray-900 font-semibold self-end sm:self-center">
                      ৳
                      {(
                        Number(
                          item.price || 0
                        ) *
                        (Number(
                          item.quantity
                        ) || 1)
                      ).toFixed(2)}
                    </span>
                  </div>
                )
              )}
            </div>

            {/* ==========================================
                TOTALS
            ========================================== */}

            <div className="mt-6 space-y-2 text-sm border-t border-gray-100 pt-4">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>

                <span>
                  ৳
                  {subtotalAmount.toFixed(
                    2
                  )}
                </span>
              </div>

              <div className="flex justify-between text-gray-600">
                <span>Shipping Cost</span>

                <span>
                  ৳
                  {Number(
                    orderDetails.shippingCost ||
                    0
                  ).toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-200">
                <span>Total Amount</span>

                <span className="text-amber-700">
                  ৳
                  {Number(
                    orderDetails.total || 0
                  ).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            top: "-9999px",
            left: "-9999px",
          }}
        >
          <div
            ref={invoiceRef}
            style={{
              width: "800px",
              padding: "40px",
              background: "#ffffff",
              color: "#333333",
              fontFamily:
                "Arial, sans-serif",
            }}
          >
            {/* INVOICE HEADER */}

            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                borderBottom:
                  "2px solid #b45309",
                paddingBottom: "20px",
                marginBottom: "20px",
              }}
            >
              <div>
                <h1
                  style={{
                    fontSize: "26px",
                    color: "#b45309",
                    margin:
                      "0 0 5px 0",
                    fontWeight: "bold",
                  }}
                >
                  Afis Creation
                </h1>

                <p
                  style={{
                    margin: "0",
                    fontSize: "12px",
                    color: "#666",
                  }}
                >
                  Elegance in Every Stitch
                </p>

                <p
                  style={{
                    margin:
                      "5px 0 0 0",
                    fontSize: "12px",
                    color: "#666",
                  }}
                >
                  Email:{" "}
                  support@afiscreation.com
                </p>
              </div>

              <div
                style={{
                  textAlign: "right",
                }}
              >
                <h2
                  style={{
                    fontSize: "22px",
                    margin:
                      "0 0 5px 0",
                    color: "#333",
                  }}
                >
                  INVOICE
                </h2>

                <p
                  style={{
                    margin: "0",
                    fontSize: "14px",
                    fontWeight: "bold",
                    color: "#b45309",
                  }}
                >
                  Order ID:{" "}
                  {orderDetails.orderId}
                </p>

                <p
                  style={{
                    margin:
                      "5px 0 0 0",
                    fontSize: "12px",
                    color: "#666",
                  }}
                >
                  Date:{" "}
                  {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* BILLING INFO */}

            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                marginBottom: "30px",
                fontSize: "14px",
              }}
            >
              <div>
                <h4
                  style={{
                    margin:
                      "0 0 5px 0",
                    color: "#b45309",
                  }}
                >
                  Billed To:
                </h4>

                <p
                  style={{
                    margin:
                      "0 0 3px 0",
                    fontWeight: "bold",
                  }}
                >
                  {orderDetails.name}
                </p>

                <p
                  style={{
                    margin:
                      "0 0 3px 0",
                  }}
                >
                  Phone:{" "}
                  {orderDetails.phone}
                </p>

                <p
                  style={{
                    margin: "0",
                  }}
                >
                  Address:{" "}
                  {orderDetails.address}
                </p>
              </div>

              <div
                style={{
                  textAlign: "right",
                }}
              >
                <h4
                  style={{
                    margin:
                      "0 0 5px 0",
                    color: "#b45309",
                  }}
                >
                  Payment Method:
                </h4>

                <p
                  style={{
                    margin: "0",
                  }}
                >
                  Cash on Delivery (COD)
                </p>
              </div>
            </div>

            {/* INVOICE TABLE */}

            <table
              style={{
                width: "100%",
                borderCollapse:
                  "collapse",
                marginBottom: "30px",
                fontSize: "13px",
              }}
            >
              <thead>
                <tr
                  style={{
                    background:
                      "#f8fafc",
                    borderBottom:
                      "1px solid #cbd5e1",
                  }}
                >
                  <th
                    style={{
                      padding: "10px",
                      textAlign: "left",
                    }}
                  >
                    Item Description
                  </th>

                  <th
                    style={{
                      padding: "10px",
                      textAlign:
                        "center",
                    }}
                  >
                    Qty
                  </th>

                  <th
                    style={{
                      padding: "10px",
                      textAlign:
                        "right",
                    }}
                  >
                    Price
                  </th>

                  <th
                    style={{
                      padding: "10px",
                      textAlign:
                        "right",
                    }}
                  >
                    Total
                  </th>
                </tr>
              </thead>

              <tbody>
                {orderDetails.cart.map(
                  (item, idx) => (
                    <tr
                      key={
                        item.cartItemId ||
                        idx
                      }
                      style={{
                        borderBottom:
                          "1px solid #e2e8f0",
                      }}
                    >
                      <td
                        style={{
                          padding:
                            "12px 10px",
                        }}
                      >
                        <div
                          style={{
                            fontWeight:
                              "bold",
                          }}
                        >
                          {item.title}
                        </div>

                        <div
                          style={{
                            fontSize:
                              "11px",
                            color:
                              "#666",
                            marginTop:
                              "2px",
                          }}
                        >
                          {item.selectedColor &&
                            `Color: ${item.selectedColor} | `}

                          {item.selectedSize &&
                            `Size: ${item.selectedSize}`}
                        </div>

                        {item.customization && (
                          <div
                            style={{
                              fontSize:
                                "11px",
                              color:
                                "#b45309",
                              marginTop:
                                "2px",
                            }}
                          >
                            {item.customization
                              .length &&
                              `Length: ${item.customization.length}" `}

                            {item.customization
                              .width &&
                              `Width: ${item.customization.width}" `}

                            {item.customization
                              .sleeve &&
                              `Sleeve: ${item.customization.sleeve}"`}

                            {item.customization
                              .instructions && (
                                <div
                                  style={{
                                    fontStyle:
                                      "italic",
                                  }}
                                >
                                  Note:{" "}
                                  {
                                    item
                                      .customization
                                      .instructions
                                  }
                                </div>
                              )}
                          </div>
                        )}
                      </td>

                      <td
                        style={{
                          padding:
                            "12px 10px",
                          textAlign:
                            "center",
                        }}
                      >
                        {item.quantity ||
                          1}
                      </td>

                      <td
                        style={{
                          padding:
                            "12px 10px",
                          textAlign:
                            "right",
                        }}
                      >
                        ৳{item.price}
                      </td>

                      <td
                        style={{
                          padding:
                            "12px 10px",
                          textAlign:
                            "right",
                          fontWeight:
                            "bold",
                        }}
                      >
                        ৳
                        {(
                          Number(
                            item.price ||
                            0
                          ) *
                          (Number(
                            item.quantity
                          ) || 1)
                        ).toFixed(2)}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>

            {/* INVOICE TOTAL */}

            <div
              style={{
                display: "flex",
                justifyContent:
                  "flex-end",
              }}
            >
              <div
                style={{
                  width: "250px",
                  fontSize: "14px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    padding: "6px 0",
                    borderBottom:
                      "1px solid #e2e8f0",
                  }}
                >
                  <span>Subtotal:</span>

                  <span>
                    ৳
                    {subtotalAmount.toFixed(
                      2
                    )}
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    padding: "6px 0",
                    borderBottom:
                      "1px solid #e2e8f0",
                  }}
                >
                  <span>Shipping:</span>

                  <span>
                    ৳
                    {Number(
                      orderDetails.shippingCost ||
                      0
                    ).toFixed(2)}
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    padding: "10px 0",
                    fontWeight:
                      "bold",
                    fontSize: "16px",
                    color: "#b45309",
                  }}
                >
                  <span>Total:</span>

                  <span>
                    ৳
                    {Number(
                      orderDetails.total ||
                      0
                    ).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* FOOTER */}

            <div
              style={{
                marginTop: "50px",
                textAlign: "center",
                fontSize: "11px",
                color: "#888",
                borderTop:
                  "1px solid #e2e8f0",
                paddingTop: "15px",
              }}
            >
              <p
                style={{
                  margin: "0",
                }}
              >
                Thank you for your purchase
                with Afis Creation! For any
                query, contact us at
                support@afiscreation.com
              </p>
            </div>
          </div>
        </div>

        {/* END HIDDEN INVOICE */}
      </div>
    </div>
  );
}

export default function ThankYouPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <ThankYouContent />
    </Suspense>
  );
}