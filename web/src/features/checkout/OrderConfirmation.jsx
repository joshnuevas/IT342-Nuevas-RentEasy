import { Link, useLocation } from "react-router-dom";
import { useEffect, useMemo } from "react";
import { CheckCircle2 } from "lucide-react";
import { Page } from "../../shared/RentEasyLayout";
import { cartItemDays, formatCurrency, getStoredOrders, updateStoredOrder } from "../../shared/rentEasyData";
import { updateOrderStatus } from "./payments.api";
import { updateProductStatus } from "../listings/listings.api";

export default function OrderConfirmation() {
  const { state, search } = useLocation();
  const params = useMemo(() => new URLSearchParams(search), [search]);
  const paymentStatus = params.get("payment");
  const paymentReference = params.get("reference");
  const storedOrder = state?.order || findStoredOrder(paymentReference) || getStoredOrders()[0] || null;
  const isPayMongoSuccess = paymentStatus === "success";
  const order = useMemo(() => {
    if (!isPayMongoSuccess || !storedOrder) return storedOrder;
    return {
      ...storedOrder,
      status: "Paid",
      paymentStatus: "PAID",
      paidAt: storedOrder.paidAt || new Date().toISOString(),
    };
  }, [isPayMongoSuccess, storedOrder]);

  useEffect(() => {
    if (!isPayMongoSuccess || !order) return;
    updateStoredOrder(order.paymongoReferenceNumber || order.orderNumber, order);
    updateOrderStatus(order.paymongoReferenceNumber || order.orderNumber, "Paid via PayMongo");
    markProductsRented(order);
  }, [isPayMongoSuccess, order]);

  return (
    <Page>
      <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-[#D0BCA0] bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-lg bg-[#FDFBF9] text-[#4A3428] ring-1 ring-[#D0BCA0]">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h1 className="text-3xl font-black text-[#4A3428]">
            {isPayMongoSuccess ? "Payment Received" : "Order Confirmed"}
          </h1>

          {order ? (
            <div className="mx-auto mt-8 max-w-lg rounded-lg border border-[#D0BCA0] bg-[#FDFBF9] p-5 text-left">
            <div className="mb-4 border-b border-[#D0BCA0] pb-3 font-black text-[#4A3428]">{order.orderNumber}</div>
            {order.paymentProvider && (
              <div className="mb-4 rounded-lg bg-white px-3 py-2 text-sm font-bold text-[#8C6A48] ring-1 ring-[#D0BCA0]">
                Payment: {order.paymentProvider} - {isPayMongoSuccess ? "PAID" : order.paymentStatus || "PENDING"}
              </div>
            )}
            <div className="space-y-3">
              {order.items?.map((item) => (
                <div key={item.product?.productId || item.name} className="flex justify-between gap-4 text-sm">
                  <span>
                    {item.product?.name || item.name} - {cartItemDays(item)} day{cartItemDays(item) === 1 ? "" : "s"}
                  </span>
                  <span className="font-bold">
                    {formatCurrency((item.product?.price || item.price) * cartItemDays(item))}
                  </span>
                </div>
              ))}
              <div className="border-t border-[#D0BCA0] pt-3 text-right text-lg font-black text-[#4A3428]">
                Total {formatCurrency(order.total)}
              </div>
            </div>
          </div>
          ) : (
            <div className="mx-auto mt-8 max-w-lg rounded-lg border border-dashed border-[#D0BCA0] bg-[#FDFBF9] p-5 text-center text-sm font-bold text-[#8C6A48]">
              No order record found.
            </div>
          )}

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/home" className="rounded-lg bg-[#4A3428] px-5 py-3 font-black text-white hover:bg-[#3E2B22]">
              Back to Catalog
            </Link>
            <Link to="/profile" className="rounded-lg border border-[#D0BCA0] px-5 py-3 font-black text-[#4A3428] hover:border-[#4A3428] hover:bg-[#FDFBF9]">
              View Profile
            </Link>
          </div>
        </div>
      </section>
    </Page>
  );
}

function findStoredOrder(reference) {
  if (!reference) return null;
  return getStoredOrders().find(
    (order) => order.orderNumber === reference || order.paymongoReferenceNumber === reference
  ) || null;
}

async function markProductsRented(order) {
  const token = localStorage.getItem("token");
  if (!token) return;

  const productIds = (order.items || [])
    .map((item) => item.product?.productId || item.productId)
    .filter(Boolean);

  await Promise.allSettled(
    [...new Set(productIds)].map((productId) => updateProductStatus(productId, "RENTED", token))
  );
}

