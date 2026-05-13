import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, CheckCircle2, ImagePlus, Loader2, PackagePlus, Sparkles, Upload } from "lucide-react";
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
  pickupArea: "",
  deposit: "",
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
      if (!response.ok) throw new Error("Backend listing API unavailable");
    } catch {
      saveStoredListing(payload);
    } finally {
      setIsLoading(false);
      navigate("/my-listings");
    }
  };

  return (
    <Page>
      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-7 rounded-lg bg-white p-6 shadow-sm ring-1 ring-[#D0BCA0]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#8C6A48]">List item</p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-[#4A3428]">Create a rental listing</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#8C6A48]">
                This follows the SDD list-item and create-listing wireframes: media first, then item details, pricing, and availability.
              </p>
            </div>
            <div className="grid h-14 w-14 place-items-center rounded-lg bg-[#FDFBF9] text-[#4A3428]">
              <PackagePlus className="h-7 w-7" />
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-5 flex items-center gap-3 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
            <AlertCircle className="h-5 w-5" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="rounded-lg border border-[#D0BCA0] bg-white p-5 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-black text-[#4A3428]">
              <ImagePlus className="h-5 w-5 text-[#8C6A48]" />
              Product image
            </h2>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="group grid min-h-[420px] w-full place-items-center overflow-hidden rounded-lg border border-dashed border-[#D0BCA0] bg-[#FDFBF9] text-center transition hover:border-[#4A3428] hover:bg-[#FDFBF9]/40"
            >
              {formData.imageUrl ? (
                <img src={formData.imageUrl} alt="Preview" className="h-full min-h-[420px] w-full object-cover" />
              ) : (
                <span className="p-8">
                  <span className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-white text-[#4A3428] shadow-sm">
                    <Upload className="h-7 w-7" />
                  </span>
                  <span className="block text-lg font-black text-[#4A3428]">Upload product image</span>
                  <span className="mt-2 block text-sm text-[#8C6A48]">JPG or PNG works best for marketplace cards.</span>
                </span>
              )}
            </button>
          </section>

          <section className="rounded-lg border border-[#D0BCA0] bg-white p-5 shadow-sm">
            <h2 className="mb-5 flex items-center gap-2 text-lg font-black text-[#4A3428]">
              <Sparkles className="h-5 w-5 text-[#8C6A48]" />
              Rental details
            </h2>
            <div className="grid gap-4">
              <Input label="Product name" name="name" value={formData.name} onChange={handleChange} placeholder="Professional Camera Kit" />
              <label>
                <span className="mb-2 block text-sm font-bold text-[#4A3428]">Category</span>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="h-12 w-full rounded-lg border border-[#D0BCA0] bg-[#FDFBF9] px-4 outline-none focus:border-[#4A3428] focus:ring-4 focus:ring-[#D0BCA0]/45"
                >
                  <option value="" disabled>Select a category</option>
                  {categories.filter((item) => item !== "All").map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Price per day" type="number" name="price" value={formData.price} onChange={handleChange} placeholder="1200" />
                <Input label="Quantity in stock" type="number" min="1" name="stock" value={formData.stock} onChange={handleChange} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Refundable deposit" type="number" name="deposit" value={formData.deposit} onChange={handleChange} placeholder="500" />
                <Input label="Pickup area" name="pickupArea" value={formData.pickupArea} onChange={handleChange} placeholder="Cebu City" />
              </div>
              <label>
                <span className="mb-2 block text-sm font-bold text-[#4A3428]">Description</span>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={7}
                  placeholder="Include condition, accessories, pickup notes, and rental rules."
                  className="w-full resize-y rounded-lg border border-[#D0BCA0] bg-[#FDFBF9] px-4 py-3 outline-none focus:border-[#4A3428] focus:ring-4 focus:ring-[#D0BCA0]/45"
                />
              </label>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[#4A3428] font-black text-white transition hover:bg-[#3E2B22] disabled:opacity-70"
              >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Submit Listing <CheckCircle2 className="h-5 w-5" /></>}
              </button>
              <button
                type="button"
                onClick={() => {
                  setError("");
                  navigate("/home");
                }}
                className="h-12 rounded-lg border border-[#D0BCA0] font-black text-[#4A3428] transition hover:border-[#4A3428] hover:text-[#4A3428]"
              >
                Cancel
              </button>
            </div>
          </section>
        </form>
      </section>
    </Page>
  );
}

function Input({ label, ...props }) {
  return (
    <label>
      <span className="mb-2 block text-sm font-bold text-[#4A3428]">{label}</span>
      <input
        {...props}
        required
        className="h-12 w-full rounded-lg border border-[#D0BCA0] bg-[#FDFBF9] px-4 outline-none focus:border-[#4A3428] focus:ring-4 focus:ring-[#D0BCA0]/45"
      />
    </label>
  );
}
