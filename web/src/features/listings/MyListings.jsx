import { Link } from "react-router-dom";
import { createElement, useEffect, useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, Clock3, Loader2, PackagePlus, Tag } from "lucide-react";
import { Page, EmptyState } from "../../shared/RentEasyLayout";
import {
  currentUserEmail,
  deleteStoredListing,
  formatCurrency,
  getStoredListings,
  normalizeProduct,
} from "../../shared/rentEasyData";
import { deleteProduct, getAllProducts } from "./listings.api";

export default function MyListings() {
  const [localListings, setLocalListings] = useState(() => getStoredListings());
  const [databaseListings, setDatabaseListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [removingId, setRemovingId] = useState("");
  const [notice, setNotice] = useState("");
  const email = currentUserEmail();

  useEffect(() => {
    let isActive = true;

    async function loadDatabaseListings() {
      setIsLoading(true);
      setError("");

      try {
        const response = await getAllProducts();
        if (!response.ok) {
          throw new Error("Unable to load products");
        }

        const products = await response.json();
        if (isActive) {
          setDatabaseListings(Array.isArray(products) ? products : []);
        }
      } catch {
        if (isActive) {
          setDatabaseListings([]);
          setError("Database listings could not be loaded. Showing saved browser listings only.");
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    loadDatabaseListings();

    return () => {
      isActive = false;
    };
  }, [email]);

  const listings = useMemo(() => {
    const ownedDatabaseListings = databaseListings
      .map(normalizeProduct)
      .filter((item) => belongsToCurrentUser(item, email))
      .map((item) => ({ ...item, source: "database" }));
    const ownedLocalListings = localListings
      .map(normalizeProduct)
      .filter((item) => belongsToCurrentUser(item, email))
      .map((item) => ({ ...item, source: "local" }));

    return mergeListings(ownedDatabaseListings, ownedLocalListings);
  }, [databaseListings, email, localListings]);

  const approved = listings.filter((item) => item.status === "APPROVED").length;
  const pending = listings.filter((item) => item.status === "PENDING").length;

  const handleRemove = async (item) => {
    const productId = item.productId;
    setRemovingId(String(productId));
    setNotice("");
    setError("");

    try {
      if (item.source === "database") {
        const response = await deleteProduct(productId);
        if (!response.ok) {
          throw new Error("Unable to delete product");
        }
      }

      deleteStoredListing(productId);
      setLocalListings(getStoredListings());
      setDatabaseListings((current) => current.filter((listing) => String(listing.productId) !== String(productId)));
      setNotice("Listing removed successfully.");
      setTimeout(() => setNotice(""), 1800);
    } catch {
      setError("That listing could not be removed from the database. Please make sure you are signed in and the backend is running.");
    } finally {
      setRemovingId("");
    }
  };

  return (
    <Page>
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-7 flex flex-col gap-5 rounded-lg bg-white p-6 shadow-sm ring-1 ring-stone-200 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#d5673f]">My listings</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-stone-950">Manage your rental items</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-500">
              Your wireframe keeps listing status, performance, and add-product actions together; this page follows that layout.
            </p>
          </div>
          <Link
            to="/create-listing"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[#2f513f] px-5 font-black text-white transition hover:bg-[#244232]"
          >
            <PackagePlus className="h-5 w-5" />
            Add new product
          </Link>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <Metric label="Total listings" value={listings.length} icon={Tag} />
          <Metric label="Approved" value={approved} icon={CheckCircle2} />
          <Metric label="Pending review" value={pending} icon={Clock3} />
        </div>

        {notice && (
          <div className="mb-5 rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-black text-[#2f513f]">
            {notice}
          </div>
        )}

        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-900">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {isLoading ? (
          <div className="flex min-h-64 items-center justify-center rounded-lg border border-stone-200 bg-white text-sm font-black text-stone-500">
            <Loader2 className="mr-2 h-5 w-5 animate-spin text-[#d5673f]" />
            Loading your database listings...
          </div>
        ) : listings.length === 0 ? (
          <EmptyState
            icon={PackagePlus}
            title="No listings yet"
            description="Create your first rental item so it can appear in your owner listing queue."
            action={
              <Link to="/create-listing" className="rounded-lg bg-[#2f513f] px-5 py-3 font-black text-white">
                Create listing
              </Link>
            }
          />
        ) : (
          <div className="grid gap-5">
            {listings.map((item) => (
              <article key={item.productId} className="grid overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm md:grid-cols-[220px_1fr_auto]">
                <img src={item.imageUrl} alt={item.name} className="h-56 w-full object-cover md:h-full" />
                <div className="p-5">
                  <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-black uppercase tracking-wide text-stone-500">
                    {item.category}
                  </span>
                  <h2 className="mt-3 text-xl font-black text-stone-950">{item.name}</h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-500">{item.description}</p>
                  <div className="mt-4 flex flex-wrap gap-3 text-sm font-bold text-stone-600">
                    <span>{formatCurrency(item.price)} / day</span>
                    <span>{item.stock} in stock</span>
                  </div>
                </div>
                <div className="flex min-w-48 flex-col justify-between border-t border-stone-200 bg-stone-50 p-5 md:border-l md:border-t-0">
                  <span
                    className={`rounded-full px-3 py-2 text-center text-xs font-black uppercase tracking-wide ${
                      statusClassName(item.status)
                    }`}
                  >
                    {statusLabel(item.status)}
                  </span>
                  <div className="mt-6 grid gap-2">
                    <Link
                      to={`/products/${item.productId}`}
                      state={{ product: item }}
                      className="rounded-lg border border-stone-200 bg-white px-4 py-3 text-center text-sm font-black text-stone-700 transition hover:border-[#2f513f] hover:text-[#2f513f]"
                    >
                      View details
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleRemove(item)}
                      disabled={removingId === String(item.productId)}
                      className="rounded-lg border border-red-200 bg-white px-4 py-3 text-sm font-black text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {removingId === String(item.productId) ? "Removing..." : "Remove listing"}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </Page>
  );
}

function belongsToCurrentUser(item, email) {
  return ownerEmail(item) === email.toLowerCase();
}

function ownerEmail(item) {
  return String(item.owner?.email || item.ownerEmail || item.userEmail || item.email || "").toLowerCase();
}

function mergeListings(databaseListings, localListings) {
  const seen = new Set();
  return [...databaseListings, ...localListings].filter((item) => {
    const key = String(item.productId);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function statusLabel(status) {
  if (status === "APPROVED") return "Approved";
  if (status === "REJECTED") return "Rejected";
  return "Pending review";
}

function statusClassName(status) {
  if (status === "APPROVED") return "bg-emerald-100 text-[#2f513f]";
  if (status === "REJECTED") return "bg-red-100 text-red-700";
  return "bg-amber-100 text-amber-800";
}

function Metric({ label, value, icon: Icon }) {
  return (
    <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
      {createElement(Icon, { className: "mb-4 h-5 w-5 text-[#d5673f]" })}
      <p className="text-sm font-bold text-stone-500">{label}</p>
      <p className="mt-1 text-3xl font-black text-stone-950">{value}</p>
    </div>
  );
}
