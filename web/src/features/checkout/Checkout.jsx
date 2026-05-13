import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CreditCard, MapPin, PackageCheck } from "lucide-react";
import { Page } from "../../shared/RentEasyLayout";
import {
  calculateCartTotal,
  clearLocalCart,
  currentUserEmail,
  formatCurrency,
  getLocalCart,
  saveOrder,
} from "../../shared/rentEasyData";

export default function Checkout() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const email = currentUserEmail();
  const items = state?.items?.length ? state.items : getLocalCart(email);
  const subtotal = calculateCartTotal(items);
  const serviceFee = items.length > 0 ? Math.round(subtotal * 0.05) : 0;
  const total = subtotal + serviceFee;
  const [shipping, setShipping] = useState({
    name: "Josh Anton Nuevas",
    email,
    phone: "",
    address: "",
    city: "Cebu City",
    zip: "",
  });
  const isReady = useMemo(() => Object.values(shipping).every(Boolean), [shipping]);

  const handleChange = (event) => {
    setShipping((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const order = saveOrder({ items, shipping, subtotal, serviceFee, total });
    clearLocalCart(email);
    navigate("/order-confirmation", { state: { order } });
  };

  return (
    <Page>
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-7 rounded-lg bg-white p-6 shadow-sm ring-1 ring-stone-200">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#d5673f]">Payment process</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-stone-950">Checkout and delivery details</h1>
        </div>

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
                <CreditCard className="h-5 w-5 text-[#d5673f]" />
                Payment method
              </h3>
              <p className="text-sm leading-6 text-stone-600">
                This SDD version excludes real payment gateway integration, so checkout records the order and prepares a confirmation screen.
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
              disabled={!isReady || items.length === 0}
              className="mt-6 h-12 w-full rounded-lg bg-[#2f513f] font-black text-white transition hover:bg-[#244232] disabled:bg-stone-300"
            >
              Place order
            </button>
          </aside>
        </form>
      </section>
    </Page>
  );
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
