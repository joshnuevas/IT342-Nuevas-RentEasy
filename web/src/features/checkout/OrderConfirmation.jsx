import { Link, useLocation } from "react-router-dom";
import { CheckCircle2, Home, PackageCheck } from "lucide-react";
import { Page } from "../../shared/RentEasyLayout";
import { demoOrders, formatCurrency, getStoredOrders } from "../../shared/rentEasyData";

export default function OrderConfirmation() {
  const { state, search } = useLocation();
  const paymentStatus = new URLSearchParams(search).get("payment");
  const order = state?.order || getStoredOrders()[0] || demoOrders[0];
  const isPayMongoSuccess = paymentStatus === "success" || order.paymentProvider === "PayMongo";

  return (
    <Page>
      <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-[#D0BCA0] bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-5 grid h-20 w-20 place-items-center rounded-full bg-[#FDFBF9] text-[#4A3428]">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#8C6A48]">Order confirmed</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-[#4A3428]">
            {isPayMongoSuccess ? "PayMongo payment received" : "Thanks for your rental order"}
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#8C6A48]">
            {isPayMongoSuccess
              ? "Your order was returned from PayMongo and is ready for processing."
              : "Your order is now marked as processing. This confirmation screen follows the SDD payment confirmation wireframe."}
          </p>

          <div className="mx-auto mt-8 max-w-lg rounded-lg bg-[#FDFBF9] p-5 text-left">
            <div className="mb-4 flex items-center gap-2 font-black text-[#4A3428]">
              <PackageCheck className="h-5 w-5 text-[#8C6A48]" />
              {order.orderNumber}
            </div>
            {order.paymentProvider && (
              <div className="mb-4 rounded-lg bg-white px-3 py-2 text-sm font-bold text-[#8C6A48]">
                Payment: {order.paymentProvider} - {isPayMongoSuccess ? "Submitted" : order.paymentStatus || "Pending"}
              </div>
            )}
            <div className="space-y-3">
              {order.items?.map((item) => (
                <div key={item.product?.productId || item.name} className="flex justify-between text-sm">
                  <span>{item.product?.name || item.name} x {item.quantity}</span>
                  <span className="font-black">{formatCurrency((item.product?.price || item.price) * item.quantity)}</span>
                </div>
              ))}
              <div className="border-t border-[#D0BCA0] pt-3 text-right text-lg font-black text-[#4A3428]">
                Total {formatCurrency(order.total)}
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/home" className="inline-flex h-12 items-center gap-2 rounded-lg bg-[#4A3428] px-5 font-black text-white">
              <Home className="h-5 w-5" />
              Back to catalog
            </Link>
            <Link to="/profile" className="inline-flex h-12 items-center rounded-lg border border-[#D0BCA0] px-5 font-black text-[#4A3428] hover:border-[#4A3428] hover:text-[#4A3428]">
              View profile
            </Link>
          </div>
        </div>
      </section>
    </Page>
  );
}
