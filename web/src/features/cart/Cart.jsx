import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Minus, PackageOpen, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { deleteCartItem, getCart, updateCartQuantity } from "./cart.api";
import { Page, EmptyState } from "../../shared/RentEasyLayout";
import {
  calculateCartTotal,
  currentUserEmail,
  formatCurrency,
  getLocalCart,
  removeLocalCartItem,
  updateLocalCartQuantity,
} from "../../shared/rentEasyData";

export default function Cart() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const email = currentUserEmail();
  const token = localStorage.getItem("token");
  const subtotal = calculateCartTotal(items);
  const serviceFee = items.length > 0 ? Math.round(subtotal * 0.05) : 0;
  const total = subtotal + serviceFee;

  useEffect(() => {
    let isMounted = true;
    const loadCart = async () => {
      try {
        const response = await getCart(email, token);
        const data = response.ok ? await response.json() : [];
        const local = getLocalCart(email);
        if (isMounted) setItems(Array.isArray(data) && data.length > 0 ? data : local);
      } catch {
        if (isMounted) setItems(getLocalCart(email));
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    loadCart();
    return () => {
      isMounted = false;
    };
  }, [email, token]);

  const updateQty = async (id, quantity) => {
    if (quantity < 1) return;
    try {
      await updateCartQuantity(id, quantity, token);
    } catch {
      updateLocalCartQuantity(id, quantity, email);
    }
    setItems((prev) => prev.map((item) => (String(item.id) === String(id) ? { ...item, quantity } : item)));
  };

  const removeItem = async (id) => {
    try {
      await deleteCartItem(id, token);
    } catch {
      removeLocalCartItem(id, email);
    }
    setItems((prev) => prev.filter((item) => String(item.id) !== String(id)));
  };

  return (
    <Page cartCount={items.reduce((sum, item) => sum + item.quantity, 0)}>
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-7 rounded-lg bg-white p-6 shadow-sm ring-1 ring-stone-200">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#d5673f]">Shopping cart</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-stone-950">Review your rental cart</h1>
        </div>

        {isLoading ? (
          <div className="min-h-64 rounded-lg bg-white" />
        ) : items.length === 0 ? (
          <EmptyState
            icon={PackageOpen}
            title="Your cart is empty"
            description="Browse the catalog and add rental items before checkout."
            action={<Link to="/home" className="rounded-lg bg-[#2f513f] px-5 py-3 font-black text-white">Browse products</Link>}
          />
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="space-y-4">
              {items.map((item) => (
                <article key={item.id} className="grid overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm sm:grid-cols-[160px_1fr_auto]">
                  <img src={item.product.imageUrl} alt={item.product.name} className="h-44 w-full object-cover sm:h-full" />
                  <div className="p-5">
                    <p className="text-xs font-black uppercase tracking-wide text-[#2f513f]">{item.product.category}</p>
                    <h2 className="mt-2 text-xl font-black text-stone-950">{item.product.name}</h2>
                    <p className="mt-1 text-sm text-stone-500">{formatCurrency(item.product.price)} per day</p>
                    <div className="mt-5 inline-flex items-center overflow-hidden rounded-full border border-stone-200 bg-stone-50">
                      <button type="button" onClick={() => updateQty(item.id, item.quantity - 1)} className="grid h-9 w-10 place-items-center hover:bg-white">
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="min-w-10 text-center text-sm font-black">{item.quantity}</span>
                      <button type="button" onClick={() => updateQty(item.id, item.quantity + 1)} className="grid h-9 w-10 place-items-center hover:bg-white">
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-4 border-t border-stone-200 bg-stone-50 p-5 sm:flex-col sm:items-end sm:border-l sm:border-t-0">
                    <p className="text-lg font-black text-stone-950">{formatCurrency(item.product.price * item.quantity)}</p>
                    <button type="button" onClick={() => removeItem(item.id)} className="rounded-full p-2 text-red-500 hover:bg-red-50" title="Remove item">
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </article>
              ))}
            </div>

            <aside className="h-fit rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
              <h2 className="flex items-center gap-2 text-lg font-black text-stone-950">
                <ShoppingBag className="h-5 w-5 text-[#d5673f]" />
                Order summary
              </h2>
              <div className="mt-6 space-y-3 text-sm">
                <Row label="Subtotal" value={formatCurrency(subtotal)} />
                <Row label="Service fee" value={formatCurrency(serviceFee)} />
                <div className="border-t border-stone-200 pt-4">
                  <Row label="Total" value={formatCurrency(total)} strong />
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate("/checkout", { state: { items } })}
                className="mt-6 h-12 w-full rounded-lg bg-[#2f513f] font-black text-white transition hover:bg-[#244232]"
              >
                Continue to checkout
              </button>
              <Link to="/home" className="mt-3 flex h-12 items-center justify-center rounded-lg border border-stone-200 font-black text-stone-700 hover:border-[#2f513f] hover:text-[#2f513f]">
                Continue shopping
              </Link>
            </aside>
          </div>
        )}
      </section>
    </Page>
  );
}

function Row({ label, value, strong }) {
  return (
    <div className={`flex items-center justify-between ${strong ? "text-lg font-black text-stone-950" : "text-stone-600"}`}>
      <span>{label}</span>
      <span className="font-black text-stone-950">{value}</span>
    </div>
  );
}
