import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Image as ImageIcon, Loader2, X } from "lucide-react";
import { deleteCartItem, getCart, updateCartQuantity } from "./cart.api";
import { Page } from "../../shared/RentEasyLayout";
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
        const localItems = getLocalCart(email);
        const nextItems = Array.isArray(data) && data.length > 0 ? data : localItems;
        if (isMounted) setItems(nextItems);
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
    <Page cartCount={items.reduce((sum, item) => sum + Number(item.quantity || 0), 0)}>
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 rounded-lg border border-[#D0BCA0] bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 text-sm font-black uppercase tracking-wide text-[#2F6F62]">Rental Cart</p>
              <h1 className="text-3xl font-black tracking-tight text-[#4A3428]">Shopping Cart</h1>
            </div>
            {items.length > 0 && (
              <span className="w-fit rounded-full bg-[#FDFBF9] px-4 py-2 text-sm font-black text-[#8C6A48] ring-1 ring-[#D0BCA0]">
                {items.length} item{items.length === 1 ? "" : "s"}
              </span>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20 text-[#8C6A48]">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="flex w-full max-w-xl flex-col items-center gap-6 rounded-lg border border-[#D0BCA0] bg-white p-12 text-center shadow-sm">
              <h1 className="text-3xl font-black text-[#4A3428]">Cart Empty</h1>
              <p className="text-sm font-bold text-[#8C6A48]">No items in cart</p>
              <button
                type="button"
                onClick={() => navigate("/home")}
                className="rounded-lg bg-[#4A3428] px-8 py-3 font-black text-white hover:bg-[#3E2B22]"
              >
                Browse Products
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              {items.map((item) => (
                <article key={item.id} className="rent-card-motion flex gap-6 rounded-lg border border-[#D0BCA0] bg-white p-4 shadow-sm">
                  <div className="h-32 w-32 flex-shrink-0 overflow-hidden rounded-lg bg-[#F5F2F0] ring-1 ring-[#D0BCA0]">
                    {item.product?.imageUrl ? (
                      <img src={item.product.imageUrl} className="h-full w-full object-cover" alt={item.product.name} />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[#8C6A48] opacity-40">
                        <ImageIcon />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="mb-2 font-black text-[#4A3428]">{item.product?.name}</h3>
                    <p className="mb-4 text-sm font-bold text-[#8C6A48]">{formatCurrency(item.product?.price)} / day</p>
                    <div className="inline-flex items-center overflow-hidden rounded-lg border border-[#D0BCA0] bg-[#FDFBF9]">
                      <button type="button" className="h-9 w-10 font-bold hover:bg-white" onClick={() => updateQty(item.id, item.quantity - 1)}>
                        -
                      </button>
                      <span className="min-w-10 text-center text-sm font-black">{item.quantity}</span>
                      <button type="button" className="h-9 w-10 font-bold hover:bg-white" onClick={() => updateQty(item.id, item.quantity + 1)}>
                        +
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="self-start rounded-lg p-2 text-red-600 hover:bg-red-50"
                    title="Remove item"
                  >
                    <X size={20} />
                  </button>
                </article>
              ))}
            </div>

            <aside className="h-fit rounded-lg border border-[#D0BCA0] bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-lg font-black text-[#4A3428]">Order Summary</h2>
              <Row label="Subtotal" value={formatCurrency(subtotal)} />
              <Row label="Service Fee" value={formatCurrency(serviceFee)} />
              <div className="mb-8 mt-4 flex justify-between border-t border-[#D0BCA0] pt-4">
                <span className="text-xl font-black text-[#4A3428]">Total</span>
                <span className="text-xl font-black text-[#4A3428]">{formatCurrency(total)}</span>
              </div>
              <button
                type="button"
                onClick={() => navigate("/checkout", { state: { items } })}
                className="h-12 w-full rounded-lg bg-[#4A3428] font-black uppercase tracking-wide text-white hover:bg-[#3E2B22]"
              >
                Proceed to Checkout
              </button>
            </aside>
          </div>
        )}
      </section>
    </Page>
  );
}

function Row({ label, value }) {
  return (
    <div className="mb-3 flex justify-between text-sm text-[#8C6A48]">
      <span>{label}</span>
      <span className="font-black text-[#4A3428]">{value}</span>
    </div>
  );
}
