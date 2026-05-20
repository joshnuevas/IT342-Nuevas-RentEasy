import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  BarChart3,
  Box,
  Check,
  Clock,
  LayoutDashboard,
  ShoppingCart,
  Users,
  X,
} from "lucide-react";
import { getPendingListings as getPendingListingsApi, reviewListing } from "./admin.api";
import {
  formatCurrency,
  getPendingListings,
  getProfile,
  getStoredOrders,
  normalizeProduct,
  saveStoredOrders,
} from "../../shared/rentEasyData";
import { deleteProduct, getAllProducts } from "../listings/listings.api";

const tabs = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "products", label: "Products", icon: Box },
  { id: "pending", label: "Pending Approval", icon: Clock },
  { id: "orders", label: "Orders", icon: ShoppingCart },
  { id: "users", label: "Users", icon: Users },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [activeTab, setActiveTab] = useState(state?.activeTab || "dashboard");
  const [remotePending, setRemotePending] = useState([]);
  const [remoteProducts, setRemoteProducts] = useState([]);
  const [orders, setOrders] = useState(() => getStoredOrders());
  const [isLoading, setIsLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const token = localStorage.getItem("token");
  const profile = getProfile();
  const pendingItems = getPendingListings(remotePending);
  const productItems = mergeProducts(remoteProducts.map(normalizeProduct).map((item) => ({ ...item, source: "database" })));

  useEffect(() => {
    let isMounted = true;

    async function loadAdminData() {
      setIsLoading(true);
      try {
        const pendingResponse = await getPendingListingsApi(token);
        const pendingData = pendingResponse.ok ? await pendingResponse.json() : [];
        const productsResponse = await getAllProducts(token);
        const productsData = productsResponse.ok ? await productsResponse.json() : [];

        if (isMounted) {
          setRemotePending(Array.isArray(pendingData) ? pendingData : []);
          setRemoteProducts(Array.isArray(productsData) ? productsData : []);
        }
      } catch {
        if (isMounted) {
          setRemotePending([]);
          setRemoteProducts([]);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadAdminData();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    navigate("/login");
  };

  const handleReview = async (id, status) => {
    try {
      const response = await reviewListing(id, status, token);
      if (!response.ok) throw new Error("Review failed.");
    } catch {
      setNotice("Review failed. Make sure the backend is running and you are logged in.");
      setTimeout(() => setNotice(""), 2200);
      return;
    }

    setRemotePending((prev) => prev.filter((item) => String(item.productId) !== String(id)));
    setRemoteProducts((prev) =>
      prev.map((item) => (String(item.productId) === String(id) ? { ...item, status } : item))
    );
    setNotice(status === "APPROVED" ? "Listing approved." : "Listing rejected.");
    setTimeout(() => setNotice(""), 1600);
  };

  const handleDeleteProduct = async (item) => {
    try {
      const response = await deleteProduct(item.productId, token);
      if (!response.ok && response.status !== 404) throw new Error("Delete failed.");
      setRemoteProducts((prev) => prev.filter((product) => String(product.productId) !== String(item.productId)));
      setNotice("Product removed.");
      setTimeout(() => setNotice(""), 1600);
    } catch {
      setNotice("Product remove failed.");
      setTimeout(() => setNotice(""), 1600);
    }
  };

  const handleOrderStatus = (orderNumber, status) => {
    const nextOrders = orders.map((order) => (order.orderNumber === orderNumber ? { ...order, status } : order));
    setOrders(nextOrders);
    saveStoredOrders(nextOrders);
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

      <div className="flex min-h-[calc(100vh-4rem)]">
        <aside className="sticky top-[72px] hidden h-[calc(100vh-72px)] w-64 shrink-0 border-r border-[#D0BCA0] bg-white p-6 md:block">
          <div className="mb-8 rounded-lg bg-[#FDFBF9] p-4 text-center ring-1 ring-[#D0BCA0]">
            <h1 className="text-xl font-black text-[#4A3428]">Admin Panel</h1>
            <p className="mt-2 text-xs font-bold text-[#8C6A48]">{profile.name}</p>
          </div>

          <nav className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-sm font-black ${
                  activeTab === tab.id
                    ? "bg-[#4A3428] text-white"
                    : "text-[#8C6A48] hover:bg-[#FDFBF9] hover:text-[#4A3428]"
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>

        <main className="rent-page-motion flex-1 p-6 md:p-8">
          <div className="mb-6 flex flex-wrap gap-2 md:hidden">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-lg px-3 py-2 text-xs font-bold ${
                  activeTab === tab.id ? "bg-[#4A3428] text-white" : "border border-[#D0BCA0] bg-white text-[#4A3428]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {notice && (
            <div className="mb-5 inline-block rounded-lg border border-[#D0BCA0] bg-white px-4 py-3 text-sm font-bold">
              {notice}
            </div>
          )}

          {activeTab === "dashboard" && (
            <DashboardView
              products={productItems.length}
              pending={pendingItems.length}
              orders={orders.length}
              revenue={orders.reduce((sum, order) => sum + Number(order.total || 0), 0)}
            />
          )}
          {activeTab === "products" && (
            <ProductsView
              items={productItems}
              isLoading={isLoading}
              onView={(item) => navigate(`/admin/products/${item.productId}`, { state: { product: item } })}
              onDelete={handleDeleteProduct}
            />
          )}
          {activeTab === "pending" && <PendingView items={pendingItems} isLoading={isLoading} onReview={handleReview} />}
          {activeTab === "orders" && <OrdersView orders={orders} onStatusChange={handleOrderStatus} />}
          {activeTab === "users" && <UsersView profile={profile} />}
        </main>
      </div>
    </div>
  );
}

function DashboardView({ products, pending, orders, revenue }) {
  return (
    <>
      <Title>Dashboard Overview</Title>
      <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Total Orders" value={orders} />
        <Metric label="Revenue" value={formatCurrency(revenue)} />
        <Metric label="Products" value={products} />
        <Metric label="Pending" value={pending} />
      </div>

      <section className="rounded-lg border border-[#D0BCA0] bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-2 font-black text-[#4A3428]">
          <BarChart3 size={20} />
          Revenue Chart
        </div>
        <div className="flex h-80 flex-col items-center justify-center rounded-lg border border-dashed border-[#D0BCA0] bg-[#FDFBF9] text-[#8C6A48]">
          <BarChart3 size={44} className="mb-4 opacity-40" />
          <div className="rounded-lg bg-white px-5 py-2 text-sm font-bold ring-1 ring-[#D0BCA0]">
            Chart Visualization Area
          </div>
        </div>
      </section>
    </>
  );
}

function ProductsView({ items, isLoading, onView, onDelete }) {
  return (
    <section>
      <Title>Products</Title>
      <div className="overflow-x-auto rounded-lg border border-[#D0BCA0] bg-white p-4 shadow-sm">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-[#FDFBF9] text-[#8C6A48]">
            <tr>
              <th className="px-3 py-3">Product</th>
              <th className="px-3 py-3">Category</th>
              <th className="px-3 py-3">Price</th>
              <th className="px-3 py-3">Stock</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={`${item.source}-${item.productId}`} className="border-b border-[#D0BCA0]">
                <td className="px-3 py-4 font-black text-[#4A3428]">{item.name}</td>
                <td className="px-3 py-4">{item.category}</td>
                <td className="px-3 py-4">{formatCurrency(item.price)}</td>
                <td className="px-3 py-4">{item.stock}</td>
                <td className="px-3 py-4">{item.status}</td>
                <td className="px-3 py-4">
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => onView(item)} className="rounded-lg border border-[#D0BCA0] px-3 py-2 text-xs font-black hover:border-[#4A3428]">
                      View
                    </button>
                    <button type="button" onClick={() => onDelete(item)} className="rounded-lg border border-red-200 px-3 py-2 text-xs font-black text-red-600 hover:bg-red-50">
                      Remove
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan="6" className="px-3 py-10 text-center font-bold text-[#8C6A48]">
                  {isLoading ? "Loading products..." : "No products found"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function PendingView({ items, isLoading, onReview }) {
  return (
    <section>
      <Title>Pending Approval Queue</Title>
      <div className="space-y-6">
        {items.map((item) => (
          <article key={item.productId} className="flex flex-col overflow-hidden rounded-lg border border-[#D0BCA0] bg-white shadow-sm md:flex-row">
            <div className="h-48 bg-[#F5F2F0] md:w-48">
              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-sm font-bold text-[#8C6A48]">No Image</div>
              )}
            </div>
            <div className="flex-1 p-6">
              <h3 className="text-lg font-black text-[#4A3428]">{item.name}</h3>
              <p className="mt-1 text-sm text-[#8C6A48]">By: {item.owner?.firstName} {item.owner?.lastName}</p>
              <p className="mt-4 text-xl font-black">{formatCurrency(item.price)}</p>
            </div>
            <div className="grid gap-3 border-t border-[#D0BCA0] bg-[#FDFBF9] p-6 md:w-64 md:border-l md:border-t-0">
              <button
                type="button"
                onClick={() => onReview(item.productId, "APPROVED")}
                className="flex items-center justify-center gap-2 rounded-lg bg-[#4A3428] py-2 font-black text-white hover:bg-[#3E2B22]"
              >
                <Check size={18} />
                Approve
              </button>
              <button
                type="button"
                onClick={() => onReview(item.productId, "REJECTED")}
                className="flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-white py-2 font-black text-red-600 hover:bg-red-50"
              >
                <X size={18} />
                Reject
              </button>
            </div>
          </article>
        ))}

        {items.length === 0 && (
          <div className="rounded-lg border border-dashed border-[#D0BCA0] bg-white p-20 text-center font-bold text-[#8C6A48]">
            {isLoading ? "Loading pending listings..." : "No listings awaiting review"}
          </div>
        )}
      </div>
    </section>
  );
}

function OrdersView({ orders, onStatusChange }) {
  return (
    <section>
      <Title>Orders</Title>
      <div className="space-y-4">
        {orders.map((order) => (
          <article key={order.orderNumber} className="rounded-lg border border-[#D0BCA0] bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-black text-[#4A3428]">{order.orderNumber}</p>
                <p className="text-sm text-[#8C6A48]">{order.items?.length || 0} item(s)</p>
              </div>
              <div className="text-left sm:text-right">
                <p className="font-black">{formatCurrency(order.total)}</p>
                <select
                  value={order.status}
                  onChange={(event) => onStatusChange(order.orderNumber, event.target.value)}
                  className="mt-2 rounded-lg border border-[#D0BCA0] bg-[#FDFBF9] px-3 py-2 text-sm font-bold outline-none focus:border-[#4A3428]"
                >
                  <option>Processing</option>
                  <option>Ready for Pickup</option>
                  <option>Completed</option>
                  <option>Cancelled</option>
                  <option>Awaiting PayMongo payment</option>
                </select>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function UsersView({ profile }) {
  return (
    <section>
      <Title>Users</Title>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-[#D0BCA0] bg-white p-5 shadow-sm">
          <p className="font-black text-[#4A3428]">Admin Account</p>
          <p className="mt-2 text-sm text-[#8C6A48]">{profile.email}</p>
        </div>
        <div className="rounded-lg border border-[#D0BCA0] bg-white p-5 shadow-sm">
          <p className="font-black text-[#4A3428]">Role</p>
          <p className="mt-2 text-sm text-[#8C6A48]">ADMIN</p>
        </div>
      </div>
    </section>
  );
}

function Title({ children }) {
  return (
    <div className="mb-8 rounded-lg border border-[#D0BCA0] bg-white px-5 py-4 shadow-sm">
      <p className="mb-2 text-sm font-black uppercase text-[#4A3428]">Admin Workspace</p>
      <h2 className="text-2xl font-black text-[#4A3428]">{children}</h2>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-lg border border-[#D0BCA0] bg-white p-5 shadow-sm">
      <p className="text-sm font-bold text-[#8C6A48]">{label}</p>
      <p className="mt-2 text-3xl font-black text-[#4A3428]">{value}</p>
    </div>
  );
}

function mergeProducts(remoteProducts) {
  const seen = new Set();
  return remoteProducts.filter((item) => {
    const key = String(item.productId);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}


