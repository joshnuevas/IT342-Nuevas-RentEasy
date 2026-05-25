import { useEffect, useRef, useState } from "react";
import { Camera, History, Save, Trash2, Upload } from "lucide-react";
import { Page } from "../../shared/RentEasyLayout";
import { apiFetch, authHeaders } from "../../shared/apiClient";
import { formatCurrency, getProfile, getStoredOrders, saveProfile, userInitials } from "../../shared/rentEasyData";

export default function Profile() {
  const fileInputRef = useRef(null);
  const [profile, setProfile] = useState(getProfile());
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const orders = getStoredOrders();
  const token = localStorage.getItem("token");

  useEffect(() => {
    let isActive = true;

    async function loadProfile() {
      if (!token) return;

      try {
        const response = await apiFetch("/api/user/profile", {
          headers: authHeaders(token),
        });
        if (!response.ok) return;

        const user = await response.json();
        if (!isActive) return;

        setProfile((prev) => ({
          ...prev,
          name: fullName(user) || prev.name,
          email: user.email || prev.email,
          phone: user.phone || prev.phone,
          avatarUrl: user.avatarUrl || prev.avatarUrl,
        }));
      } catch {
        // Local profile data still keeps the page usable if the backend is offline.
      }
    }

    loadProfile();

    return () => {
      isActive = false;
    };
  }, [token]);

  const handleChange = (event) => {
    setProfile((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    resizeProfilePhoto(file)
      .then((avatarUrl) => setProfile((prev) => ({ ...prev, avatarUrl })))
      .catch(() => setError("Profile photo could not be prepared. Please choose a JPG, PNG, or WebP image under 5 MB."));
  };

  const removePhoto = () => {
    setProfile((prev) => ({ ...prev, avatarUrl: "" }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    saveProfile(profile);

    if (token) {
      try {
        const response = await apiFetch("/api/user/profile", {
          method: "PUT",
          headers: { ...authHeaders(token), "Content-Type": "application/json" },
          body: JSON.stringify(profilePayload(profile)),
        });

        if (!response.ok) throw new Error("Profile API failed.");
      } catch {
        setError("Profile saved on this browser, but the database phone number could not be updated.");
      }
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  return (
    <Page>
      <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 rounded-lg border border-[#D0BCA0] bg-white p-6 shadow-sm">
          <p className="mb-2 text-sm font-black uppercase text-[#4A3428]">Account</p>
          <h1 className="text-3xl font-black text-[#4A3428]">User Profile</h1>
        </div>

        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
          <aside className="h-fit rounded-lg border border-[#D0BCA0] bg-white p-6 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-28 w-28 items-center justify-center overflow-hidden rounded-lg bg-[#4A3428] text-3xl font-black text-white ring-1 ring-[#D0BCA0]">
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt={`${profile.name} profile`} className="h-full w-full object-cover" />
              ) : (
                userInitials(profile.email)
              )}
            </div>
            <h2 className="font-black text-[#4A3428]">{profile.name}</h2>
            <p className="mt-1 text-sm text-[#8C6A48]">{profile.email}</p>

            <div className="mt-5 grid gap-2">
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[#D0BCA0] bg-[#FDFBF9] text-sm font-black text-[#4A3428] hover:border-[#4A3428] hover:bg-white"
              >
                {profile.avatarUrl ? <Camera className="h-4 w-4" /> : <Upload className="h-4 w-4" />}
                {profile.avatarUrl ? "Change Photo" : "Upload Photo"}
              </button>
              {profile.avatarUrl && (
                <button
                  type="button"
                  onClick={removePhoto}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-red-200 bg-white text-sm font-black text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                  Remove Photo
                </button>
              )}
            </div>
          </aside>

          <div className="space-y-8">
            <form onSubmit={handleSubmit} className="rounded-lg border border-[#D0BCA0] bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-6 flex items-center justify-between border-b border-[#D0BCA0] pb-3">
                <h2 className="font-black text-[#4A3428]">Profile Information</h2>
                {saved && <span className="rounded-full bg-[#FDFBF9] px-3 py-1 text-xs font-black text-[#4A3428] ring-1 ring-[#D0BCA0]">Saved</span>}
              </div>
              {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</div>}

              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Name" name="name" placeholder="Enter your full name" value={profile.name} onChange={handleChange} />
                <Input label="Email" name="email" type="email" placeholder="Enter your email address" value={profile.email} onChange={handleChange} />
                <Input label="Phone" name="phone" placeholder="Enter your phone number" value={profile.phone} onChange={handleChange} />
                <Input label="Address" name="address" placeholder="Enter your address" value={profile.address} onChange={handleChange} />
              </div>

              <button
                type="submit"
                className="mt-6 inline-flex h-11 items-center gap-2 rounded-lg bg-[#4A3428] px-6 font-black text-white hover:bg-[#3E2B22]"
              >
                <Save className="h-5 w-5" />
                Save Profile
              </button>
            </form>

            <section className="rounded-lg border border-[#D0BCA0] bg-white p-6 shadow-sm sm:p-8">
              <h2 className="mb-6 flex items-center gap-2 border-b border-[#D0BCA0] pb-3 font-black text-[#4A3428]">
                <History className="h-5 w-5" />
                Order History
              </h2>
              {orders.length === 0 ? (
                <div className="rounded-lg border border-dashed border-[#D0BCA0] bg-[#FDFBF9] p-8 text-center text-sm font-bold text-[#8C6A48]">
                  No orders found.
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <article key={order.orderNumber} className="rounded-lg border border-[#D0BCA0] bg-[#FDFBF9] p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="font-black text-[#4A3428]">{order.orderNumber}</p>
                          <p className="text-sm text-[#8C6A48]">{order.createdAt || "Pending date"}</p>
                        </div>
                        <div className="text-left sm:text-right">
                          <p className="font-black text-[#4A3428]">{formatCurrency(order.total)}</p>
                          <p className="text-sm font-bold text-[#8C6A48]">{orderStatus(order)}</p>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
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

function orderStatus(order) {
  if (order.paymentStatus === "PAID") return "Paid";
  return order.status || "Processing";
}

function fullName(user) {
  return [user.firstName, user.lastName].filter(Boolean).join(" ");
}

function profilePayload(profile) {
  const parts = String(profile.name || "").trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] || "",
    lastName: parts.slice(1).join(" "),
    phone: profile.phone || "",
    avatarUrl: profile.avatarUrl || "",
  };
}

function resizeProfilePhoto(file) {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type) || file.size > 5 * 1024 * 1024) {
    return Promise.reject(new Error("Invalid profile image."));
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = reject;
    reader.onload = () => {
      const image = new Image();

      image.onerror = reject;
      image.onload = () => {
        const maxSide = 480;
        const scale = Math.min(maxSide / image.width, maxSide / image.height, 1);
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));

        const context = canvas.getContext("2d");
        context.drawImage(image, 0, 0, canvas.width, canvas.height);

        resolve(canvas.toDataURL("image/jpeg", 0.78));
      };

      image.src = reader.result;
    };

    reader.readAsDataURL(file);
  });
}


