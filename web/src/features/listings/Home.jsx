import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, BadgeCheck, CalendarDays, Image as ImageIcon, Loader2, SlidersHorizontal, Star } from "lucide-react";
import { addCartItem, getCart } from "../cart/cart.api";
import { getApprovedProducts } from "./listings.api";
import { Page } from "../../shared/RentEasyLayout";
import {
  addProductToLocalCart,
  categories,
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
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sortBy, setSortBy] = useState("featured");
  const [notice, setNotice] = useState("");

  const email = currentUserEmail();
  const token = localStorage.getItem("token");

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        const response = await getApprovedProducts();
        const data = response.ok ? await response.json() : [];
        if (isMounted) setRemoteProducts(Array.isArray(data) ? data : data.data || []);

        if (email && token) {
          const cartResponse = await getCart(email, token);
          if (cartResponse.ok) {
            const cartData = await cartResponse.json();
            if (isMounted) setCartItemIds(new Set(cartData.map((item) => item.product.productId)));
          }
        }
      } catch {
        if (isMounted) setRemoteProducts([]);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchData();
    return () => {
      isMounted = false;
    };
  }, [email, token]);

  const products = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filtered = getVisibleProducts(remoteProducts)
      .filter((product) => category === "All" || product.category?.toLowerCase() === category.toLowerCase())
      .filter((product) => {
        if (!query) return true;
        return [product.name, product.description, product.category].join(" ").toLowerCase().includes(query);
      });

    return filtered.sort((a, b) => {
      if (sortBy === "price-low") return Number(a.price) - Number(b.price);
      if (sortBy === "price-high") return Number(b.price) - Number(a.price);
      return String(a.name).localeCompare(String(b.name));
    });
  }, [category, remoteProducts, search, sortBy]);

  const addToCart = async (product) => {
    const normalized = normalizeProduct(product);
    try {
      const response = await addCartItem(normalized.productId, email, token);
      if (!response.ok) throw new Error("Cart API failed");
    } catch {
      addProductToLocalCart(normalized, email);
    }
    setCartItemIds((prev) => new Set(prev).add(normalized.productId));
    setNotice(`${normalized.name} added to cart.`);
    setTimeout(() => setNotice(""), 2400);
  };

  return (
    <Page searchValue={search} onSearchChange={setSearch}>
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-8">
        <div className="rounded-lg bg-[#2f513f] p-6 text-white shadow-xl shadow-emerald-900/10 sm:p-8">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-100">Rental catalog</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-black tracking-tight sm:text-5xl">
            Browse high-value gear without owning it forever.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-emerald-50">
            Cameras, tools, audio gear, outdoor kits, and event equipment are organized exactly around the SDD shopping journey.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              to="/create-listing"
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-black text-[#2f513f] shadow-sm transition hover:bg-emerald-50"
            >
              List an item <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/cart"
              className="inline-flex items-center gap-2 rounded-full border border-white/30 px-5 py-3 text-sm font-black text-white transition hover:bg-white/10"
            >
              View cart
            </Link>
          </div>
        </div>

        <aside className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-lg bg-[#f5e7df] text-[#d5673f]">
              <CalendarDays className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-stone-500">Ready for rental</p>
              <p className="text-2xl font-black text-stone-950">{products.length} items</p>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
            <Stat label="Avg. response" value="< 2s" />
            <Stat label="Support" value="Local" />
          </div>
        </aside>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 rounded-lg border border-stone-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {categories.map((item) => (
              <button
                type="button"
                key={item}
                onClick={() => setCategory(item)}
                className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                  category === item ? "bg-[#2f513f] text-white" : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 text-sm font-bold text-stone-600">
            <SlidersHorizontal className="h-4 w-4" />
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className="rounded-full border border-stone-200 bg-white px-4 py-2 outline-none focus:border-[#2f513f] focus:ring-4 focus:ring-emerald-100"
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: low to high</option>
              <option value="price-high">Price: high to low</option>
            </select>
          </label>
        </div>

        {notice && (
          <div className="mb-5 rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-bold text-[#2f513f]">
            {notice}
          </div>
        )}

        {isLoading ? (
          <div className="grid min-h-64 place-items-center rounded-lg bg-white">
            <Loader2 className="h-9 w-9 animate-spin text-[#2f513f]" />
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <ProductCard
                key={product.productId}
                product={product}
                isInCart={cartItemIds.has(product.productId)}
                onAdd={() => addToCart(product)}
                onView={() => navigate(`/products/${product.productId}`, { state: { product } })}
              />
            ))}
          </div>
        )}
      </section>
    </Page>
  );
}

function ProductCard({ product, isInCart, onAdd, onView }) {
  return (
    <article className="overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-stone-200">
      <button type="button" onClick={onView} className="group relative block h-60 w-full overflow-hidden bg-stone-100 text-left">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        ) : (
          <div className="grid h-full place-items-center text-stone-400">
            <ImageIcon className="h-12 w-12" />
          </div>
        )}
        <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-xs font-black text-[#2f513f] shadow-sm">
          {product.category}
        </span>
      </button>
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-stone-950">{product.name}</h2>
            <p className="mt-1 line-clamp-2 text-sm leading-6 text-stone-500">{product.description}</p>
          </div>
          <div className="flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-xs font-black text-amber-700">
            <Star className="h-3 w-3 fill-amber-500" />
            4.8
          </div>
        </div>
        <div className="mt-5 flex items-end justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-stone-400">Per day</p>
            <p className="text-2xl font-black text-stone-950">{formatCurrency(product.price)}</p>
          </div>
          <p className="flex items-center gap-1 text-sm font-bold text-[#2f513f]">
            <BadgeCheck className="h-4 w-4" />
            {product.stock} available
          </p>
        </div>
        <div className="mt-5 grid grid-cols-[1fr_auto] gap-2">
          <button
            type="button"
            onClick={onAdd}
            disabled={isInCart}
            className={`rounded-lg px-4 py-3 text-sm font-black transition ${
              isInCart ? "bg-stone-100 text-stone-400" : "bg-[#2f513f] text-white hover:bg-[#244232]"
            }`}
          >
            {isInCart ? "In cart" : "Add to cart"}
          </button>
          <button
            type="button"
            onClick={onView}
            className="rounded-lg border border-stone-200 px-4 py-3 text-sm font-black text-stone-700 transition hover:border-[#2f513f] hover:text-[#2f513f]"
          >
            Details
          </button>
        </div>
      </div>
    </article>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-lg bg-stone-50 p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-stone-400">{label}</p>
      <p className="mt-1 text-lg font-black text-stone-950">{value}</p>
    </div>
  );
}
