import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Search, Plus, List, ShoppingCart, User, 
  Image as ImageIcon, Loader2, AlertCircle 
} from "lucide-react";
import { addCartItem, getCart } from "../cart/cart.api";
import { getApprovedProducts } from "./listings.api";

export default function Home() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [cartItemIds, setCartItemIds] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const currentUserEmail = localStorage.getItem("userEmail");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const prodRes = await getApprovedProducts();
        if (!prodRes.ok) throw new Error("Failed to load products.");
        const prodData = await prodRes.json();
        setProducts(prodData);

        if (currentUserEmail && token) {
          const cartRes = await getCart(currentUserEmail, token);
          if (cartRes.ok) {
            const cartData = await cartRes.json();
            const ids = new Set(cartData.map(item => item.product.productId));
            setCartItemIds(ids);
          }
        }
      } catch (err) {
        setError(err.message || "Cannot connect to server.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [currentUserEmail, token]);

  const addToCart = async (productId) => {
    try {
      const response = await addCartItem(productId, currentUserEmail, token);

      if (response.ok) {
        setCartItemIds(prev => new Set(prev).add(productId));
        navigate("/cart");
      } else {
        const errorMsg = await response.text();
        alert(errorMsg || "Failed to add to cart.");
      }
    } catch (err) {
      console.error("Cart error:", err);
      alert("Server connection failed.");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#F5F2F0] font-sans text-[#4A3428]">
      <header className="h-16 bg-white border-b border-[#D0BCA0] flex items-center justify-between px-6 sticky top-0 z-10">
        <div 
          className="border-2 border-[#4A3428] px-4 py-1.5 font-bold tracking-wide bg-[#FDFBF9] cursor-pointer" 
          onClick={() => navigate("/home")}
        >
          RentEasy
        </div>

        <div className="flex-1 max-w-2xl mx-8 relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C6A48]" />
          <input 
            type="text" 
            placeholder="[Search]" 
            className="w-full border-2 border-[#D0BCA0] py-1.5 pl-10 pr-4 text-sm bg-white focus:outline-none focus:border-[#4A3428]"
          />
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate("/create-listing")}
            className="hidden sm:flex border-2 border-[#4A3428] px-3 py-1.5 items-center gap-2 text-sm font-medium hover:bg-[#F5F2F0]"
          >
            <Plus size={16} /> [List Item]
          </button>
          
          <button 
            onClick={() => navigate("/my-listings")}
            className="border-2 border-[#4A3428] p-1.5 hover:bg-[#F5F2F0]"
            title="My Listings"
          >
            <List size={18} />
          </button>
          
          <button 
            onClick={() => navigate("/cart")} 
            className="border-2 border-[#4A3428] p-1.5 hover:bg-[#F5F2F0] relative"
          >
            <ShoppingCart size={18} />
          </button>
          
          <button 
            onClick={() => navigate("/profile")}
            className="border-2 border-[#4A3428] p-1.5 hover:bg-[#F5F2F0]"
          >
            <User size={18} />
          </button>

          <button onClick={handleLogout} className="border-2 border-[#4A3428] px-3 py-1.5 text-sm font-bold hover:bg-[#4A3428] hover:text-white">
            [Logout]
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-8">
        <div className="border-2 border-[#4A3428] p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8 bg-white shadow-sm">
          <h1 className="border-2 border-[#4A3428] px-6 py-2 text-xl font-bold bg-[#FDFBF9]">Product Listing</h1>
          <span className="border-2 border-[#D0BCA0] px-4 py-2 text-sm text-[#8C6A48] font-medium">[Browse rental products]</span>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-[#8C6A48]">
            <Loader2 className="w-10 h-10 animate-spin mb-4" />
            <p className="font-bold border-2 border-[#D0BCA0] px-4 py-2 bg-white text-sm">Loading database...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-red-700">
            <AlertCircle className="w-10 h-10 mb-3" />
            <p className="font-bold border-2 border-red-500 p-4 bg-white text-sm">{error}</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-[#D0BCA0] bg-white">
            <p className="text-[#8C6A48] font-bold">[No approved listings yet]</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <ProductCard 
                key={product.productId} 
                product={product} 
                currentUserEmail={currentUserEmail} 
                isInCart={cartItemIds.has(product.productId)}
                addToCart={addToCart} 
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function ProductCard({ product, currentUserEmail, isInCart, addToCart }) {
  const isOwner = product.owner?.email === currentUserEmail;

  let buttonText = "[Add to Cart]";
  let isDisabled = false;

  if (isOwner) {
    buttonText = "[Your Listing]";
    isDisabled = true;
  } else if (isInCart) {
    buttonText = "[In Cart]";
    isDisabled = true;
  }

  return (
    <div className="bg-white border-2 border-[#4A3428] flex flex-col group hover:shadow-lg transition-shadow">
      <div className="h-64 bg-[#F5F2F0] border-b-2 border-[#4A3428] flex items-center justify-center overflow-hidden">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <ImageIcon size={40} className="text-[#8C6A48] opacity-40" />
        )}
      </div>
      <div className="p-4 flex flex-col gap-3">
        <div className="border-2 border-[#4A3428] px-3 py-2 font-bold text-sm bg-[#FDFBF9] truncate uppercase">
          {product.name}
        </div>
        <div className="border-2 border-[#D0BCA0] px-3 py-2 text-[#8C6A48] text-sm font-medium">
          ${Number(product.price).toFixed(2)} / day
        </div>
        
        <button 
          disabled={isDisabled}
          onClick={() => addToCart(product.productId)}
          className={`w-full py-2.5 border-2 font-bold transition-colors uppercase text-sm ${
            isDisabled 
              ? "border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed" 
              : "border-[#4A3428] text-[#4A3428] hover:bg-[#4A3428] hover:text-white"
          }`}
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
}
