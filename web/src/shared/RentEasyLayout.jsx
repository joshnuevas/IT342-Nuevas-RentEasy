import { createElement, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { List, LogOut, PackagePlus, Search, ShoppingCart, Store, UserRound } from "lucide-react";
import { apiFetch, authHeaders, getAuthToken } from "./apiClient";
import { currentUserEmail, getProfile, setLocalCart, userInitials } from "./rentEasyData";

export function SiteHeader({ searchValue = "", onSearchChange, cartCount }) {
  const navigate = useNavigate();
  const email = currentUserEmail();
  const profile = getProfile();
  const [databaseCartCount, setDatabaseCartCount] = useState(0);
  const count = cartCount ?? databaseCartCount;

  useEffect(() => {
    let isActive = true;
    const token = getAuthToken();

    async function loadCartCount() {
      if (!token || cartCount !== undefined) return;

      try {
        const response = await apiFetch(`/api/cart?email=${encodeURIComponent(email)}`, {
          headers: authHeaders(token),
        });
        if (!response.ok) throw new Error("Cart count unavailable.");
        const items = await response.json();
        const cartItems = Array.isArray(items) ? items : [];
        setLocalCart(cartItems, email);
        if (isActive) setDatabaseCartCount(cartItems.length);
      } catch {
        setLocalCart([], email);
        if (isActive) setDatabaseCartCount(0);
      }
    }

    loadCartCount();

    return () => {
      isActive = false;
    };
  }, [cartCount, email]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    navigate("/login");
  };

  return (
    <header className="rent-header-motion sticky top-0 z-40 flex items-center justify-between gap-4 border-b border-[#D0BCA0] bg-white/90 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
      <div
        className="rent-brand-button flex h-11 shrink-0 items-center gap-3 rounded-lg bg-[#4A3428] px-3 pr-4 font-black text-white"
      >
        <span className="grid h-7 w-7 place-items-center rounded-md bg-white/15 text-sm ring-1 ring-white/20">R</span>
        <span className="hidden sm:inline">RentEasy</span>
      </div>

      <div className="relative hidden max-w-xl flex-1 md:block">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8C6A48]" />
        <input
          type="search"
          value={searchValue}
          onChange={(event) => onSearchChange?.(event.target.value)}
          placeholder="Search rentals"
          className="h-11 w-full rounded-lg border border-[#D0BCA0] bg-[#FDFBF9] pl-10 pr-4 text-sm text-[#4A3428] outline-none focus:border-[#4A3428] focus:bg-white focus:ring-4 focus:ring-[#D0BCA0]/35"
        />
      </div>

      <nav className="hidden items-center gap-2 lg:flex">
        <NavButton title="Browse" onClick={() => navigate("/home")} icon={Store} />
        <NavButton title="Listings" onClick={() => navigate("/my-listings")} icon={List} />
      </nav>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate("/create-listing")}
          className="hidden h-11 items-center gap-2 rounded-lg bg-[#4A3428] px-4 text-sm font-black text-white shadow-sm hover:bg-[#3E2B22] sm:flex"
        >
          <PackagePlus size={16} /> List Item
        </button>
        <IconButton title="My Listings" onClick={() => navigate("/my-listings")} icon={List} className="lg:hidden" />
        <button
          type="button"
          onClick={() => navigate("/cart")}
          className="rent-icon-button relative grid h-11 w-11 place-items-center rounded-lg border border-[#D0BCA0] bg-[#FDFBF9] text-[#4A3428] hover:border-[#4A3428] hover:bg-white"
          title="Cart"
        >
          <ShoppingCart size={18} />
          {count > 0 && (
            <span className="absolute -right-2 -top-2 grid h-5 min-w-5 place-items-center rounded-full bg-[#4A3428] px-1 text-xs font-bold text-white">
              {count}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => navigate("/profile")}
          className="rent-icon-button grid h-11 w-11 place-items-center overflow-hidden rounded-lg border border-[#D0BCA0] bg-[#FDFBF9] text-[#4A3428] hover:border-[#4A3428] hover:bg-white"
          title="Profile"
        >
          {profile.avatarUrl ? (
            <img src={profile.avatarUrl} alt="Profile" className="h-full w-full object-cover" />
          ) : (
            <span className="text-xs font-black">{userInitials(email)}</span>
          )}
        </button>
        <button
          type="button"
          onClick={handleLogout}
          className="rent-icon-button flex h-11 items-center gap-2 rounded-lg border border-[#D0BCA0] bg-white/60 px-3 text-sm font-bold text-[#4A3428] hover:border-[#4A3428] hover:bg-[#4A3428] hover:text-white"
        >
          <LogOut size={16} className="sm:hidden" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}

export function Page({ children, searchValue, onSearchChange, cartCount }) {
  return (
    <div className="min-h-screen font-sans text-[#4A3428]">
      <SiteHeader searchValue={searchValue} onSearchChange={onSearchChange} cartCount={cartCount} />
      <main className="rent-page-motion">{children}</main>
    </div>
  );
}

export function EmptyState({ icon: Icon = UserRound, title, description, action }) {
  return (
    <div className="rent-card-motion rounded-lg border border-dashed border-[#D0BCA0] bg-white p-12 text-center shadow-sm">
      <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-lg bg-[#FDFBF9] text-[#4A3428] ring-1 ring-[#D0BCA0]">
        {createElement(Icon, { className: "h-7 w-7" })}
      </div>
      <h2 className="text-lg font-black text-[#4A3428]">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#8C6A48]">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

function NavButton({ title, onClick, icon }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rent-icon-button inline-flex h-11 items-center gap-2 rounded-lg border border-[#D0BCA0] bg-[#FDFBF9] px-3 text-sm font-bold text-[#4A3428] hover:border-[#4A3428] hover:bg-white"
    >
      {createElement(icon, { size: 17 })}
      {title}
    </button>
  );
}

function IconButton({ title, onClick, icon, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rent-icon-button grid h-11 w-11 place-items-center rounded-lg border border-[#D0BCA0] bg-[#FDFBF9] text-[#4A3428] hover:border-[#4A3428] hover:bg-white ${className}`}
      title={title}
    >
      {createElement(icon, { size: 18 })}
    </button>
  );
}


