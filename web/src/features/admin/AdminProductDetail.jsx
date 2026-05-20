import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Image as ImageIcon } from "lucide-react";
import { formatCurrency, normalizeProduct } from "../../shared/rentEasyData";
import { getAllProducts } from "../listings/listings.api";

export default function AdminProductDetail() {
  const { productId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [product, setProduct] = useState(() => (state?.product ? normalizeProduct(state.product) : null));
  const [error, setError] = useState("");

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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#F5F2F0] font-sans text-[#4A3428]">
      <header className="rent-header-motion sticky top-0 z-40 flex items-center justify-between border-b border-[#D0BCA0] bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
        <div className="rent-brand-button rounded-lg bg-[#4A3428] px-4 py-2 font-black text-white">
          RentEasy Admin
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="rent-icon-button flex h-10 items-center rounded-lg border border-[#D0BCA0] px-4 text-sm font-bold text-[#4A3428] hover:border-[#4A3428] hover:bg-[#4A3428] hover:text-white"
        >
          Logout
        </button>
      </header>

      <main className="rent-page-motion mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => navigate("/admin-dashboard", { state: { activeTab: "products" } })}
          className="mb-6 inline-flex items-center gap-2 rounded-lg border border-[#D0BCA0] bg-white px-4 py-2 text-sm font-bold text-[#4A3428] hover:border-[#4A3428]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Products
        </button>

        <div className="mb-8 rounded-lg border border-[#D0BCA0] bg-white p-6 shadow-sm">
          <p className="mb-2 text-sm font-black uppercase text-[#4A3428]">Admin Product Details</p>
          <h1 className="text-3xl font-black text-[#4A3428]">{product?.name || "Product Details"}</h1>
        </div>

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
              <h2 className="border-b border-[#D0BCA0] pb-3 text-3xl font-black text-[#4A3428]">{product.name}</h2>
              <p className="mt-5 text-sm leading-6 text-[#8C6A48]">
                {product.description || "No description provided."}
              </p>

              <div className="my-6 space-y-3 border-y border-[#D0BCA0] py-5">
                <Row label="Price" value={`${formatCurrency(product.price)} / day`} />
                <Row label="Stock" value={product.stock} />
                <Row label="Status" value={product.status} />
                <Row label="Added by" value={ownerName(product)} />
                <Row label="Owner Phone" value={ownerPhone(product)} />
                <Row label="Owner Email" value={ownerEmail(product) || "Not provided"} />
              </div>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="font-bold text-[#4A3428]">{label}</span>
      <span className="text-right text-[#8C6A48]">{value || "Not provided"}</span>
    </div>
  );
}

function ownerName(product) {
  const firstName = product.owner?.firstName || "";
  const lastName = product.owner?.lastName || "";
  return [firstName, lastName].filter(Boolean).join(" ") || product.ownerName || "Not provided";
}

function ownerEmail(product) {
  return product.owner?.email || product.ownerEmail || product.userEmail || product.email || "";
}

function ownerPhone(product) {
  return product.owner?.phone || product.ownerPhone || "Not provided";
}
