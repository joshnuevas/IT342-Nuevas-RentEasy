import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Check, X, Eye, Clock, ArrowLeft, 
  AlertCircle, Loader2, Search 
} from "lucide-react";
import { getPendingListings, reviewListing } from "./admin.api";

export default function PendingApproval() {
  const navigate = useNavigate();
  const [pendingItems, setPendingItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");

  const fetchPendingProducts = useCallback(async () => {
    try {
      const response = await getPendingListings(token);
      const result = await response.json();
      if (response.ok) {
        setPendingItems(result);
      } else {
        setError(result.error || "Failed to fetch pending items.");
      }
    } catch {
      setError("Server connection failed.");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchPendingProducts();
  }, [fetchPendingProducts]);

  const handleAction = async (productId, status) => {
    try {
      const response = await reviewListing(productId, status, token);
      const result = await response.json();
      if (response.ok && result.success) {
        setPendingItems(pendingItems.filter(item => item.productId !== productId));
      }
    } catch {
      alert("Action failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F2F0] font-sans text-[#4A3428]">
      <header className="h-16 bg-white border-b border-[#D0BCA0] flex items-center justify-between px-6 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/admin-dashboard")} className="p-1 border-2 border-[#D0BCA0] hover:bg-[#F5F2F0]">
            <ArrowLeft size={20} />
          </button>
          <div className="border-2 border-[#4A3428] px-4 py-1.5 font-bold bg-[#FDFBF9]">RentEasy Admin</div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-8">
        <div className="flex items-center justify-between mb-8 border-b-2 border-[#D0BCA0] pb-6">
          <div className="border-2 border-[#4A3428] p-4 bg-white inline-block">
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Clock size={24} /> [Pending Approval Queue]
            </h1>
          </div>
          <div className="text-sm font-bold text-[#8C6A48] uppercase tracking-widest">
            {pendingItems.length} Items Awaiting Review
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#4A3428]" size={40} /></div>
        ) : error ? (
          <div className="border-2 border-red-500 bg-red-50 p-6 text-red-700 flex items-center gap-3 font-bold">
            <AlertCircle /> {error}
          </div>
        ) : pendingItems.length === 0 ? (
          <div className="border-2 border-dashed border-[#D0BCA0] bg-white p-20 text-center">
            <p className="text-[#8C6A48] font-bold">[No listings currently pending approval]</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {pendingItems.map((item) => (
              <div key={item.productId} className="bg-white border-2 border-[#4A3428] flex flex-col md:flex-row shadow-sm hover:shadow-md transition-shadow">
                <div className="w-full md:w-48 h-48 bg-[#F5F2F0] border-r-0 md:border-r-2 border-[#4A3428] flex-shrink-0">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#D0BCA0]"><Search size={32} /></div>
                  )}
                </div>
                
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold uppercase tracking-tight mb-1">{item.name}</h3>
                      <p className="text-sm text-[#8C6A48] mb-2">Submitted by: <span className="font-bold underline">{item.owner?.firstName} {item.owner?.lastName}</span></p>
                      <div className="inline-block border-2 border-[#D0BCA0] px-2 py-0.5 text-[10px] font-bold bg-[#FDFBF9] text-[#8C6A48] uppercase">
                        Category: {item.category}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-[#4A3428]">${item.price}</div>
                      <div className="text-[10px] font-bold text-[#8C6A48] uppercase">Per Day</div>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-3 bg-[#FDFBF9] border-2 border-dashed border-[#D0BCA0] text-sm text-[#8C6A48] line-clamp-2">
                    {item.description}
                  </div>
                </div>

                <div className="w-full md:w-64 p-6 border-t-2 md:border-t-0 md:border-l-2 border-[#4A3428] flex flex-col gap-3 bg-[#FDFBF9] justify-center">
                  <button 
                    onClick={() => handleAction(item.productId, 'APPROVED')}
                    className="w-full bg-[#4A3428] text-white font-bold py-2 flex items-center justify-center gap-2 hover:bg-green-700 border-2 border-[#4A3428] transition-colors"
                  >
                    <Check size={18} /> [Approve Listing]
                  </button>
                  <button 
                    onClick={() => handleAction(item.productId, 'REJECTED')}
                    className="w-full bg-white text-red-600 font-bold py-2 flex items-center justify-center gap-2 hover:bg-red-50 border-2 border-red-600 transition-colors"
                  >
                    <X size={18} /> [Reject Listing]
                  </button>
                  <button className="w-full bg-white text-[#4A3428] font-bold py-2 flex items-center justify-center gap-2 border-2 border-[#4A3428] hover:bg-[#F5F2F0]">
                    <Eye size={18} /> [View Full Details]
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
