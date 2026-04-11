import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  LogOut, LayoutDashboard, Box, Clock, 
  ShoppingCart, Users, ArrowLeft, BarChart3, Check, X 
} from "lucide-react";

const DashboardOverview = () => (
  <>
    <div className="border-2 border-[#4A3428] px-4 py-2 inline-block mb-10 bg-white shadow-md">
      <h2 className="text-xl font-bold">[Dashboard Overview]</h2>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
      {[
        { label: "[Total Orders]", value: "247" },
        { label: "[Revenue]", value: "$12,450" },
        { label: "[Products]", value: "89" },
        { label: "[Active Users]", value: "1,234" },
      ].map(card => (
        <div key={card.label} className="bg-white border-2 border-[#4A3428] p-6 shadow-sm flex flex-col items-center">
          <div className="border-2 border-[#D0BCA0] px-3 py-1 text-sm text-[#8C6A48] font-medium mb-5 bg-[#FDFBF9]">
            {card.label}
          </div>
          <div className="border-2 border-[#4A3428] p-4 font-bold text-4xl text-[#4A3428]">
            {card.value}
          </div>
        </div>
      ))}
    </div>
    <div className="bg-white border-2 border-[#4A3428] p-8">
      <div className="border-2 border-[#4A3428] px-4 py-2 inline-block mb-8 bg-[#FDFBF9]">
        <h3 className="text-lg font-bold flex items-center gap-2"><BarChart3 size={20} /> [Revenue Chart]</h3>
      </div>
      <div className="h-96 border-2 border-dashed border-[#D0BCA0] bg-[#FDFBF9] flex flex-col items-center justify-center text-[#8C6A48]">
        <BarChart3 size={48} className="opacity-40 mb-4" />
        <div className="border-2 border-[#D0BCA0] px-6 py-2 bg-white font-medium text-sm">[Chart Visualization Area]</div>
      </div>
    </div>
  </>
);

const PendingView = ({ items, onAction }) => (
  <>
    <div className="border-2 border-[#4A3428] px-4 py-2 inline-block mb-10 bg-white shadow-md">
      <h2 className="text-xl font-bold">[Pending Approval Queue]</h2>
    </div>
    <div className="space-y-6">
      {items.length === 0 ? (
        <div className="border-2 border-dashed border-[#D0BCA0] bg-white p-20 text-center font-bold text-[#8C6A48]">
          [No listings awaiting review]
        </div>
      ) : (
        items.map(item => (
          <div key={item.productId} className="bg-white border-2 border-[#4A3428] flex flex-col md:flex-row shadow-sm">
            <div className="w-full md:w-48 h-48 bg-[#F5F2F0] border-r-2 border-[#4A3428] flex-shrink-0">
              <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold uppercase">{item.name}</h3>
                <p className="text-sm text-[#8C6A48]">By: {item.owner?.firstName} {item.owner?.lastName}</p>
              </div>
              <div className="text-xl font-bold mt-4">${item.price}</div>
            </div>
            <div className="w-full md:w-64 p-6 border-l-2 border-[#4A3428] flex flex-col gap-3 bg-[#FDFBF9]">
              <button 
                onClick={() => onAction(item.productId, "APPROVED")}
                className="w-full bg-[#4A3428] text-white font-bold py-2 border-2 border-[#4A3428] hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <Check size={18} /> [Approve]
              </button>
              <button 
                onClick={() => onAction(item.productId, "REJECTED")}
                className="w-full bg-white text-red-600 font-bold py-2 border-2 border-red-600 hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
              >
                <X size={18} /> [Reject]
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  </>
);

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [pendingItems, setPendingItems] = useState([]);

  useEffect(() => {
    let isMounted = true;

    if (activeTab === "pending") {
      const loadPendingItems = async () => {
        try {
          const response = await fetch("http://localhost:8080/api/products/pending");
          if (response.ok) {
            const data = await response.json();
            if (isMounted) {
              setPendingItems(data);
            }
          }
        } catch (err) {
          console.error(err);
        }
      };
      
      loadPendingItems();
    }

    return () => {
      isMounted = false;
    };
  }, [activeTab]);

  const handleAction = async (id, status) => {
    try {
      const response = await fetch(`http://localhost:8080/api/products/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (response.ok) {
        setPendingItems(prev => prev.filter(item => item.productId !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const sideBarItems = [
    { id: "dashboard", label: "[Dashboard]", icon: LayoutDashboard },
    { id: "products", label: "[Products]", icon: Box },
    { id: "pending", label: "[Pending Approval]", icon: Clock },
    { id: "orders", label: "[Orders]", icon: ShoppingCart },
    { id: "users", label: "[Users]", icon: Users },
  ];

  return (
    <div className="min-h-screen bg-[#F5F2F0] font-sans text-[#4A3428]">
      <header className="h-16 bg-white border-b border-[#D0BCA0] flex items-center justify-between px-6 sticky top-0 z-10">
        <div className="border-2 border-[#4A3428] px-4 py-1.5 font-bold cursor-pointer bg-[#FDFBF9]" onClick={() => navigate("/home")}>
          RentEasy [ADMIN]
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleLogout} className="border-2 border-[#4A3428] px-3 py-1.5 text-sm font-bold hover:bg-[#4A3428] hover:text-white flex items-center gap-2">
            <LogOut size={16} /> [Logout]
          </button>
        </div>
      </header>

      <div className="flex">
        <aside className="w-64 bg-white border-r-2 border-[#D0BCA0] p-6 space-y-8 sticky top-16 h-[calc(100vh-4rem)]">
          <div className="border-2 border-[#4A3428] p-4 text-center bg-[#FDFBF9]">
            <h1 className="text-xl font-bold uppercase tracking-tight">Admin Panel</h1>
          </div>
          <nav className="space-y-2">
            {sideBarItems.map(item => (
              <button 
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full border-2 p-3 flex items-center gap-3 text-sm font-bold transition-all ${
                  activeTab === item.id 
                    ? "bg-[#4A3428] text-white border-[#4A3428] translate-x-1" 
                    : "border-[#D0BCA0] hover:bg-[#F5F2F0]"
                }`}
              >
                <item.icon size={18} /> {item.label}
              </button>
            ))}
            <button onClick={() => navigate("/home")} className="w-full border-2 border-dashed border-[#D0BCA0] p-3 flex items-center gap-3 text-sm font-bold mt-10 text-[#8C6A48] hover:bg-[#FDFBF9]">
              <ArrowLeft size={18} /> [Back to Site]
            </button>
          </nav>
        </aside>

        <main className="flex-1 p-8">
          {activeTab === "dashboard" && <DashboardOverview />}
          {activeTab === "pending" && <PendingView items={pendingItems} onAction={handleAction} />}
          {activeTab !== "dashboard" && activeTab !== "pending" && (
            <div className="border-2 border-dashed border-[#D0BCA0] p-20 text-center text-[#8C6A48]">
              [Section {activeTab.toUpperCase()} coming soon]
            </div>
          )}
        </main>
      </div>
    </div>
  );
}