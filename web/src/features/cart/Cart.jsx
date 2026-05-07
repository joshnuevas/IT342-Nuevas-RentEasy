import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Search, Plus, List, ShoppingCart, User, 
  Image as ImageIcon, Loader2, X 
} from "lucide-react";
import { deleteCartItem, getCart, updateCartQuantity } from "./cart.api";

export default function Cart() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const userEmail = localStorage.getItem("userEmail");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await getCart(userEmail, token);
        const data = await response.json();
        setItems(data);
      } catch (err) {
        console.error("Failed to fetch cart", err);
      } finally {
        setIsLoading(false);
      }
    };
    if (userEmail && token) fetchCart();
  }, [userEmail, token]);

  const updateQty = async (id, newQty) => {
    if (newQty < 1) return;
    try {
      await updateCartQuantity(id, newQty, token);
      setItems(prev => prev.map(i => i.id === id ? { ...i, quantity: newQty } : i));
    } catch (err) {
      console.error("Update failed", err);
    }
  };

  const removeItem = async (id) => {
    try {
      await deleteCartItem(id, token);
      setItems(prev => prev.filter(i => i.id !== id));
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const calculateTotal = () => {
    return items.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  };

  return (
    <div className="min-h-screen bg-[#F5F2F0] font-sans text-[#4A3428]">
      {/* HEADER */}
      <header className="h-16 bg-white border-b border-[#D0BCA0] flex items-center justify-between px-6 sticky top-0 z-10">
        <div className="border-2 border-[#4A3428] px-4 py-1.5 font-bold cursor-pointer" onClick={() => navigate("/home")}>
          RentEasy
        </div>
        <div className="flex-1 max-w-2xl mx-8 relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C6A48]" />
          <input type="text" placeholder="[Search]" className="w-full border-2 border-[#D0BCA0] py-1.5 pl-10 pr-4 text-sm bg-white outline-none focus:border-[#4A3428]" />
        </div>
        <div className="flex items-center gap-3">
          <button className="border-2 border-[#4A3428] p-1.5" onClick={() => navigate("/create-listing")}><Plus size={18} /></button>
          <button className="border-2 border-[#4A3428] p-1.5" onClick={() => navigate("/my-listings")}><List size={18} /></button>
          <button className="border-2 border-[#4A3428] p-1.5 bg-[#4A3428] text-white"><ShoppingCart size={18} /></button>
          <button className="border-2 border-[#4A3428] p-1.5"><User size={18} /></button>
          <button className="border-2 border-[#4A3428] px-3 py-1.5 text-sm font-bold" onClick={() => {localStorage.clear(); navigate("/login")}}>Logout</button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-8">
        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="border-2 border-[#4A3428] bg-white p-12 flex flex-col items-center gap-6 shadow-sm w-full max-md text-center">
              <div className="border-2 border-[#4A3428] px-8 py-3 font-bold text-2xl uppercase">[Cart Empty]</div>
              <div className="border border-[#D0BCA0] px-4 py-1 text-sm text-[#8C6A48]">[No items in cart]</div>
              <button 
                onClick={() => navigate("/home")}
                className="border-2 border-[#4A3428] px-8 py-3 font-bold hover:bg-[#4A3428] hover:text-white transition-colors"
              >
                [Browse Products]
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {items.map(item => (
                <div key={item.id} className="bg-white border-2 border-[#4A3428] p-4 flex gap-6 shadow-sm">
                  <div className="w-32 h-32 bg-[#F5F2F0] border border-[#D0BCA0] flex-shrink-0">
                    {item.product.imageUrl ? (
                      <img src={item.product.imageUrl} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <div className="flex items-center justify-center h-full opacity-30"><ImageIcon /></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold border-b border-[#D0BCA0] pb-1 mb-2 uppercase">{item.product.name}</h3>
                    <p className="text-[#8C6A48] text-sm mb-4">${item.product.price}/day</p>
                    <div className="flex items-center gap-3">
                      <button className="border border-[#4A3428] px-2" onClick={() => updateQty(item.id, item.quantity - 1)}>-</button>
                      <span className="font-bold text-lg">{item.quantity}</span>
                      <button className="border border-[#4A3428] px-2" onClick={() => updateQty(item.id, item.quantity + 1)}>+</button>
                    </div>
                  </div>
                  <button onClick={() => removeItem(item.id)} className="text-red-600 self-start p-1 hover:bg-red-50 transition-colors"><X size={20}/></button>
                </div>
              ))}
            </div>

            <div className="bg-white border-2 border-[#4A3428] p-6 h-fit shadow-sm">
              <h2 className="font-bold border-b-2 border-[#4A3428] pb-2 mb-4 uppercase">Order Summary</h2>
              <div className="flex justify-between mb-2"><span>Subtotal:</span><span className="font-bold">${calculateTotal().toFixed(2)}</span></div>
              <div className="flex justify-between mb-6"><span>Tax:</span><span className="font-bold">$0.00</span></div>
              <div className="border-t-2 border-[#D0BCA0] pt-4 flex justify-between mb-8">
                <span className="font-bold text-xl uppercase">Total:</span>
                <span className="font-bold text-xl text-[#4A3428]">${calculateTotal().toFixed(2)}</span>
              </div>
              <button className="w-full bg-[#4A3428] text-white py-4 font-bold uppercase tracking-wider hover:bg-[#3E2B22]">
                [Proceed to Checkout]
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="mt-20 border-t-2 border-[#4A3428] bg-white p-12">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div className="border border-[#4A3428] px-3 py-1 font-bold inline-block mb-4">About</div>
            <div className="text-sm text-[#8C6A48] border border-[#D0BCA0] p-1 mb-2">[About Us]</div>
            <div className="text-sm text-[#8C6A48] border border-[#D0BCA0] p-1">[How It Works]</div>
          </div>
          <div>
            <div className="border border-[#4A3428] px-3 py-1 font-bold inline-block mb-4">Support</div>
            <div className="text-sm text-[#8C6A48] border border-[#D0BCA0] p-1 mb-2">[Contact]</div>
            <div className="text-sm text-[#8C6A48] border border-[#D0BCA0] p-1">[FAQ]</div>
          </div>
          <div>
            <div className="border border-[#4A3428] px-3 py-1 font-bold inline-block mb-4">Legal</div>
            <div className="text-sm text-[#8C6A48] border border-[#D0BCA0] p-1 mb-2">[Privacy]</div>
            <div className="text-sm text-[#8C6A48] border border-[#D0BCA0] p-1">[Terms]</div>
          </div>
          <div>
            <div className="border border-[#4A3428] px-3 py-1 font-bold inline-block mb-4">Social</div>
            <div className="text-sm text-[#8C6A48] border border-[#D0BCA0] p-1 mb-2">[Facebook]</div>
            <div className="text-sm text-[#8C6A48] border border-[#D0BCA0] p-1">[Twitter]</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
