import { useState } from "react";
import { History, Save } from "lucide-react";
import { Page } from "../../shared/RentEasyLayout";
import { demoOrders, formatCurrency, getProfile, getStoredOrders, saveProfile, userInitials } from "../../shared/rentEasyData";

export default function Profile() {
  const [profile, setProfile] = useState(getProfile());
  const [saved, setSaved] = useState(false);
  const orders = [...getStoredOrders(), ...demoOrders];

  const handleChange = (event) => {
    setProfile((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    saveProfile(profile);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  return (
    <Page>
      <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 rounded-lg border border-[#D0BCA0] bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-black tracking-tight text-[#4A3428]">User Profile</h1>
        </div>

        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
          <aside className="h-fit rounded-lg border border-[#D0BCA0] bg-white p-6 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-lg bg-[#4A3428] text-3xl font-black text-white">
              {userInitials(profile.email)}
            </div>
            <h2 className="font-black text-[#4A3428]">{profile.name}</h2>
            <p className="mt-1 text-sm text-[#8C6A48]">{profile.email}</p>
          </aside>

          <div className="space-y-8">
            <form onSubmit={handleSubmit} className="rounded-lg border border-[#D0BCA0] bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-6 flex items-center justify-between border-b border-[#D0BCA0] pb-3">
                <h2 className="font-black text-[#4A3428]">Profile Information</h2>
                {saved && <span className="rounded-full bg-[#FDFBF9] px-3 py-1 text-xs font-black text-[#4A3428] ring-1 ring-[#D0BCA0]">Saved</span>}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Name" name="name" value={profile.name} onChange={handleChange} />
                <Input label="Email" name="email" type="email" value={profile.email} onChange={handleChange} />
                <Input label="Phone" name="phone" value={profile.phone} onChange={handleChange} />
                <Input label="Address" name="address" value={profile.address} onChange={handleChange} />
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
                        <p className="text-sm font-bold text-[#8C6A48]">{order.status}</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
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
