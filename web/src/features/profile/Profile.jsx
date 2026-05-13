import { useState } from "react";
import { createElement } from "react";
import { CreditCard, History, LockKeyhole, MapPin, Save, UserRound } from "lucide-react";
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
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-7 rounded-lg bg-white p-6 shadow-sm ring-1 ring-[#D0BCA0]">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#8C6A48]">My profile</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-[#4A3428]">Account and rental history</h1>
        </div>

        <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
          <aside className="h-fit rounded-lg border border-[#D0BCA0] bg-white p-6 text-center shadow-sm">
            <div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-[#4A3428] text-3xl font-black text-white">
              {userInitials(profile.email)}
            </div>
            <h2 className="mt-4 text-xl font-black text-[#4A3428]">{profile.name}</h2>
            <p className="text-sm text-[#8C6A48]">{profile.email}</p>
            <div className="mt-6 space-y-2 text-left text-sm font-bold text-[#8C6A48]">
              <ProfileNav icon={UserRound} label="Profile information" />
              <ProfileNav icon={LockKeyhole} label="Account security" />
              <ProfileNav icon={CreditCard} label="Payment preferences" />
              <ProfileNav icon={History} label="Order history" />
            </div>
          </aside>

          <div className="space-y-6">
            <form onSubmit={handleSubmit} className="rounded-lg border border-[#D0BCA0] bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-lg font-black text-[#4A3428]">Profile information</h2>
                {saved && <span className="rounded-full bg-[#FDFBF9] px-3 py-1 text-xs font-black text-[#4A3428]">Saved</span>}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Name" name="name" value={profile.name} onChange={handleChange} />
                <Input label="Email" name="email" type="email" value={profile.email} onChange={handleChange} />
                <Input label="Phone" name="phone" value={profile.phone} onChange={handleChange} />
                <Input label="Address" name="address" value={profile.address} onChange={handleChange} />
              </div>
              <button type="submit" className="mt-5 inline-flex h-11 items-center gap-2 rounded-lg bg-[#4A3428] px-5 font-black text-white">
                <Save className="h-5 w-5" />
                Save profile
              </button>
            </form>

            <section className="rounded-lg border border-[#D0BCA0] bg-white p-6 shadow-sm">
              <h2 className="mb-5 flex items-center gap-2 text-lg font-black text-[#4A3428]">
                <History className="h-5 w-5 text-[#8C6A48]" />
                Order history
              </h2>
              <div className="space-y-4">
                {orders.map((order) => (
                  <article key={order.orderNumber} className="rounded-lg bg-[#FDFBF9] p-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-black text-[#4A3428]">{order.orderNumber}</p>
                        <p className="flex items-center gap-1 text-sm text-[#8C6A48]">
                          <MapPin className="h-4 w-4" />
                          {order.shipping?.city || "Cebu City"}
                        </p>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="font-black text-[#4A3428]">{formatCurrency(order.total)}</p>
                        <p className="text-sm font-bold text-[#4A3428]">{order.status}</p>
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

function ProfileNav({ icon: Icon, label }) {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-[#FDFBF9] px-4 py-3">
      {createElement(Icon, { className: "h-4 w-4 text-[#8C6A48]" })}
      {label}
    </div>
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
