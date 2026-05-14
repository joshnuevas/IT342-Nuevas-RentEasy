import { Link, useLocation } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { Page } from "../../shared/RentEasyLayout";
import { demoOrders, formatCurrency, getStoredOrders } from "../../shared/rentEasyData";

export default function OrderConfirmation() {
  const { state, search } = useLocation();
  const paymentStatus = new URLSearchParams(search).get("payment");
  const order = state?.order || getStoredOrders()[0] || demoOrders[0];
  const isPayMongoSuccess = paymentStatus === "success";

  return (
    <Page>
      <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-[#D0BCA0] bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-lg bg-[#FDFBF9] text-[#4A3428] ring-1 ring-[#D0BCA0]">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-[#4A3428]">
            {isPayMongoSuccess ? "Payment Received" : "Order Confirmed"}
          </h1>

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
                  <span>{item.product?.name || item.name} x {item.quantity}</span>
                  <span className="font-bold">{formatCurrency((item.product?.price || item.price) * item.quantity)}</span>
                </div>
              ))}
              <div className="border-t border-[#D0BCA0] pt-3 text-right text-lg font-black text-[#4A3428]">
                Total {formatCurrency(order.total)}
              </div>
            </div>
          </div>

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
