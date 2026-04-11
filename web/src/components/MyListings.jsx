import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Search, Plus, List, ShoppingCart, User, 
  Trash2, Loader2, ImageIcon, ArrowLeft, Camera, Edit2, TrendingUp 
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

      <main className="max-w-7xl mx-auto p-6 md:p-8">
        <div className="flex items-center justify-between mb-8 border-b-2 border-[#D0BCA0] pb-6">
          <div className="border-2 border-[#4A3428] p-4 bg-white inline-block">
            <h1 className="text-xl font-bold">[My Listings]</h1>
          </div>
          <button 
            onClick={() => navigate("/create-listing")} 
            className="flex items-center gap-2 bg-[#4A3428] text-white border-2 border-[#4A3428] px-6 py-3 font-bold hover:bg-[#3A281E] transition-colors"
          >
            <Plus size={18} /> [Add New Product]
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-[#8C6A48] w-10 h-10" />
          </div>
        ) : error ? (
          <div className="text-center py-20 border-2 border-red-500 bg-red-50 text-red-700 font-bold p-6">
            <AlertCircle className="w-8 h-8 mb-3 mx-auto" />
            {error}
          </div>
        ) : products.length === 0 ? (
          <div className="border-2 border-[#4A3428] bg-white p-12 mb-10">
            <div className="flex items-center justify-center gap-6 text-center">
              <span className="border-2 border-[#4A3428] px-6 py-3 text-lg font-bold bg-[#FDFBF9]">
                [No Listings Yet]
              </span>
              <span className="border-2 border-[#D0BCA0] px-6 py-3 text-sm text-[#8C6A48] font-medium">
                [Start earning by listing your items for rent]
              </span>
              <button 
                onClick={() => navigate("/create-listing")} 
                className="flex items-center gap-2 bg-[#4A3428] text-white border-2 border-[#4A3428] px-6 py-3 font-bold hover:bg-[#3A281E] transition-colors"
              >
                <Plus size={18} /> [List Your First Product]
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
            {products.map((product) => (
              <div key={product.productId} className="bg-white border-2 border-[#4A3428] flex flex-col group hover:shadow-lg transition-shadow relative">
                <button 
                  onClick={() => handleDelete(product.productId)}
                  className="absolute top-3 right-3 z-10 border-2 border-red-500 p-2.5 text-red-500 bg-white hover:bg-red-500 hover:text-white transition-all shadow-md"
                  title="Delete Listing"
                >
                  <Trash2 size={18} />
                </button>
                <div className="h-64 bg-[#F5F2F0] border-b-2 border-[#4A3428] flex flex-col items-center justify-center text-[#8C6A48] overflow-hidden relative">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center opacity-40">
                      <ImageIcon size={40} className="mb-3" />
                      <span className="text-sm font-medium">[No Image]</span>
                    </div>
                  )}
                </div>
                <div className="p-4 flex flex-col gap-3">
                  <div className="border-2 border-[#4A3428] px-3 py-2 text-[#4A3428] font-bold text-sm bg-[#FDFBF9] truncate">
                    {product.name}
                  </div>
                  <div className="flex gap-4">
                    <div className="border-2 border-[#D0BCA0] px-3 py-2 text-[#8C6A48] text-sm font-medium flex-1">
                      ${Number(product.price).toFixed(2)}/day
                    </div>
                    <div className="border-2 border-[#D0BCA0] px-3 py-2 text-[#8C6A48] text-sm font-medium flex-1">
                      Stock: {product.stock}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="border-2 border-[#4A3428] bg-white p-8">
          <div className="border-2 border-[#4A3428] px-4 py-2 inline-block mb-8 bg-[#FDFBF9]">
            <h2 className="text-lg font-bold text-[#4A3428]">[Listing Tips]</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border-2 border-[#D0BCA0] bg-[#FDFBF9] p-6 flex flex-col items-start gap-4">
              <div className="border-2 border-[#4A3428] px-3 py-1 font-bold text-sm bg-white">[High-Quality Photos]</div>
              <p className="text-sm text-[#8C6A48]">[Use clear, well-lit images]</p>
            </div>
            <div className="border-2 border-[#D0BCA0] bg-[#FDFBF9] p-6 flex flex-col items-start gap-4">
              <div className="border-2 border-[#4A3428] px-3 py-1 font-bold text-sm bg-white">[Detailed Description]</div>
              <p className="text-sm text-[#8C6A48]">[Include all important details]</p>
            </div>
            <div className="border-2 border-[#D0BCA0] bg-[#FDFBF9] p-6 flex flex-col items-start gap-4">
              <div className="border-2 border-[#4A3428] px-3 py-1 font-bold text-sm bg-white">[Competitive Pricing]</div>
              <p className="text-sm text-[#8C6A48]">[Research similar items]</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}