import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, Loader2, Upload } from "lucide-react";
import { createListing } from "./listings.api";
import { Page } from "../../shared/RentEasyLayout";
import { categories, currentUserEmail, saveStoredListing } from "../../shared/rentEasyData";

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

      if (!response.ok) {
        throw new Error("Failed to create listing.");
      }
    } catch {
      saveStoredListing(payload);
    } finally {
      setIsLoading(false);
      navigate("/my-listings");
    }
  };

  return (
    <Page>
      <section className="mx-auto max-w-3xl p-6 md:p-8">
        <div className="mb-8 inline-block border-2 border-[#4A3428] bg-white p-3 shadow-sm">
          <h1 className="text-xl font-bold text-[#4A3428]">List a Product for Rent</h1>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-3 border-2 border-red-500 bg-red-50 p-4 text-sm font-bold text-red-800">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8 border-2 border-[#4A3428] bg-white p-8 shadow-sm">
          <div className="space-y-2">
            <label className="inline-block border-2 border-[#4A3428] bg-[#FDFBF9] px-2 py-1 text-sm font-bold">
              [Product Image *]
            </label>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex h-64 w-full flex-col items-center justify-center overflow-hidden border-2 border-dashed border-[#8C6A48] bg-[#FDFBF9] hover:bg-[#F5F2F0]"
            >
              {formData.imageUrl ? (
                <img src={formData.imageUrl} alt="Preview" className="h-full w-full object-contain" />
              ) : (
                <>
                  <Upload className="mb-3 h-8 w-8 text-[#8C6A48]" />
                  <span className="border-2 border-[#4A3428] bg-white px-3 py-1 text-sm font-bold">
                    [Click to select image]
                  </span>
                </>
              )}
            </button>
          </div>

          <Input label="[Product Name *]" name="name" value={formData.name} onChange={handleChange} />

          <label className="block space-y-2">
            <span className="inline-block border-2 border-[#4A3428] bg-[#FDFBF9] px-2 py-1 text-sm font-bold">
              [Category *]
            </span>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full border-2 border-[#4A3428] bg-white p-3 text-sm outline-none focus:bg-[#FDFBF9]"
            >
              <option value="" disabled>[Select a category]</option>
              {categories.filter((item) => item !== "All").map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="[Rental Price (per day) *]"
              type="number"
              name="price"
              min="1"
              value={formData.price}
              onChange={handleChange}
            />
            <Input
              label="[Quantity in Stock *]"
              type="number"
              name="stock"
              min="1"
              value={formData.stock}
              onChange={handleChange}
            />
          </div>

          <label className="block space-y-2">
            <span className="inline-block border-2 border-[#4A3428] bg-[#FDFBF9] px-2 py-1 text-sm font-bold">
              [Description *]
            </span>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              className="h-32 w-full resize-y border-2 border-[#4A3428] bg-white p-3 text-sm outline-none focus:bg-[#FDFBF9]"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center justify-center border-2 border-[#4A3428] bg-[#4A3428] py-3 font-bold text-white hover:bg-[#3E2B22] disabled:opacity-70"
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "[Submit for Approval]"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/home")}
              className="border-2 border-[#4A3428] py-3 font-bold text-[#4A3428] hover:bg-[#F5F2F0]"
            >
              [Cancel]
            </button>
          </div>
        </form>
      </section>
    </Page>
  );
}

function Input({ label, ...props }) {
  return (
    <label className="block space-y-2">
      <span className="inline-block border-2 border-[#4A3428] bg-[#FDFBF9] px-2 py-1 text-sm font-bold">
        {label}
      </span>
      <input
        {...props}
        required
        className="w-full border-2 border-[#4A3428] bg-white p-3 text-sm outline-none focus:bg-[#FDFBF9]"
      />
    </label>
  );
}
