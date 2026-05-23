import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Eye, Image as ImageIcon, ShoppingCart } from "lucide-react";
import { addCartItem, getCart } from "../cart/cart.api";
import { getAllProducts } from "./listings.api";
import { Page } from "../../shared/RentEasyLayout";
import {
  currentUserEmail,
  formatCurrency,
  normalizeProduct,
  setLocalCart,
} from "../../shared/rentEasyData";

export default function ProductDetail() {
  const { productId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [product, setProduct] = useState(() => (state?.product ? normalizeProduct(state.product) : null));
  const email = currentUserEmail();
  const token = localStorage.getItem("token");
  const isOwner = ownerEmail(product) === email.toLowerCase();

  useEffect(() => {
    let isActive = true;

    async function loadProduct() {
      if (state?.product) return;

      try {
        const response = await getAllProducts(token);
        if (!response.ok) throw new Error("Unable to load products.");
        const products = await response.json();
        const match = Array.isArray(products)
          ? products.map(normalizeProduct).find((item) => String(item.productId) === String(productId))
          : null;
        if (isActive) setProduct(match || null);
      } catch {
        if (isActive) setError("Product could not be loaded from the database.");
      }
    }

    loadProduct();

    return () => {
      isActive = false;
    };
  }, [productId, state?.product, token]);

  const handleAdd = async () => {
    if (!product) return;
    setError("");
    setNotice("");

    try {
      const response = await addCartItem(product.productId, email, token);
      if (!response.ok) throw new Error("Cart API failed.");

      const cartResponse = await getCart(email, token);
      if (cartResponse.ok) {
        const cartData = await cartResponse.json();
        setLocalCart(Array.isArray(cartData) ? cartData : [], email);
      }
    } catch {
      setError("Cart could not be updated. Make sure the backend is running and you are logged in.");
      return;
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

        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
            {error}
          </div>
        )}

        {!product ? (
          <div className="rounded-lg border border-dashed border-[#D0BCA0] bg-white p-16 text-center font-bold text-[#8C6A48]">
            Product not found in the database.
          </div>
        ) : (

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
            <h1 className="border-b border-[#D0BCA0] pb-3 text-3xl font-black text-[#4A3428]">{product.name}</h1>
            <p className="mt-5 text-sm leading-6 text-[#8C6A48]">{product.description}</p>

            <div className="my-6 space-y-3 border-y border-[#D0BCA0] py-5">
              <Row label="Price" value={`${formatCurrency(product.price)} / day`} />
              <Row label="Stock" value={product.stock} />
              <Row label="Status" value={product.status} />
              <Row
                label="Added by"
                value={(
                  <button
                    type="button"
                    onClick={() => navigate(`/renters/${ownerProfileKey(product)}`, {
                      state: { owner: product.owner, productName: product.name },
                    })}
                    className="inline-flex items-center justify-end gap-2 rounded-full px-2 py-1 font-bold text-[#8C6A48] hover:bg-[#FDFBF9] hover:text-[#4A3428]"
                    aria-label={`View ${ownerName(product)} profile`}
                  >
                    <Eye className="h-4 w-4" />
                    {ownerName(product)}
                  </button>
                )}
              />
              <Row label="Owner phone" value={ownerPhone(product)} />
              <Row label="Owner email" value={ownerEmail(product) || "Not provided"} />
            </div>

            <button
              type="button"
              onClick={handleAdd}
              disabled={isOwner}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#4A3428] font-black uppercase text-white hover:bg-[#3E2B22] disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
            >
              <ShoppingCart className="h-5 w-5" />
              {isOwner ? "Your Listing" : "Add to Cart"}
            </button>

            <Link
              to="/cart"
              className="mt-3 flex h-12 w-full items-center justify-center rounded-lg border border-[#D0BCA0] font-black uppercase text-[#4A3428] hover:border-[#4A3428] hover:bg-[#FDFBF9]"
            >
              Go to Cart
            </Link>
          </aside>
        </div>
        )}
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

function ownerEmail(product) {
  return String(product?.owner?.email || product?.ownerEmail || product?.userEmail || product?.email || "").toLowerCase();
}

function ownerName(product) {
  const firstName = product?.owner?.firstName || "";
  const lastName = product?.owner?.lastName || "";
  return [firstName, lastName].filter(Boolean).join(" ") || product?.ownerName || "Not provided";
}

function ownerPhone(product) {
  return product?.owner?.phone || product?.ownerPhone || "Not provided";
}

function ownerProfileKey(product) {
  return encodeURIComponent(product?.owner?.userID || product?.owner?.userId || ownerEmail(product) || "unknown");
}

