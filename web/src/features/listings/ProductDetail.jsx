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
          className="mb-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-[#8C6A48] shadow-sm ring-1 ring-[#D0BCA0] hover:text-[#4A3428]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        {notice && <div className="mb-5 rounded-lg bg-[#FDFBF9] px-4 py-3 text-sm font-bold text-[#4A3428]">{notice}</div>}

        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-[#D0BCA0]">
            <img src={product.imageUrl} alt={product.name} className="h-[520px] w-full object-cover" />
          </div>

          <div className="rounded-lg border border-[#D0BCA0] bg-white p-6 shadow-sm sm:p-8">
            <p className="mb-3 inline-flex rounded-full bg-[#FDFBF9] px-3 py-1 text-xs font-black uppercase tracking-wide text-[#4A3428]">
              {product.category}
            </p>
            <h1 className="text-4xl font-black tracking-tight text-[#4A3428]">{product.name}</h1>
            <p className="mt-4 text-base leading-7 text-[#8C6A48]">{product.description}</p>

            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              <DetailStat icon={CalendarDays} label="Rental" value="Daily" />
              <DetailStat icon={PackageCheck} label="Stock" value={`${product.stock} left`} />
              <DetailStat icon={ShieldCheck} label="Status" value="Verified" />
            </div>

            <div className="mt-8 rounded-lg bg-[#FDFBF9] p-5">
              <p className="text-sm font-bold uppercase tracking-wide text-[#8C6A48]">Rental price</p>
              <p className="mt-1 text-4xl font-black text-[#4A3428]">{formatCurrency(product.price)}</p>
              <p className="text-sm font-semibold text-[#8C6A48]">per day, excluding delivery coordination</p>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-[1fr_auto]">
              <button
                type="button"
                onClick={handleAdd}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[#4A3428] px-6 font-black text-white transition hover:bg-[#3E2B22]"
              >
                <ShoppingCart className="h-5 w-5" />
                Add to cart
              </button>
              <Link
                to="/cart"
                className="inline-flex h-12 items-center justify-center rounded-lg border border-[#D0BCA0] px-6 font-black text-[#4A3428] transition hover:border-[#4A3428] hover:text-[#4A3428]"
              >
                Go to cart
              </Link>
            </div>

            <div className="mt-8 border-t border-[#D0BCA0] pt-6">
              <p className="flex items-center gap-2 text-sm font-bold text-[#8C6A48]">
                <BadgeCheck className="h-4 w-4 text-[#4A3428]" />
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
    <div className="rounded-lg border border-[#D0BCA0] p-4">
      {createElement(Icon, { className: "mb-3 h-5 w-5 text-[#8C6A48]" })}
      <p className="text-xs font-bold uppercase tracking-wide text-[#8C6A48]">{label}</p>
      <p className="mt-1 font-black text-[#4A3428]">{value}</p>
    </div>
  );
}
