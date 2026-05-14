import { useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Image as ImageIcon, ShoppingCart } from "lucide-react";
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
  const isOwner = product.owner?.email === email;

  const handleAdd = async () => {
    try {
      const response = await addCartItem(product.productId, email, token);
      if (!response.ok) throw new Error("Cart API failed.");
    } catch {
      addProductToLocalCart(product, email);
    }

    setNotice("Added to cart.");
  };

  return (
    <Page>
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex items-center gap-2 rounded-lg border border-[#D0BCA0] bg-white px-4 py-2 text-sm font-bold text-[#4A3428] hover:border-[#4A3428]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        {notice && (
          <div className="mb-5 rounded-lg border border-[#D0BCA0] bg-[#FDFBF9] px-4 py-3 text-sm font-bold text-[#4A3428]">
            {notice}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
          <div className="flex min-h-[420px] items-center justify-center overflow-hidden rounded-lg border border-[#D0BCA0] bg-white shadow-sm">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name} className="max-h-[560px] w-full object-contain" />
            ) : (
              <div className="flex h-96 w-full items-center justify-center bg-[#F5F2F0] text-[#8C6A48] opacity-50">
                <ImageIcon size={56} />
              </div>
            )}
          </div>

          <aside className="h-fit rounded-lg border border-[#D0BCA0] bg-white p-6 shadow-sm">
            <div className="mb-4 inline-block rounded-full bg-[#FDFBF9] px-3 py-1 text-xs font-black uppercase text-[#8C6A48] ring-1 ring-[#D0BCA0]">
              {product.category}
            </div>
            <h1 className="border-b border-[#D0BCA0] pb-3 text-3xl font-black tracking-tight text-[#4A3428]">{product.name}</h1>
            <p className="mt-5 text-sm leading-6 text-[#8C6A48]">{product.description}</p>

            <div className="my-6 space-y-3 border-y border-[#D0BCA0] py-5">
              <Row label="Price" value={`${formatCurrency(product.price)} / day`} />
              <Row label="Stock" value={product.stock} />
              <Row label="Status" value={product.status} />
            </div>

            <button
              type="button"
              onClick={handleAdd}
              disabled={isOwner}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#4A3428] font-black uppercase tracking-wide text-white hover:bg-[#3E2B22] disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
            >
              <ShoppingCart className="h-5 w-5" />
              {isOwner ? "Your Listing" : "Add to Cart"}
            </button>

            <Link
              to="/cart"
              className="mt-3 flex h-12 w-full items-center justify-center rounded-lg border border-[#D0BCA0] font-black uppercase tracking-wide text-[#4A3428] hover:border-[#4A3428] hover:bg-[#FDFBF9]"
            >
              Go to Cart
            </Link>
          </aside>
        </div>
      </section>
    </Page>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="font-bold text-[#4A3428]">{label}</span>
      <span className="text-right text-[#8C6A48]">{value}</span>
    </div>
  );
}
