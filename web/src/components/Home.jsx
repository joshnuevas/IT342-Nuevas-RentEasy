import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Search, Plus, List, ShoppingCart, User, Image as ImageIcon, Loader2, AlertCircle
} from "lucide-react";

export default function Home() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const currentUserEmail = localStorage.getItem("userEmail");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/products/all-approved");
        const result = await response.json();

        if (Array.isArray(result)) {
          setProducts(result); 
        } else {
          setError("Failed to load products.");
        }
      } catch {
        setError("Cannot connect to server. Check if Spring Boot is running.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#F5F2F0] font-sans text-[#4A3428]">
      <header className="h-16 bg-white border-b border-[#D0BCA0] flex items-center justify-between px-6 sticky top-0 z-10">
        <div className="border-2 border-[#4A3428] px-4 py-1.5 font-bold text-[#4A3428] tracking-wide bg-[#FDFBF9]">
          RentEasy
        </div>

        <div className="flex-1 max-w-2xl mx-8 relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C6A48]" />
          <input 
            type="text" 
            placeholder="[Search]" 
            className="w-full border-2 border-[#D0BCA0] rounded-none py-1.5 pl-10 pr-4 text-sm bg-white focus:outline-none focus:border-[#4A3428] text-[#4A3428] transition-colors"
          />
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate("/create-listing")}
            className="hidden sm:flex border-2 border-[#4A3428] px-3 py-1.5 items-center gap-2 text-sm font-medium hover:bg-[#F5F2F0] transition-colors"
          >
            <Plus size={16} /> [List Item]
          </button>
          
          <button 
            onClick={() => navigate("/my-listings")}
            className="border-2 border-[#4A3428] p-1.5 hover:bg-[#F5F2F0] transition-colors"
            title="My Listings"
          >
            <List size={18} />
          </button>

          <button className="border-2 border-[#4A3428] p-1.5 hover:bg-[#F5F2F0] transition-colors relative">
            <ShoppingCart size={18} />
          </button>
          
          <button className="border-2 border-[#4A3428] p-1.5 hover:bg-[#F5F2F0] transition-colors">
            <User size={18} />
          </button>
          
          <button onClick={handleLogout} className="border-2 border-[#4A3428] px-3 py-1.5 text-sm font-medium hover:bg-[#4A3428] hover:text-white transition-colors">
            [Logout]
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 md:p-8">
        <div className="border-2 border-[#4A3428] p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8 bg-white">
          <h1 className="border-2 border-[#4A3428] px-6 py-2 text-xl font-bold text-[#4A3428] bg-[#FDFBF9]">Product Listing</h1>
          <span className="border-2 border-[#D0BCA0] px-4 py-2 text-sm text-[#8C6A48] font-medium">[Browse rental products]</span>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-[#8C6A48]">
            <Loader2 className="w-10 h-10 animate-spin mb-4" />
            <p className="font-bold border-2 border-[#D0BCA0] px-4 py-2 bg-white">Loading database...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-red-700">
              <AlertCircle className="w-10 h-10 mb-3" />
              <p className="font-bold border-2 border-red-500 p-4 bg-white">{error}</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-[#D0BCA0] bg-white">
            <p className="text-[#8C6A48] font-bold mb-4">[No listings yet]</p>
            <button onClick={() => navigate("/create-listing")} className="border-2 border-[#4A3428] px-4 py-2 text-sm font-medium hover:bg-[#4A3428] hover:text-white transition-colors">Be the first to list!</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <ProductCard 
                key={product.productId} 
                name={product.name} 
                price={product.price} 
                imageUrl={product.imageUrl}
                owner={product.owner} 
                currentUserEmail={currentUserEmail} 
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function ProductCard({ name, price, imageUrl, owner, currentUserEmail }) {
  const isOwner = owner?.email === currentUserEmail;

  return (
    <div className="bg-white border-2 border-[#4A3428] flex flex-col group hover:shadow-lg transition-shadow">
      <div className="h-64 bg-[#F5F2F0] border-b-2 border-[#4A3428] flex flex-col items-center justify-center text-[#8C6A48] overflow-hidden relative">
        {imageUrl ? (
          <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
        ) : (
          <>
            <ImageIcon size={40} className="mb-3 opacity-40 group-hover:opacity-60" />
            <span className="text-sm font-medium opacity-60">[Product Image]</span>
          </>
        )}
      </div>
      <div className="p-4 flex flex-col gap-3">
        <div className="border-2 border-[#4A3428] px-3 py-2 text-[#4A3428] font-bold text-sm bg-[#FDFBF9] truncate">{name}</div>
        <div className="border-2 border-[#D0BCA0] px-3 py-2 text-[#8C6A48] text-sm font-medium">${Number(price).toFixed(2)}/day</div>
        
        {isOwner ? (
          <button 
            disabled 
            className="w-full mt-2 py-2.5 border-2 border-gray-300 bg-gray-100 text-gray-400 font-bold cursor-not-allowed"
            title="You cannot rent your own item"
          >
            [Cannot Add Own Item]
          </button>
        ) : (
          <button className="w-full mt-2 py-2.5 border-2 border-[#4A3428] text-[#4A3428] font-bold hover:bg-[#4A3428] hover:text-white transition-colors">
            [Add to Cart]
          </button>
        )}
      </div>
    </div>
  );
}