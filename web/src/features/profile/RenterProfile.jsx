import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Mail, Phone } from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { getAllProducts } from "../listings/listings.api";
import { Page } from "../../shared/RentEasyLayout";
import { formatCurrency, normalizeProduct } from "../../shared/rentEasyData";

export default function RenterProfile() {
  const { renterId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [owner, setOwner] = useState(state?.owner || null);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let isActive = true;

    async function loadOwnerFromProducts() {
      try {
        const response = await getAllProducts(token);
        if (!response.ok) throw new Error("Unable to load renter profile.");

        const allProducts = await response.json();
        const normalized = Array.isArray(allProducts) ? allProducts.map(normalizeProduct) : [];
        const ownerProducts = normalized.filter((product) => ownerKey(product.owner) === renterId);
        const matchedOwner = ownerProducts.find((product) => product.owner)?.owner;

        if (!isActive) return;
        setProducts(ownerProducts);
        setOwner((prev) => prev || matchedOwner || state?.owner || null);
      } catch {
        if (isActive) setError("Renter profile could not be loaded from the database.");
      }
    }

    loadOwnerFromProducts();

    return () => {
      isActive = false;
    };
  }, [renterId, state?.owner, token]);

  const profile = useMemo(() => ownerProfile(owner), [owner]);
  const approvedListings = products.filter((product) => product.status === "APPROVED");

  return (
    <Page>
      <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex items-center gap-2 rounded-lg border border-[#D0BCA0] bg-white px-4 py-2 text-sm font-bold text-[#4A3428] hover:border-[#4A3428]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="mb-8 rounded-lg border border-[#D0BCA0] bg-white p-6 shadow-sm">
          <p className="mb-2 text-sm font-black uppercase text-[#4A3428]">Renter Account</p>
          <h1 className="text-3xl font-black text-[#4A3428]">Renter Profile</h1>
        </div>

        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
          <aside className="h-fit rounded-lg border border-[#D0BCA0] bg-white p-6 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-28 w-28 items-center justify-center rounded-lg bg-[#4A3428] text-3xl font-black text-white ring-1 ring-[#D0BCA0]">
              {initials(profile.name)}
            </div>
            <h2 className="font-black text-[#4A3428]">{profile.name}</h2>
            <p className="mt-1 text-sm text-[#8C6A48]">{profile.email}</p>
          </aside>

          <div className="space-y-8">
            <section className="rounded-lg border border-[#D0BCA0] bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-6 border-b border-[#D0BCA0] pb-3">
                <h2 className="font-black text-[#4A3428]">Profile Information</h2>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Info label="Name" value={profile.name} />
                <Info label="Member since" value={profile.createdAt} />
                <Info label="Phone" value={profile.phone} icon={<Phone className="h-4 w-4" />} />
                <Info label="Email" value={profile.email} icon={<Mail className="h-4 w-4" />} />
              </div>
            </section>

            <section className="rounded-lg border border-[#D0BCA0] bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-6 flex items-center justify-between border-b border-[#D0BCA0] pb-3">
                <h2 className="font-black text-[#4A3428]">Approved Listings</h2>
                <span className="rounded-full bg-[#FDFBF9] px-3 py-1 text-xs font-black text-[#4A3428] ring-1 ring-[#D0BCA0]">
                  {approvedListings.length} item{approvedListings.length === 1 ? "" : "s"}
                </span>
              </div>

              {approvedListings.length === 0 ? (
                <div className="rounded-lg border border-dashed border-[#D0BCA0] bg-[#FDFBF9] p-8 text-center text-sm font-bold text-[#8C6A48]">
                  No approved listings found for this renter.
                </div>
              ) : (
                <div className="space-y-4">
                  {approvedListings.map((product) => (
                    <article key={product.productId} className="rounded-lg border border-[#D0BCA0] bg-[#FDFBF9] p-4">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="font-black text-[#4A3428]">{product.name}</p>
                          <p className="text-sm text-[#8C6A48]">{product.category}</p>
                        </div>
                        <p className="font-black text-[#4A3428]">{formatCurrency(product.price)} / day</p>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </section>
    </Page>
  );
}

function Info({ label, value, icon }) {
  return (
    <div className="rounded-lg border border-[#D0BCA0] bg-[#FDFBF9] p-4">
      <p className="mb-2 flex items-center gap-2 text-sm font-bold text-[#4A3428]">
        {icon}
        {label}
      </p>
      <p className="text-sm text-[#8C6A48]">{value || "Not provided"}</p>
    </div>
  );
}

function ownerProfile(owner) {
  return {
    name: [owner?.firstName, owner?.lastName].filter(Boolean).join(" ") || "Not provided",
    email: owner?.email || "Not provided",
    phone: owner?.phone || "Not provided",
    createdAt: formatDate(owner?.createdAt),
  };
}

function ownerKey(owner) {
  return encodeURIComponent(owner?.userID || owner?.userId || String(owner?.email || "").toLowerCase() || "unknown");
}

function initials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "R";
}

function formatDate(value) {
  if (!value) return "Not provided";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not provided";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}
