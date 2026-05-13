import { createElement, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BarChart3,
  Boxes,
  Check,
  Clock,
  LayoutDashboard,
  PackagePlus,
  ShoppingCart,
  Users,
  X,
} from "lucide-react";
import { getPendingListings as getPendingListingsApi, reviewListing } from "./admin.api";
import { Page } from "../../shared/RentEasyLayout";
import {
  demoOrders,
  deleteStoredListing,
  formatCurrency,
  getPendingListings,
  getProfile,
  getStoredListings,
  getStoredOrders,
  saveStoredOrders,
  updateStoredListingStatus,
} from "../../shared/rentEasyData";

const tabs = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "products", label: "Products", icon: Boxes },
  { id: "pending", label: "Pending Approval", icon: Clock },
  { id: "orders", label: "Orders", icon: ShoppingCart },
  { id: "users", label: "Users", icon: Users },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [remotePending, setRemotePending] = useState([]);
  const [, setLocalVersion] = useState(0);
  const [orders, setOrders] = useState(() => [...getStoredOrders(), ...demoOrders]);
  const token = localStorage.getItem("token");
  const pendingItems = getPendingListings(remotePending);
  const listings = getStoredListings();
  const profile = getProfile();

  useEffect(() => {
    let isMounted = true;
    const loadPending = async () => {
      try {
        const response = await getPendingListingsApi(token);
        const data = response.ok ? await response.json() : [];
        if (isMounted) setRemotePending(Array.isArray(data) ? data : []);
      } catch {
        if (isMounted) setRemotePending([]);
      }
    };
    loadPending();
    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleReview = async (id, status) => {
    try {
      await reviewListing(id, status, token);
    } catch {
      updateStoredListingStatus(id, status);
    }
    updateStoredListingStatus(id, status);
    setRemotePending((prev) => prev.filter((item) => String(item.productId) !== String(id)));
    setLocalVersion((version) => version + 1);
  };

  const handleDeleteProduct = (id) => {
    deleteStoredListing(id);
    setLocalVersion((version) => version + 1);
  };

  const handleOrderStatus = (orderNumber, status) => {
    const nextOrders = orders.map((order) =>
      order.orderNumber === orderNumber ? { ...order, status } : order
    );
    setOrders(nextOrders);
    saveStoredOrders(nextOrders.filter((order) => !demoOrders.some((demo) => demo.orderNumber === order.orderNumber)));
  };

  const approvedCount = listings.filter((item) => item.status === "APPROVED").length;

  return (
    <Page>
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[270px_1fr]">
          <aside className="h-fit rounded-lg border border-[#D0BCA0] bg-white p-5 shadow-sm lg:sticky lg:top-24">
            <div className="mb-6 rounded-lg bg-[#4A3428] p-5 text-white">
              <p className="text-sm font-bold text-[#FDFBF9]">RentEasy</p>
              <h1 className="mt-1 text-2xl font-black">Admin Panel</h1>
              <p className="mt-3 rounded-lg bg-white/10 px-3 py-2 text-sm font-semibold text-[#FDFBF9]">
                {profile.name}
              </p>
            </div>
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-black transition ${
                    activeTab === tab.id ? "bg-[#FDFBF9] text-[#4A3428]" : "text-[#8C6A48] hover:bg-[#FDFBF9] hover:text-[#4A3428]"
                  }`}
                >
                  {createElement(tab.icon, { className: "h-5 w-5" })}
                  {tab.label}
                </button>
              ))}
            </nav>
          </aside>

          <div className="space-y-6">
            {activeTab === "dashboard" && (
              <DashboardView
                totalProducts={listings.length + pendingItems.length}
                pending={pendingItems.length}
                orders={orders.length}
                revenue={orders.reduce((sum, order) => sum + Number(order.total || 0), 0)}
              />
            )}
            {activeTab === "products" && (
              <ProductsView
                listings={listings}
                approvedCount={approvedCount}
                onDelete={handleDeleteProduct}
                onView={(item) => navigate(`/products/${item.productId}`, { state: { product: item } })}
              />
            )}
            {activeTab === "pending" && <PendingView items={pendingItems} onReview={handleReview} />}
            {activeTab === "orders" && <OrdersView orders={orders} onStatusChange={handleOrderStatus} />}
            {activeTab === "users" && <UsersView />}
          </div>
        </div>
      </section>
    </Page>
  );
}

function DashboardView({ totalProducts, pending, orders, revenue }) {
  return (
    <>
      <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-[#D0BCA0]">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#8C6A48]">Admin home</p>
        <h2 className="mt-2 text-3xl font-black tracking-tight text-[#4A3428]">Dashboard overview</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <AdminMetric label="Total orders" value={orders} />
        <AdminMetric label="Revenue" value={formatCurrency(revenue)} />
        <AdminMetric label="Products" value={totalProducts} />
        <AdminMetric label="Pending" value={pending} />
      </div>
      <div className="rounded-lg border border-[#D0BCA0] bg-white p-6 shadow-sm">
        <h3 className="mb-5 flex items-center gap-2 text-lg font-black text-[#4A3428]">
          <BarChart3 className="h-5 w-5 text-[#8C6A48]" />
          Revenue snapshot
        </h3>
        <div className="rounded-lg bg-[#FDFBF9] p-5">
          <div className="flex h-72 items-end gap-4">
            {[
              { label: "Orders", value: Math.max(orders, 1), color: "bg-[#4A3428]" },
              { label: "Pending", value: Math.max(pending, 1), color: "bg-[#8C6A48]" },
              { label: "Products", value: Math.max(totalProducts, 1), color: "bg-[#3E2B22]" },
            ].map((bar) => (
              <div key={bar.label} className="flex flex-1 flex-col items-center gap-3">
                <div className="flex h-56 w-full max-w-28 items-end rounded-t-lg bg-white p-2">
                  <div
                    className={`w-full rounded-t-md ${bar.color}`}
                    style={{ height: `${Math.min(100, 22 + bar.value * 14)}%` }}
                    title={`${bar.label}: ${bar.value}`}
                  />
                </div>
                <div className="text-center">
                  <p className="text-sm font-black text-[#4A3428]">{bar.value}</p>
                  <p className="text-xs font-bold uppercase tracking-wide text-[#8C6A48]">{bar.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function ProductsView({ listings, approvedCount, onDelete, onView }) {
  return (
    <section className="rounded-lg border border-[#D0BCA0] bg-white p-6 shadow-sm">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-black text-[#4A3428]">Product management</h2>
          <p className="text-sm text-[#8C6A48]">{approvedCount} approved local listings</p>
        </div>
        <Link to="/create-listing" className="inline-flex h-11 items-center gap-2 rounded-lg bg-[#4A3428] px-4 font-black text-white">
          <PackagePlus className="h-5 w-5" />
          Add product
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead className="bg-[#FDFBF9] text-xs uppercase tracking-wide text-[#8C6A48]">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {listings.map((item) => (
              <tr key={item.productId} className="border-t border-[#D0BCA0]">
                <td className="px-4 py-4 font-black text-[#4A3428]">{item.name}</td>
                <td className="px-4 py-4">{item.category}</td>
                <td className="px-4 py-4">{formatCurrency(item.price)}</td>
                <td className="px-4 py-4">{item.stock}</td>
                <td className="px-4 py-4">
                  <span className="rounded-full bg-[#F5F2F0] px-3 py-1 text-xs font-black uppercase">{item.status}</span>
                </td>
                <td className="px-4 py-4">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => onView(item)}
                      className="rounded-lg border border-[#D0BCA0] px-3 py-2 text-xs font-black text-[#4A3428] hover:border-[#4A3428] hover:text-[#4A3428]"
                    >
                      View
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(item.productId)}
                      className="rounded-lg border border-red-200 px-3 py-2 text-xs font-black text-red-600 hover:bg-red-50"
                    >
                      Remove
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {listings.length === 0 && (
              <tr>
                <td colSpan="6" className="px-4 py-8 text-center text-sm font-semibold text-[#8C6A48]">
                  No owner-created products yet. Use Add product to create one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function PendingView({ items, onReview }) {
  return (
    <section className="rounded-lg border border-[#D0BCA0] bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-black text-[#4A3428]">Pending approval queue</h2>
      <p className="mt-1 text-sm text-[#8C6A48]">Approve owner-submitted products before they appear in the customer catalog.</p>
      <div className="mt-6 space-y-4">
        {items.map((item) => (
          <article key={item.productId} className="grid overflow-hidden rounded-lg border border-[#D0BCA0] md:grid-cols-[180px_1fr_auto]">
            <img src={item.imageUrl} alt={item.name} className="h-44 w-full object-cover md:h-full" />
            <div className="p-5">
              <p className="text-xs font-black uppercase tracking-wide text-[#4A3428]">{item.category}</p>
              <h3 className="mt-2 text-xl font-black text-[#4A3428]">{item.name}</h3>
              <p className="mt-2 text-sm leading-6 text-[#8C6A48]">{item.description}</p>
              <p className="mt-3 text-sm font-bold text-[#8C6A48]">Owner: {item.owner?.firstName} {item.owner?.lastName}</p>
            </div>
            <div className="flex min-w-48 flex-row gap-2 border-t border-[#D0BCA0] bg-[#FDFBF9] p-5 md:flex-col md:border-l md:border-t-0">
              <button type="button" onClick={() => onReview(item.productId, "APPROVED")} className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#4A3428] px-4 py-3 text-sm font-black text-white">
                <Check className="h-4 w-4" /> Approve
              </button>
              <button type="button" onClick={() => onReview(item.productId, "REJECTED")} className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-3 text-sm font-black text-red-600">
                <X className="h-4 w-4" /> Reject
              </button>
            </div>
          </article>
        ))}
      </div>
      {items.length === 0 && (
        <div className="mt-6 rounded-lg border border-dashed border-[#D0BCA0] bg-[#FDFBF9] p-8 text-center text-sm font-bold text-[#8C6A48]">
          No pending listings. Approved items move into Product Management and the customer catalog.
        </div>
      )}
    </section>
  );
}

function OrdersView({ orders, onStatusChange }) {
  return (
    <section className="rounded-lg border border-[#D0BCA0] bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-black text-[#4A3428]">Order list</h2>
      <div className="mt-5 grid gap-4">
        {orders.map((order) => (
          <article key={order.orderNumber} className="rounded-lg bg-[#FDFBF9] p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-black text-[#4A3428]">{order.orderNumber}</p>
                <p className="text-sm text-[#8C6A48]">{order.items?.length || 0} item(s)</p>
              </div>
              <div className="text-left sm:text-right">
                <p className="font-black text-[#4A3428]">{formatCurrency(order.total)}</p>
                <select
                  value={order.status}
                  onChange={(event) => onStatusChange(order.orderNumber, event.target.value)}
                  className="mt-2 rounded-full border border-[#D0BCA0] bg-white px-3 py-2 text-sm font-bold text-[#4A3428] outline-none focus:border-[#4A3428]"
                >
                  <option>Processing</option>
                  <option>Ready for Pickup</option>
                  <option>Completed</option>
                  <option>Cancelled</option>
                </select>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function UsersView() {
  return (
    <section className="rounded-lg border border-[#D0BCA0] bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-black text-[#4A3428]">Users</h2>
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        {["student@example.com", "admin1@renteasy.com", "owner@example.com"].map((email, index) => (
          <div key={email} className="rounded-lg bg-[#FDFBF9] p-4">
            <p className="font-black text-[#4A3428]">{email}</p>
            <p className="text-sm text-[#8C6A48]">{index === 1 ? "Administrator" : "Customer"}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function AdminMetric({ label, value }) {
  return (
    <div className="rounded-lg border border-[#D0BCA0] bg-white p-5 shadow-sm">
      <p className="text-sm font-bold text-[#8C6A48]">{label}</p>
      <p className="mt-2 text-3xl font-black text-[#4A3428]">{value}</p>
    </div>
  );
}
