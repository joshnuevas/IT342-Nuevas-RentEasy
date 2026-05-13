import { Link } from "react-router-dom";
import { createElement, useState } from "react";
import { CheckCircle2, Clock3, PackagePlus, Tag } from "lucide-react";
import { Page, EmptyState } from "../../shared/RentEasyLayout";
import {
  currentUserEmail,
  deleteStoredListing,
  formatCurrency,
  getStoredListings,
} from "../../shared/rentEasyData";

export default function MyListings() {
  const [version, setVersion] = useState(0);
  const [notice, setNotice] = useState("");
  const email = currentUserEmail();
  const listings = getStoredListings().filter((item) => item.owner?.email === email || item.ownerEmail === email);
  const approved = listings.filter((item) => item.status === "APPROVED").length;
  const pending = listings.filter((item) => item.status !== "APPROVED").length;

  const handleRemove = (productId) => {
    deleteStoredListing(productId);
    setNotice("Listing removed from your queue.");
    setVersion((current) => current + 1);
    setTimeout(() => setNotice(""), 1800);
  };

  void version;

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

        {listings.length === 0 ? (
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
                      item.status === "APPROVED" ? "bg-emerald-100 text-[#2f513f]" : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {item.status === "APPROVED" ? "Approved" : "Pending review"}
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
                      onClick={() => handleRemove(item.productId)}
                      className="rounded-lg border border-red-200 bg-white px-4 py-3 text-sm font-black text-red-600 transition hover:bg-red-50"
                    >
                      Remove listing
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

function Metric({ label, value, icon: Icon }) {
  return (
    <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
      {createElement(Icon, { className: "mb-4 h-5 w-5 text-[#d5673f]" })}
      <p className="text-sm font-bold text-stone-500">{label}</p>
      <p className="mt-1 text-3xl font-black text-stone-950">{value}</p>
    </div>
  );
}
