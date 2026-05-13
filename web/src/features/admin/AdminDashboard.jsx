import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BarChart3,
  Box,
  Check,
  Clock,
  LayoutDashboard,
  LogOut,
  ShoppingCart,
  Users,
  X,
} from "lucide-react";
import { getPendingListings as getPendingListingsApi, reviewListing } from "./admin.api";
import {
  demoOrders,
  deleteStoredListing,
  formatCurrency,
  getPendingListings,
  getProfile,
  getStoredListings,
  getStoredOrders,
  normalizeProduct,
  saveStoredOrders,
  updateStoredListingStatus,
} from "../../shared/rentEasyData";
import { deleteProduct, getAllProducts } from "../listings/listings.api";

const tabs = [
  { id: "dashboard", label: "[Dashboard]", icon: LayoutDashboard },
  { id: "products", label: "[Products]", icon: Box },
  { id: "pending", label: "[Pending Approval]", icon: Clock },
  { id: "orders", label: "[Orders]", icon: ShoppingCart },
  { id: "users", label: "[Users]", icon: Users },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [remotePending, setRemotePending] = useState([]);
  const [remoteProducts, setRemoteProducts] = useState([]);
  const [orders, setOrders] = useState(() => [...getStoredOrders(), ...demoOrders]);
  const [isLoading, setIsLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const [, setLocalVersion] = useState(0);
  const token = localStorage.getItem("token");
  const profile = getProfile();
  const pendingItems = getPendingListings(remotePending);
  const productItems = mergeProducts(
    remoteProducts.map(normalizeProduct).map((item) => ({ ...item, source: "database" })),
    getStoredListings().map(normalizeProduct).map((item) => ({ ...item, source: "local" }))
  );

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
      updateStoredListingStatus(id, status);
    }

    updateStoredListingStatus(id, status);
    setRemotePending((prev) => prev.filter((item) => String(item.productId) !== String(id)));
    setRemoteProducts((prev) =>
      prev.map((item) => (String(item.productId) === String(id) ? { ...item, status } : item))
    );
    setLocalVersion((version) => version + 1);
    setNotice(status === "APPROVED" ? "[Listing Approved]" : "[Listing Rejected]");
    setTimeout(() => setNotice(""), 1600);
  };

  const handleDeleteProduct = async (item) => {
    try {
      if (item.source === "database") {
        const response = await deleteProduct(item.productId, token);
        if (!response.ok) throw new Error("Delete failed.");
      }
      deleteStoredListing(item.productId);
      setRemoteProducts((prev) => prev.filter((product) => String(product.productId) !== String(item.productId)));
      setLocalVersion((version) => version + 1);
      setNotice("[Product Removed]");
      setTimeout(() => setNotice(""), 1600);
    } catch {
      setNotice("[Product Remove Failed]");
      setTimeout(() => setNotice(""), 1600);
    }
  };

  const handleOrderStatus = (orderNumber, status) => {
    const nextOrders = orders.map((order) => (order.orderNumber === orderNumber ? { ...order, status } : order));
    setOrders(nextOrders);
    saveStoredOrders(nextOrders.filter((order) => !demoOrders.some((demo) => demo.orderNumber === order.orderNumber)));
  };

  return (
    <div className="min-h-screen bg-[#F5F2F0] font-sans text-[#4A3428]">
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-[#D0BCA0] bg-white px-6">
        <button
          type="button"
          className="border-2 border-[#4A3428] bg-[#FDFBF9] px-4 py-1.5 font-bold"
          onClick={() => navigate("/home")}
        >
          RentEasy [ADMIN]
        </button>
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-2 border-2 border-[#4A3428] px-3 py-1.5 text-sm font-bold hover:bg-[#4A3428] hover:text-white"
        >
          <LogOut size={16} />
          [Logout]
        </button>
      </header>

      <div className="flex min-h-[calc(100vh-4rem)]">
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-64 shrink-0 border-r-2 border-[#D0BCA0] bg-white p-6 md:block">
          <div className="mb-8 border-2 border-[#4A3428] bg-[#FDFBF9] p-4 text-center">
            <h1 className="text-xl font-bold uppercase">Admin Panel</h1>
            <p className="mt-2 text-xs font-bold text-[#8C6A48]">{profile.name}</p>
          </div>

          <nav className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex w-full items-center gap-3 border-2 p-3 text-left text-sm font-bold ${
                  activeTab === tab.id
                    ? "border-[#4A3428] bg-[#4A3428] text-white"
                    : "border-[#D0BCA0] hover:bg-[#F5F2F0]"
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => navigate("/home")}
              className="mt-8 flex w-full items-center gap-3 border-2 border-dashed border-[#D0BCA0] p-3 text-sm font-bold text-[#8C6A48] hover:bg-[#FDFBF9]"
            >
              <ArrowLeft size={18} />
              [Back to Site]
            </button>
          </nav>
        </aside>

        <main className="flex-1 p-6 md:p-8">
          <div className="mb-6 flex flex-wrap gap-2 md:hidden">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`border-2 px-3 py-2 text-xs font-bold ${
                  activeTab === tab.id ? "border-[#4A3428] bg-[#4A3428] text-white" : "border-[#D0BCA0] bg-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {notice && (
            <div className="mb-5 inline-block border-2 border-[#D0BCA0] bg-white px-4 py-3 text-sm font-bold">
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
              onView={(item) => navigate(`/products/${item.productId}`, { state: { product: item } })}
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
      <Title>[Dashboard Overview]</Title>
      <div className="mb-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="[Total Orders]" value={orders} />
        <Metric label="[Revenue]" value={formatCurrency(revenue)} />
        <Metric label="[Products]" value={products} />
        <Metric label="[Pending]" value={pending} />
      </div>

      <section className="border-2 border-[#4A3428] bg-white p-8 shadow-sm">
        <div className="mb-8 inline-flex items-center gap-2 border-2 border-[#4A3428] bg-[#FDFBF9] px-4 py-2 font-bold">
          <BarChart3 size={20} />
          [Revenue Chart]
        </div>
        <div className="flex h-96 flex-col items-center justify-center border-2 border-dashed border-[#D0BCA0] bg-[#FDFBF9] text-[#8C6A48]">
          <BarChart3 size={48} className="mb-4 opacity-40" />
          <div className="border-2 border-[#D0BCA0] bg-white px-6 py-2 text-sm font-bold">
            [Chart Visualization Area]
          </div>
        </div>
      </section>
    </>
  );
}

function ProductsView({ items, isLoading, onView, onDelete }) {
  return (
    <section>
      <Title>[Products]</Title>
      <div className="overflow-x-auto border-2 border-[#4A3428] bg-white p-4 shadow-sm">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b-2 border-[#4A3428] bg-[#FDFBF9]">
            <tr>
              <th className="px-3 py-3">[Product]</th>
              <th className="px-3 py-3">[Category]</th>
              <th className="px-3 py-3">[Price]</th>
              <th className="px-3 py-3">[Stock]</th>
              <th className="px-3 py-3">[Status]</th>
              <th className="px-3 py-3">[Actions]</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={`${item.source}-${item.productId}`} className="border-b border-[#D0BCA0]">
                <td className="px-3 py-4 font-bold uppercase">{item.name}</td>
                <td className="px-3 py-4">{item.category}</td>
                <td className="px-3 py-4">{formatCurrency(item.price)}</td>
                <td className="px-3 py-4">{item.stock}</td>
                <td className="px-3 py-4">{item.status}</td>
                <td className="px-3 py-4">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => onView(item)}
                      className="border-2 border-[#4A3428] px-3 py-2 text-xs font-bold hover:bg-[#F5F2F0]"
                    >
                      [View]
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(item)}
                      className="border-2 border-red-600 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50"
                    >
                      [Remove]
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan="6" className="px-3 py-10 text-center font-bold text-[#8C6A48]">
                  {isLoading ? "[Loading products...]" : "[No products found]"}
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
      <Title>[Pending Approval Queue]</Title>
      <div className="space-y-6">
        {items.map((item) => (
          <article key={item.productId} className="flex flex-col border-2 border-[#4A3428] bg-white shadow-sm md:flex-row">
            <div className="h-48 bg-[#F5F2F0] md:w-48 md:border-r-2 md:border-[#4A3428]">
              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-sm font-bold text-[#8C6A48]">[No Image]</div>
              )}
            </div>
            <div className="flex-1 p-6">
              <h3 className="text-lg font-bold uppercase">{item.name}</h3>
              <p className="mt-1 text-sm text-[#8C6A48]">By: {item.owner?.firstName} {item.owner?.lastName}</p>
              <p className="mt-4 text-xl font-bold">{formatCurrency(item.price)}</p>
            </div>
            <div className="grid gap-3 border-t-2 border-[#4A3428] bg-[#FDFBF9] p-6 md:w-64 md:border-l-2 md:border-t-0">
              <button
                type="button"
                onClick={() => onReview(item.productId, "APPROVED")}
                className="flex items-center justify-center gap-2 border-2 border-[#4A3428] bg-[#4A3428] py-2 font-bold text-white hover:bg-[#3E2B22]"
              >
                <Check size={18} />
                [Approve]
              </button>
              <button
                type="button"
                onClick={() => onReview(item.productId, "REJECTED")}
                className="flex items-center justify-center gap-2 border-2 border-red-600 bg-white py-2 font-bold text-red-600 hover:bg-red-50"
              >
                <X size={18} />
                [Reject]
              </button>
            </div>
          </article>
        ))}

        {items.length === 0 && (
          <div className="border-2 border-dashed border-[#D0BCA0] bg-white p-20 text-center font-bold text-[#8C6A48]">
            {isLoading ? "[Loading pending listings...]" : "[No listings awaiting review]"}
          </div>
        )}
      </div>
    </section>
  );
}

function OrdersView({ orders, onStatusChange }) {
  return (
    <section>
      <Title>[Orders]</Title>
      <div className="space-y-4">
        {orders.map((order) => (
          <article key={order.orderNumber} className="border-2 border-[#4A3428] bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-bold">{order.orderNumber}</p>
                <p className="text-sm text-[#8C6A48]">{order.items?.length || 0} item(s)</p>
              </div>
              <div className="text-left sm:text-right">
                <p className="font-bold">{formatCurrency(order.total)}</p>
                <select
                  value={order.status}
                  onChange={(event) => onStatusChange(order.orderNumber, event.target.value)}
                  className="mt-2 border-2 border-[#4A3428] bg-white px-3 py-2 text-sm font-bold outline-none"
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
      <Title>[Users]</Title>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="border-2 border-[#4A3428] bg-white p-5 shadow-sm">
          <p className="font-bold uppercase">[Admin Account]</p>
          <p className="mt-2 text-sm text-[#8C6A48]">{profile.email}</p>
        </div>
        <div className="border-2 border-[#4A3428] bg-white p-5 shadow-sm">
          <p className="font-bold uppercase">[Role]</p>
          <p className="mt-2 text-sm text-[#8C6A48]">ADMIN</p>
        </div>
      </div>
    </section>
  );
}

function Title({ children }) {
  return (
    <div className="mb-10 inline-block border-2 border-[#4A3428] bg-white px-4 py-2 shadow-sm">
      <h2 className="text-xl font-bold">{children}</h2>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="flex flex-col items-center border-2 border-[#4A3428] bg-white p-6 shadow-sm">
      <div className="mb-5 border-2 border-[#D0BCA0] bg-[#FDFBF9] px-3 py-1 text-sm font-bold text-[#8C6A48]">
        {label}
      </div>
      <div className="border-2 border-[#4A3428] p-4 text-3xl font-bold">{value}</div>
    </div>
  );
}

function mergeProducts(remoteProducts, localProducts) {
  const seen = new Set();
  return [...remoteProducts, ...localProducts].filter((item) => {
    const key = String(item.productId);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
