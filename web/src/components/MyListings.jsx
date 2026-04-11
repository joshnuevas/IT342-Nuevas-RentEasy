import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Search, Plus, List, ShoppingCart, User, 
  Trash2, Loader2, AlertCircle, ArrowLeft 
} from "lucide-react";

export default function MyListings() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const currentUserId = 1;

  useEffect(() => {
    fetchMyProducts();
  }, []);

  const fetchMyProducts = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/products");
      const result = await response.json();
      
      if (result.success) {
        const myItems = result.data.filter(p => {
          const ownerId = p.owner?.userID; 
          return Number(ownerId) === Number(currentUserId);
        });
        setProducts(myItems);
      } else {
        setError(result.error || "Failed to load listings.");
      }
    } catch (err) {
      setError("Failed to connect to server.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this listing?")) return;

    try {
      const response = await fetch(`http://localhost:8080/api/products/${productId}`, {
        method: "DELETE",
      });
      const result = await response.json();

      if (result.success) {
        setProducts(products.filter(p => p.productId !== productId));
      } else {
        alert("Error deleting product: " + result.error);
      }
    } catch (err) {
      alert("Could not connect to server to delete.");
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F2F0] font-sans text-[#4A3428]">
      <header className="h-16 bg-white border-b border-[#D0BCA0] flex items-center justify-between px-6 sticky top-0 z-10">
        <div 
          className="border-2 border-[#4A3428] px-4 py-1.5 font-bold cursor-pointer bg-[#FDFBF9]" 
          onClick={() => navigate("/home")}
        >
          RentEasy
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate("/create-listing")} 
            className="hidden sm:flex border-2 border-[#4A3428] px-3 py-1.5 items-center gap-2 text-sm font-medium hover:bg-[#F5F2F0] transition-colors"
          >
            <Plus size={16} /> [List Item]
          </button>
          <button 
            onClick={() => navigate("/home")} 
            className="border-2 border-[#4A3428] p-1.5 hover:bg-[#F5F2F0] transition-colors"
          >
            <List size={18} />
          </button>
          <button className="border-2 border-[#4A3428] p-1.5 bg-[#4A3428] text-white">
            <User size={18} />
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6 md:p-8">
        <button 
          onClick={() => navigate("/home")} 
          className="flex items-center gap-2 text-sm font-bold mb-6 hover:underline"
        >
          <ArrowLeft size={16} /> Back to Browse
        </button>

        <div className="border-2 border-[#4A3428] p-4 bg-white mb-8">
          <h1 className="text-xl font-bold">[My Listings]</h1>
          <p className="text-sm text-[#8C6A48]">Manage or remove your active rental items.</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-[#8C6A48]" />
          </div>
        ) : error ? (
          <div className="text-center py-20 border-2 border-red-500 bg-white text-red-600 font-bold p-4">
            {error}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-[#D0BCA0] bg-white">
            <p className="font-bold mb-4 text-[#8C6A48]">You haven't listed anything yet.</p>
            <button 
              onClick={() => navigate("/create-listing")} 
              className="border-2 border-[#4A3428] px-4 py-2 text-sm font-bold hover:bg-[#4A3428] hover:text-white transition-colors"
            >
              Create Your First Listing
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {products.map((product) => (
              <div key={product.productId} className="bg-white border-2 border-[#4A3428] p-4 flex items-center gap-6 group hover:shadow-md transition-shadow">
                <div className="w-24 h-24 bg-[#F5F2F0] border-2 border-[#4A3428] flex-shrink-0 overflow-hidden">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#8C6A48] opacity-40">
                      <List size={32} />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{product.name}</h3>
                  <div className="flex gap-4 mt-1">
                    <span className="text-[#8C6A48] text-sm font-medium border border-[#D0BCA0] px-2 bg-[#FDFBF9]">
                      ${Number(product.price).toFixed(2)}/day
                    </span>
                    <span className="text-[#8C6A48] text-sm font-medium border border-[#D0BCA0] px-2 bg-[#FDFBF9]">
                      Stock: {product.stock}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => handleDelete(product.productId)}
                  className="border-2 border-red-500 p-3 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                  title="Delete Listing"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}