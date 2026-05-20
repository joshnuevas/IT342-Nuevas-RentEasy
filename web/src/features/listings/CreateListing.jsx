import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, Loader2, Upload } from "lucide-react";
import { createListing } from "./listings.api";
import { Page } from "../../shared/RentEasyLayout";
import { categories, currentUserEmail } from "../../shared/rentEasyData";

const defaultForm = {
  name: "",
  category: "",
  price: "",
  stock: 1,
  description: "",
  imageUrl: "",
};

export default function CreateListing() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState(defaultForm);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setFormData((prev) => ({ ...prev, imageUrl: reader.result }));
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    const payload = {
      ...formData,
      price: Number(formData.price),
      stock: Number(formData.stock),
      ownerEmail: currentUserEmail(),
    };

    try {
      const token = localStorage.getItem("token");
      const response = await createListing(payload, token);
      if (!response.ok) throw new Error("Failed to create listing.");
      navigate("/my-listings");
    } catch {
      setError("Listing was not saved. Make sure the backend is running and you are logged in.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Page>
      <section className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 rounded-lg border border-[#D0BCA0] bg-white p-6 shadow-sm">
          <p className="mb-2 text-sm font-black uppercase text-[#4A3428]">Owner Listing</p>
          <h1 className="text-3xl font-black text-[#4A3428]">List a Product for Rent</h1>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-800">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 rounded-lg border border-[#D0BCA0] bg-white p-6 shadow-sm sm:p-8">
          <div>
            <label className="mb-2 block text-sm font-bold text-[#4A3428]">Product Image</label>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex h-72 w-full flex-col items-center justify-center overflow-hidden rounded-lg border border-dashed border-[#D0BCA0] bg-[#FDFBF9] hover:border-[#4A3428] hover:bg-white"
            >
              {formData.imageUrl ? (
                <img src={formData.imageUrl} alt="Preview" className="h-full w-full object-contain" />
              ) : (
                <>
                  <Upload className="mb-3 h-8 w-8 text-[#8C6A48]" />
                  <span className="text-sm font-bold text-[#4A3428]">Click to select image</span>
                </>
              )}
            </button>
          </div>

          <Input label="Product Name" name="name" placeholder="Enter the product name" value={formData.name} onChange={handleChange} />

          <label className="block">
            <span className="mb-2 block text-sm font-bold text-[#4A3428]">Category</span>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="h-12 w-full rounded-lg border border-[#D0BCA0] bg-[#FDFBF9] px-4 text-sm outline-none focus:border-[#4A3428] focus:bg-white focus:ring-4 focus:ring-[#D0BCA0]/35"
            >
              <option value="" disabled>Select a category</option>
              {categories.filter((item) => item !== "All").map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Rental Price (per day)" type="number" name="price" min="1" placeholder="Enter the rental price" value={formData.price} onChange={handleChange} />
            <Input label="Quantity in Stock" type="number" name="stock" min="1" placeholder="Enter the available quantity" value={formData.stock} onChange={handleChange} />
          </div>

          <label className="block">
            <span className="mb-2 block text-sm font-bold text-[#4A3428]">Description</span>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter the product description"
              required
              className="h-32 w-full resize-y rounded-lg border border-[#D0BCA0] bg-[#FDFBF9] p-3 text-sm outline-none focus:border-[#4A3428] focus:bg-white focus:ring-4 focus:ring-[#D0BCA0]/35"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <button
              type="submit"
              disabled={isLoading}
              className="flex h-12 items-center justify-center rounded-lg bg-[#4A3428] font-black uppercase text-white hover:bg-[#3E2B22] disabled:opacity-70"
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Submit for Approval"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/home")}
              className="h-12 rounded-lg border border-[#D0BCA0] font-black text-[#4A3428] hover:border-[#4A3428] hover:bg-[#FDFBF9]"
            >
              Cancel
            </button>
          </div>
        </form>
      </section>
    </Page>
  );
}

function Input({ label, ...props }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-[#4A3428]">{label}</span>
      <input
        {...props}
        required
        className="h-12 w-full rounded-lg border border-[#D0BCA0] bg-[#FDFBF9] px-4 text-sm outline-none focus:border-[#4A3428] focus:bg-white focus:ring-4 focus:ring-[#D0BCA0]/35"
      />
    </label>
  );
}


