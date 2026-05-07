import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Search, Plus, List, ShoppingCart, User, Upload, Loader2, AlertCircle 
} from "lucide-react";
import { createListing } from "./listings.api";

export default function CreateListing() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    stock: 1,
    description: "",
    imageUrl: ""
  });

  const currentUserEmail = localStorage.getItem("userEmail");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    navigate("/login");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleBoxClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, imageUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    const payload = {
      ...formData,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      ownerEmail: currentUserEmail 
    };
    
    try {
      const token = localStorage.getItem("token");

      const response = await createListing(payload, token);

      if (response.ok) {
        navigate("/home");
      } else {
        setError("Failed to create listing. Please try again.");
      }
    } catch {
      setError("Server error. Please check if your Spring Boot backend is running.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F2F0] font-sans text-[#4A3428] pb-12">
      <header className="h-16 bg-white border-b border-[#D0BCA0] flex items-center justify-between px-6 sticky top-0 z-10">
        <div className="border-2 border-[#4A3428] px-4 py-1.5 font-bold text-[#4A3428] tracking-wide bg-[#FDFBF9] cursor-pointer" onClick={() => navigate("/home")}>
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
          <button className="hidden sm:flex border-2 border-[#4A3428] px-3 py-1.5 items-center gap-2 text-sm font-medium bg-[#F5F2F0]">
            <Plus size={16} /> [List Item]
          </button>
          <button onClick={() => navigate("/home")} className="border-2 border-[#4A3428] p-1.5 hover:bg-[#F5F2F0] transition-colors">
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

      <main className="max-w-3xl mx-auto p-6 md:p-8 mt-6">
        <div className="border-2 border-[#4A3428] p-3 inline-block mb-8 bg-white">
          <h1 className="text-xl font-bold text-[#4A3428]">List a Product for Rent</h1>
        </div>

        {error && (
          <div className="mb-6 p-4 border-2 border-red-500 bg-red-50 flex items-center gap-3 text-red-800 text-sm font-bold">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white border-2 border-[#4A3428] p-8 space-y-8">
          <div className="space-y-2">
            <label className="text-sm font-bold border-2 border-[#4A3428] px-2 py-1 inline-block">[Product Image *]</label>
            
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept="image/*"
            />

            <div 
              onClick={handleBoxClick}
              className="h-64 border-2 border-dashed border-[#8C6A48] bg-[#FDFBF9] hover:bg-[#F5F2F0] transition-colors flex flex-col items-center justify-center cursor-pointer overflow-hidden"
            >
              {formData.imageUrl ? (
                <img src={formData.imageUrl} alt="Preview" className="h-full w-full object-contain" />
              ) : (
                <>
                  <Upload size={32} className="text-[#8C6A48] mb-3" />
                  <span className="text-sm font-bold text-[#4A3428] border-2 border-[#4A3428] px-3 py-1 bg-white">[Click to select image]</span>
                  <span className="text-xs text-[#8C6A48] mt-2">JPG or PNG.</span>
                </>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold border-2 border-[#4A3428] px-2 py-1 inline-block">[Product Name *]</label>
            <input 
              type="text" 
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Professional Camera Kit" 
              className="w-full border-2 border-[#4A3428] p-3 text-sm focus:outline-none focus:bg-[#FDFBF9]"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold border-2 border-[#4A3428] px-2 py-1 inline-block">[Category *]</label>
            <select 
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full border-2 border-[#4A3428] p-3 text-sm focus:outline-none focus:bg-[#FDFBF9] appearance-none bg-transparent"
              required
            >
              <option value="" disabled>[Select a category]</option>
              <option value="electronics">Electronics</option>
              <option value="tools">Tools</option>
              <option value="party">Party Supplies</option>
              <option value="outdoor">Outdoor Gear</option>
            </select>
          </div>

          <div className="flex gap-4 flex-col sm:flex-row">
            <div className="space-y-2 flex-1">
              <label className="text-sm font-bold border-2 border-[#4A3428] px-2 py-1 inline-block">[Rental Price (per day) *]</label>
              <div className="flex items-center gap-3">
                <div className="border-2 border-[#4A3428] p-3 font-bold bg-[#F5F2F0]">$</div>
                <input 
                  type="number" 
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="45.00" 
                  className="flex-1 border-2 border-[#4A3428] p-3 text-sm focus:outline-none focus:bg-[#FDFBF9]"
                  step="0.01"
                  required
                />
              </div>
            </div>
            <div className="space-y-2 flex-1">
              <label className="text-sm font-bold border-2 border-[#4A3428] px-2 py-1 inline-block">[Quantity in Stock *]</label>
              <input 
                type="number" 
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                min="1"
                className="w-full border-2 border-[#4A3428] p-3 text-sm focus:outline-none focus:bg-[#FDFBF9]"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold border-2 border-[#4A3428] px-2 py-1 inline-block">[Description *]</label>
            <textarea 
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your product in detail..." 
              className="w-full border-2 border-[#4A3428] p-3 text-sm focus:outline-none focus:bg-[#FDFBF9] h-32 resize-y"
              required
            ></textarea>
          </div>

          <div className="flex gap-4 pt-4">
            <button 
              type="submit" 
              disabled={isLoading}
              className="flex-1 bg-[#4A3428] text-white border-2 border-[#4A3428] font-bold py-3 hover:bg-[#3A281E] transition-colors flex items-center justify-center"
            >
              {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : "[Submit for Approval]"}
            </button>
            <button 
              type="button" 
              onClick={() => navigate("/home")} 
              className="flex-1 bg-transparent text-[#4A3428] border-2 border-[#4A3428] font-bold py-3 hover:bg-[#F5F2F0] transition-colors"
            >
              [Cancel]
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
