import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle, Image as ImageIcon, Loader2, Plus } from "lucide-react";
import { Page } from "../../shared/RentEasyLayout";
import {
  currentUserEmail,
  deleteStoredListing,
  formatCurrency,
  getStoredListings,
  normalizeProduct,
} from "../../shared/rentEasyData";
import { deleteProduct, getAllProducts } from "./listings.api";

export default function MyListings() {
  const navigate = useNavigate();
  const [localListings, setLocalListings] = useState(() => getStoredListings());
  const [databaseListings, setDatabaseListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [removingId, setRemovingId] = useState("");
  const email = currentUserEmail();
  const token = localStorage.getItem("token");

  useEffect(() => {
    let isActive = true;

    async function loadDatabaseListings() {
      setIsLoading(true);
      setError("");

      try {
        const response = await getAllProducts(token);
        if (!response.ok) throw new Error("Unable to load products.");

        const products = await response.json();
        if (isActive) setDatabaseListings(Array.isArray(products) ? products : []);
      } catch {
        if (isActive) {
          setDatabaseListings([]);
          setError("Database listings could not be loaded. Showing saved browser listings only.");
        }
      } finally {
        if (isActive) setIsLoading(false);
      }
    }

    loadDatabaseListings();

    return () => {
      isActive = false;
    };
  }, [email, token]);

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

  const handleRemove = async (item) => {
    const productId = item.productId;
    setRemovingId(String(productId));
    setNotice("");
    setError("");

    try {
      if (item.source === "database") {
        const response = await deleteProduct(productId, token);
        if (!response.ok) throw new Error("Unable to delete product.");
      }

      deleteStoredListing(productId);
      setLocalListings(getStoredListings());
      setDatabaseListings((current) => current.filter((listing) => String(listing.productId) !== String(productId)));
      setNotice("Listing removed successfully.");
      setTimeout(() => setNotice(""), 1800);
    } catch {
      setError("That listing could not be removed. Make sure the backend is running and you are logged in.");
    } finally {
      setRemovingId("");
    }
  };

  return (
    <Page>
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 rounded-lg border border-[#D0BCA0] bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-black tracking-tight text-[#4A3428]">My Listings</h1>
          <Link
            to="/create-listing"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#4A3428] px-5 font-black text-white hover:bg-[#3E2B22]"
          >
            <Plus size={18} />
            Add New Product
          </Link>
        </div>

        {notice && (
          <div className="mb-5 rounded-lg border border-[#D0BCA0] bg-[#FDFBF9] px-4 py-3 text-sm font-bold text-[#4A3428]">
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
          <div className="flex min-h-64 items-center justify-center rounded-lg border border-[#D0BCA0] bg-white text-sm font-bold text-[#8C6A48]">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Loading listings...
          </div>
        ) : listings.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[#D0BCA0] bg-white p-16 text-center">
            <p className="mb-5 font-bold text-[#8C6A48]">No listings yet</p>
            <Link to="/create-listing" className="inline-block rounded-lg bg-[#4A3428] px-8 py-3 font-black text-white hover:bg-[#3E2B22]">
              Create Listing
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {listings.map((item) => (
              <article key={item.productId} className="rent-card-motion flex flex-col overflow-hidden rounded-lg border border-[#D0BCA0] bg-white shadow-sm md:flex-row">
                <button
                  type="button"
                  onClick={() => navigate(`/products/${item.productId}`, { state: { product: item } })}
                  className="h-52 bg-[#F5F2F0] md:w-56"
                >
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                  ) : (
                    <span className="flex h-full items-center justify-center text-[#8C6A48] opacity-40">
                      <ImageIcon />
                    </span>
                  )}
                </button>

                <div className="flex-1 p-5">
                  <div className="mb-3 inline-block rounded-full bg-[#FDFBF9] px-3 py-1 text-xs font-black uppercase text-[#8C6A48] ring-1 ring-[#D0BCA0]">
                    {statusLabel(item.status)}
                  </div>
                  <h2 className="text-lg font-black text-[#4A3428]">{item.name}</h2>
                  <p className="mt-2 text-sm leading-6 text-[#8C6A48]">{item.description}</p>
                  <div className="mt-4 flex flex-wrap gap-3 text-sm font-bold text-[#4A3428]">
                    <span>{formatCurrency(item.price)} / day</span>
                    <span>{item.stock} in stock</span>
                    <span>{item.category}</span>
                  </div>
                </div>

                <div className="grid gap-3 border-t border-[#D0BCA0] bg-[#FDFBF9] p-5 md:w-56 md:border-l md:border-t-0">
                  <button
                    type="button"
                    onClick={() => navigate(`/products/${item.productId}`, { state: { product: item } })}
                    className="rounded-lg border border-[#D0BCA0] bg-white px-4 py-3 text-sm font-black text-[#4A3428] hover:border-[#4A3428]"
                  >
                    View Details
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemove(item)}
                    disabled={removingId === String(item.productId)}
                    className="rounded-lg border border-red-200 bg-white px-4 py-3 text-sm font-black text-red-600 hover:bg-red-50 disabled:opacity-60"
                  >
                    {removingId === String(item.productId) ? "Removing..." : "Remove Listing"}
                  </button>
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
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function statusLabel(status) {
  if (status === "APPROVED") return "Approved";
  if (status === "REJECTED") return "Rejected";
  return "Pending Review";
}
