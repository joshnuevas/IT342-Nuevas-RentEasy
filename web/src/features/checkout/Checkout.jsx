import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AlertCircle, CreditCard, Loader2, MapPin, PackageCheck, ShieldCheck } from "lucide-react";
import { Page } from "../../shared/RentEasyLayout";
import {
  calculateCartTotal,
  clearLocalCart,
  currentUserEmail,
  formatCurrency,
  getLocalCart,
  getProfile,
  saveOrder,
} from "../../shared/rentEasyData";
import { createPayMongoCheckout } from "./payments.api";

export default function Checkout() {
  const navigate = useNavigate();
  const { state, search } = useLocation();
  const paymentStatus = new URLSearchParams(search).get("payment");
  const email = currentUserEmail();
  const items = state?.items?.length ? state.items : getLocalCart(email);
  const subtotal = calculateCartTotal(items);
  const serviceFee = items.length > 0 ? Math.round(subtotal * 0.05) : 0;
  const total = subtotal + serviceFee;
  const profile = getProfile();
  const [shipping, setShipping] = useState({
    name: profile.name,
    email: profile.email || email,
    phone: profile.phone === "09XX XXX XXXX" ? "" : profile.phone,
    address: profile.address === "Cebu City" || profile.address === "RentEasy Admin Office" ? "" : profile.address,
    city: "Cebu City",
    zip: "",
  });
  const [isPaying, setIsPaying] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const isReady = useMemo(() => Object.values(shipping).every(Boolean), [shipping]);

  const handleChange = (event) => {
    setShipping((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setPaymentError("");
    setIsPaying(true);

    const orderNumber = `RE-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`;
    const payload = {
      orderNumber,
      shipping,
      subtotal,
      serviceFee,
      total,
      items: items.map((item) => ({
        productId: item.product?.productId,
        name: item.product?.name,
        description: item.product?.description,
        price: item.product?.price,
        quantity: item.quantity,
        imageUrl: item.product?.imageUrl,
      })),
    };

    try {
      const response = await createPayMongoCheckout(payload);
      if (!response.ok) {
        throw new Error(await readPaymentError(response));
      }

      const checkout = await response.json();
      const order = saveOrder({
        orderNumber,
        items,
        shipping,
        subtotal,
        serviceFee,
        total,
        status: "Awaiting PayMongo payment",
        paymentProvider: "PayMongo",
        paymentStatus: "PENDING",
        checkoutSessionId: checkout.sessionId,
        paymongoReferenceNumber: checkout.referenceNumber,
      });

      clearLocalCart(email);

      if (checkout.checkoutUrl) {
        window.location.href = checkout.checkoutUrl;
      } else {
        navigate("/order-confirmation", { state: { order } });
      }
    } catch (error) {
      setPaymentError(error.message || "PayMongo checkout could not be started.");
      setIsPaying(false);
    }
  };

  return (
    <Page>
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-7 rounded-lg bg-white p-6 shadow-sm ring-1 ring-stone-200">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#d5673f]">Payment process</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-stone-950">Checkout and delivery details</h1>
        </div>

        {paymentStatus === "cancelled" && (
          <div className="mb-5 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-900">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <span>Your PayMongo checkout was cancelled. You can review your details and try again.</span>
          </div>
        )}

        {paymentError && (
          <div className="mb-5 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <span>{paymentError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <section className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
            <h2 className="mb-5 flex items-center gap-2 text-lg font-black text-stone-950">
              <MapPin className="h-5 w-5 text-[#d5673f]" />
              Shipping information
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Full name" name="name" value={shipping.name} onChange={handleChange} />
              <Input label="Email" name="email" type="email" value={shipping.email} onChange={handleChange} />
              <Input label="Phone" name="phone" value={shipping.phone} onChange={handleChange} placeholder="09XX XXX XXXX" />
              <Input label="City" name="city" value={shipping.city} onChange={handleChange} />
              <label className="sm:col-span-2">
                <span className="mb-2 block text-sm font-bold text-stone-700">Complete address</span>
                <input
                  name="address"
                  value={shipping.address}
                  onChange={handleChange}
                  required
                  placeholder="House number, street, barangay"
                  className="h-12 w-full rounded-lg border border-stone-200 bg-stone-50 px-4 outline-none focus:border-[#2f513f] focus:ring-4 focus:ring-emerald-100"
                />
              </label>
              <Input label="ZIP code" name="zip" value={shipping.zip} onChange={handleChange} />
            </div>

            <div className="mt-7 rounded-lg bg-stone-50 p-5">
              <h3 className="mb-3 flex items-center gap-2 font-black text-stone-950">
                <ShieldCheck className="h-5 w-5 text-[#d5673f]" />
                PayMongo hosted checkout
              </h3>
              <p className="text-sm leading-6 text-stone-600">
                You will be redirected to PayMongo to complete payment using the enabled methods on your PayMongo account, such as card or GCash.
              </p>
            </div>
          </section>

          <aside className="h-fit rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
            <h2 className="mb-5 flex items-center gap-2 text-lg font-black text-stone-950">
              <PackageCheck className="h-5 w-5 text-[#d5673f]" />
              Order summary
            </h2>
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <img src={item.product.imageUrl} alt={item.product.name} className="h-16 w-16 rounded-lg object-cover" />
                  <div className="flex-1">
                    <p className="text-sm font-black text-stone-950">{item.product.name}</p>
                    <p className="text-xs text-stone-500">Qty {item.quantity}</p>
                  </div>
                  <p className="text-sm font-black">{formatCurrency(item.product.price * item.quantity)}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 space-y-3 border-t border-stone-200 pt-5 text-sm">
              <Row label="Subtotal" value={formatCurrency(subtotal)} />
              <Row label="Service fee" value={formatCurrency(serviceFee)} />
              <Row label="Total" value={formatCurrency(total)} strong />
            </div>
            <button
              type="submit"
              disabled={!isReady || items.length === 0 || isPaying}
              className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#2f513f] font-black text-white transition hover:bg-[#244232] disabled:bg-stone-300"
            >
              {isPaying ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Opening PayMongo...
                </>
              ) : (
                <>
                  <CreditCard className="h-5 w-5" />
                  Pay with PayMongo
                </>
              )}
            </button>
          </aside>
        </form>
      </section>
    </Page>
  );
}

async function readPaymentError(response) {
  if (response.status === 401 || response.status === 403) {
    return "Your login session is not valid for PayMongo checkout. Please log out, make sure the backend is running, then log in again.";
  }

  try {
    const data = await response.json();
    return data.detail || data.message || data.error || "PayMongo checkout could not be started.";
  } catch {
    return "PayMongo checkout could not be started.";
  }
}

function Input({ label, ...props }) {
  return (
    <label>
      <span className="mb-2 block text-sm font-bold text-stone-700">{label}</span>
      <input
        {...props}
        required
        className="h-12 w-full rounded-lg border border-stone-200 bg-stone-50 px-4 outline-none focus:border-[#2f513f] focus:ring-4 focus:ring-emerald-100"
      />
    </label>
  );
}

function Row({ label, value, strong }) {
  return (
    <div className={`flex justify-between ${strong ? "text-lg font-black text-stone-950" : "text-stone-600"}`}>
      <span>{label}</span>
      <span className="font-black text-stone-950">{value}</span>
    </div>
  );
}
