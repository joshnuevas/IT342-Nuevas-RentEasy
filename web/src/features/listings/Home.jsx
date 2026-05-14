import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, Image as ImageIcon, Loader2 } from "lucide-react";
import { addCartItem, getCart } from "../cart/cart.api";
import { getApprovedProducts } from "./listings.api";
import { Page } from "../../shared/RentEasyLayout";
import {
  addProductToLocalCart,
  currentUserEmail,
  formatCurrency,
  getVisibleProducts,
  normalizeProduct,
} from "../../shared/rentEasyData";

export default function Home() {
  const navigate = useNavigate();
  const [remoteProducts, setRemoteProducts] = useState([]);
  const [cartItemIds, setCartItemIds] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const email = currentUserEmail();
  const token = localStorage.getItem("token");

  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      try {
        const productResponse = await getApprovedProducts();
        if (!productResponse.ok) throw new Error("Failed to load products.");

        const productData = await productResponse.json();
        if (isMounted) setRemoteProducts(Array.isArray(productData) ? productData : []);

        if (email && token) {
          const cartResponse = await getCart(email, token);
          if (cartResponse.ok) {
            const cartData = await cartResponse.json();
            if (isMounted) setCartItemIds(new Set(cartData.map((item) => item.product.productId)));
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Cannot connect to server.");
          setRemoteProducts([]);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [email, token]);

  const products = useMemo(() => {
    const query = search.trim().toLowerCase();
    return getVisibleProducts(remoteProducts)
      .filter((product) => ownerEmail(product) !== email.toLowerCase())
      .filter((product) => {
        if (!query) return true;
        return [product.name, product.description, product.category].join(" ").toLowerCase().includes(query);
      });
  }, [email, remoteProducts, search]);

  const addToCart = async (product) => {
    const normalized = normalizeProduct(product);
    try {
      const response = await addCartItem(normalized.productId, email, token);
      if (!response.ok) throw new Error("Cart API failed.");
    } catch {
      addProductToLocalCart(normalized, email);
    }

    setCartItemIds((prev) => new Set(prev).add(normalized.productId));
    navigate("/cart");
  };

  return (
    <Page searchValue={search} onSearchChange={setSearch}>
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 rounded-lg border border-[#D0BCA0] bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 text-sm font-black uppercase tracking-wide text-[#2F6F62]">RentEasy Catalog</p>
              <h1 className="text-3xl font-black tracking-tight text-[#4A3428]">Product Listing</h1>
            </div>
            {!isLoading && (
              <span className="w-fit rounded-full bg-[#FDFBF9] px-4 py-2 text-sm font-black text-[#8C6A48] ring-1 ring-[#D0BCA0]">
                {products.length} item{products.length === 1 ? "" : "s"}
              </span>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-[#8C6A48]">
            <Loader2 className="mb-4 h-10 w-10 animate-spin" />
            <p className="text-sm font-bold">Loading products...</p>
          </div>
        ) : error && products.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-red-200 bg-red-50 py-20 text-red-700">
            <AlertCircle className="mb-3 h-10 w-10" />
            <p className="text-sm font-bold">{error}</p>
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[#D0BCA0] bg-white py-20 text-center">
            <p className="font-bold text-[#8C6A48]">No approved listings yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard
                key={product.productId}
                product={product}
                isInCart={cartItemIds.has(product.productId)}
                addToCart={addToCart}
                onView={() => navigate(`/products/${product.productId}`, { state: { product } })}
              />
            ))}
          </div>
        )}
      </section>
    </Page>
  );
}

function ProductCard({ product, isInCart, addToCart, onView }) {
  const buttonText = isInCart ? "In Cart" : "Add to Cart";

  return (
    <article className="rent-card-motion flex flex-col overflow-hidden rounded-lg border border-[#D0BCA0] bg-white shadow-sm">
      <button type="button" onClick={onView} className="flex h-64 items-center justify-center bg-[#F5F2F0]">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
        ) : (
          <ImageIcon size={40} className="text-[#8C6A48] opacity-40" />
        )}
      </button>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <button type="button" onClick={onView} className="truncate text-left text-lg font-black text-[#4A3428] hover:underline">
          {product.name}
        </button>
        <p className="w-fit rounded-full bg-[#2F6F62]/10 px-3 py-1 text-xs font-black uppercase tracking-wide text-[#2F6F62]">
          {product.category}
        </p>
        <p className="mt-auto text-base font-black text-[#4A3428]">{formatCurrency(product.price)} / day</p>
        <button
          type="button"
          disabled={isInCart}
          onClick={() => addToCart(product)}
          className={`mt-2 h-11 rounded-lg text-sm font-black uppercase tracking-wide transition-colors ${
            isInCart
              ? "cursor-not-allowed bg-gray-100 text-gray-400"
              : "bg-[#4A3428] text-white hover:bg-[#3E2B22]"
          }`}
        >
          {buttonText}
        </button>
      </div>
    </article>
  );
}

function ownerEmail(product) {
  return String(product.owner?.email || product.ownerEmail || product.userEmail || product.email || "").toLowerCase();
}
