import { useState } from "react";
import { createElement } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, BadgeCheck, CalendarDays, PackageCheck, ShieldCheck, ShoppingCart } from "lucide-react";
import { addCartItem } from "../cart/cart.api";
import { Page } from "../../shared/RentEasyLayout";
import {
  addProductToLocalCart,
  currentUserEmail,
  findProductById,
  formatCurrency,
  normalizeProduct,
} from "../../shared/rentEasyData";

export default function ProductDetail() {
  const { productId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const [notice, setNotice] = useState("");
  const product = normalizeProduct(state?.product || findProductById(productId) || {});
  const email = currentUserEmail();
  const token = localStorage.getItem("token");

  const handleAdd = async () => {
    try {
      const response = await addCartItem(product.productId, email, token);
      if (!response.ok) throw new Error("API unavailable");
    } catch {
      addProductToLocalCart(product, email);
    }
    setNotice(`${product.name} added to cart.`);
  };

  return (
    <Page>
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-stone-600 shadow-sm ring-1 ring-stone-200 hover:text-[#2f513f]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        {notice && <div className="mb-5 rounded-lg bg-emerald-50 px-4 py-3 text-sm font-bold text-[#2f513f]">{notice}</div>}

        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-stone-200">
            <img src={product.imageUrl} alt={product.name} className="h-[520px] w-full object-cover" />
          </div>

          <div className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
            <p className="mb-3 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-black uppercase tracking-wide text-[#2f513f]">
              {product.category}
            </p>
            <h1 className="text-4xl font-black tracking-tight text-stone-950">{product.name}</h1>
            <p className="mt-4 text-base leading-7 text-stone-600">{product.description}</p>

            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              <DetailStat icon={CalendarDays} label="Rental" value="Daily" />
              <DetailStat icon={PackageCheck} label="Stock" value={`${product.stock} left`} />
              <DetailStat icon={ShieldCheck} label="Status" value="Verified" />
            </div>

            <div className="mt-8 rounded-lg bg-stone-50 p-5">
              <p className="text-sm font-bold uppercase tracking-wide text-stone-400">Rental price</p>
              <p className="mt-1 text-4xl font-black text-stone-950">{formatCurrency(product.price)}</p>
              <p className="text-sm font-semibold text-stone-500">per day, excluding delivery coordination</p>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-[1fr_auto]">
              <button
                type="button"
                onClick={handleAdd}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[#2f513f] px-6 font-black text-white transition hover:bg-[#244232]"
              >
                <ShoppingCart className="h-5 w-5" />
                Add to cart
              </button>
              <Link
                to="/cart"
                className="inline-flex h-12 items-center justify-center rounded-lg border border-stone-200 px-6 font-black text-stone-700 transition hover:border-[#2f513f] hover:text-[#2f513f]"
              >
                Go to cart
              </Link>
            </div>

            <div className="mt-8 border-t border-stone-200 pt-6">
              <p className="flex items-center gap-2 text-sm font-bold text-stone-600">
                <BadgeCheck className="h-4 w-4 text-[#2f513f]" />
                Listed by {product.owner?.firstName || "RentEasy"} {product.owner?.lastName || "Partner"}
              </p>
            </div>
          </div>
        </div>
      </section>
    </Page>
  );
}

function DetailStat({ icon: Icon, label, value }) {
  return (
    <div className="rounded-lg border border-stone-200 p-4">
      {createElement(Icon, { className: "mb-3 h-5 w-5 text-[#d5673f]" })}
      <p className="text-xs font-bold uppercase tracking-wide text-stone-400">{label}</p>
      <p className="mt-1 font-black text-stone-950">{value}</p>
    </div>
  );
}
