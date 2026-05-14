import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AlertCircle, Loader2 } from "lucide-react";
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
      if (!response.ok) throw new Error(await readPaymentError(response));

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
        <div className="mb-8 rounded-lg border border-[#D0BCA0] bg-white p-6 shadow-sm">
          <p className="mb-2 text-sm font-black uppercase tracking-wide text-[#2F6F62]">Payment</p>
          <h1 className="text-3xl font-black tracking-tight text-[#4A3428]">Checkout</h1>
        </div>

        {paymentStatus === "cancelled" && (
          <Message tone="warning">PayMongo checkout was cancelled. Review the details and try again.</Message>
        )}

        {paymentError && <Message tone="error">{paymentError}</Message>}

        {items.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[#D0BCA0] bg-white p-16 text-center">
            <p className="mb-5 font-bold text-[#8C6A48]">No items in checkout</p>
            <button
              type="button"
              onClick={() => navigate("/home")}
              className="rounded-lg bg-[#4A3428] px-8 py-3 font-black text-white hover:bg-[#3E2B22]"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[1fr_360px]">
            <section className="rounded-lg border border-[#D0BCA0] bg-white p-6 shadow-sm sm:p-8">
              <h2 className="mb-6 text-lg font-black text-[#4A3428]">Shipping Details</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Full Name" name="name" value={shipping.name} onChange={handleChange} />
                <Input label="Email" name="email" type="email" value={shipping.email} onChange={handleChange} />
                <Input label="Phone" name="phone" value={shipping.phone} onChange={handleChange} />
                <Input label="City" name="city" value={shipping.city} onChange={handleChange} />
                <label className="block sm:col-span-2">
                  <span className="mb-2 block text-sm font-bold text-[#4A3428]">Complete Address</span>
                  <input
                    name="address"
                    value={shipping.address}
                    onChange={handleChange}
                    required
                    className="h-12 w-full rounded-lg border border-[#D0BCA0] bg-[#FDFBF9] px-4 text-sm outline-none focus:border-[#4A3428] focus:bg-white focus:ring-4 focus:ring-[#D0BCA0]/35"
                  />
                </label>
                <Input label="ZIP Code" name="zip" value={shipping.zip} onChange={handleChange} />
              </div>
            </section>

            <aside className="h-fit rounded-lg border border-[#D0BCA0] bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-lg font-black text-[#4A3428]">Order Summary</h2>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between gap-3 border-b border-[#D0BCA0] pb-3 text-sm">
                    <span className="font-bold text-[#4A3428]">{item.product?.name} x {item.quantity}</span>
                    <span>{formatCurrency((item.product?.price || 0) * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="mt-5 space-y-2 text-sm">
                <Row label="Subtotal" value={formatCurrency(subtotal)} />
                <Row label="Service Fee" value={formatCurrency(serviceFee)} />
                <div className="flex justify-between border-t border-[#D0BCA0] pt-4 text-lg font-black text-[#4A3428]">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={!isReady || isPaying}
                className="mt-6 flex h-12 w-full items-center justify-center rounded-lg bg-[#4A3428] font-black uppercase tracking-wide text-white hover:bg-[#3E2B22] disabled:opacity-60"
              >
                {isPaying ? <Loader2 className="h-5 w-5 animate-spin" /> : "Pay with PayMongo"}
              </button>
            </aside>
          </form>
        )}
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

function Message({ tone, children }) {
  const className =
    tone === "error"
      ? "border-red-200 bg-red-50 text-red-700"
      : "border-amber-200 bg-amber-50 text-amber-900";

  return (
    <div className={`mb-6 flex items-center gap-3 rounded-lg border p-4 text-sm font-bold ${className}`}>
      <AlertCircle className="h-5 w-5 shrink-0" />
      <span>{children}</span>
    </div>
  );
}

function Input({ label, ...props }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-[#4A3428]">{label}</span>
      <input
        {...props}
        required
        className="h-12 w-full rounded-lg border border-[#D0BCA0] bg-[#FDFBF9] px-4 text-sm outline-none focus:border-[#4A3428] focus:bg-white focus:ring-4 focus:ring-[#D0BCA0]/35"
      />
    </label>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between text-[#8C6A48]">
      <span>{label}</span>
      <span className="font-bold text-[#4A3428]">{value}</span>
    </div>
  );
}
