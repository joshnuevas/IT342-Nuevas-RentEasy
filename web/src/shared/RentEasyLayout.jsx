import { createElement } from "react";
import { useNavigate } from "react-router-dom";
import { List, LogOut, Plus, Search, ShoppingCart, UserRound } from "lucide-react";
import { currentUserEmail, getLocalCart } from "./rentEasyData";

export function SiteHeader({ searchValue = "", onSearchChange, cartCount }) {
  const navigate = useNavigate();
  const email = currentUserEmail();
  const count = cartCount ?? getLocalCart(email).reduce((sum, item) => sum + Number(item.quantity || 0), 0);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    navigate("/login");
  };

  return (
    <header className="rent-header-motion sticky top-0 z-40 flex h-16 items-center justify-between border-b border-[#D0BCA0] bg-white/90 px-5 shadow-sm backdrop-blur-xl sm:px-6">
      <button
        type="button"
        className="flex h-11 items-center gap-3 rounded-xl bg-[#4A3428] px-3 pr-4 font-black tracking-wide text-white shadow-sm hover:bg-[#3E2B22]"
        onClick={() => navigate("/home")}
      >
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-white/15 text-sm ring-1 ring-white/20">R</span>
        <span>RentEasy</span>
      </button>

      <div className="relative mx-8 hidden max-w-2xl flex-1 md:block">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8C6A48]" />
        <input
          type="search"
          value={searchValue}
          onChange={(event) => onSearchChange?.(event.target.value)}
          placeholder="Search"
          className="h-11 w-full rounded-xl border border-[#D0BCA0] bg-[#FDFBF9] pl-10 pr-4 text-sm text-[#4A3428] outline-none focus:border-[#4A3428] focus:bg-white focus:ring-4 focus:ring-[#D0BCA0]/35"
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate("/create-listing")}
          className="hidden h-11 items-center gap-2 rounded-xl bg-[#2F6F62] px-4 text-sm font-black text-white shadow-sm hover:bg-[#285f54] sm:flex"
        >
          <Plus size={16} /> List Item
        </button>
        <IconButton title="My Listings" onClick={() => navigate("/my-listings")} icon={List} />
        <button
          type="button"
          onClick={() => navigate("/cart")}
          className="relative grid h-11 w-11 place-items-center rounded-xl border border-[#D0BCA0] bg-[#FDFBF9] text-[#4A3428] hover:border-[#4A3428] hover:bg-white"
          title="Cart"
        >
          <ShoppingCart size={18} />
          {count > 0 && (
            <span className="absolute -right-2 -top-2 grid h-5 min-w-5 place-items-center rounded-full bg-[#4A3428] px-1 text-xs font-bold text-white">
              {count}
            </span>
          )}
        </button>
        <IconButton title="Profile" onClick={() => navigate("/profile")} icon={UserRound} />
        <button
          type="button"
          onClick={handleLogout}
          className="flex h-11 items-center gap-2 rounded-xl border border-[#D0BCA0] bg-white/60 px-3 text-sm font-bold text-[#4A3428] hover:border-[#4A3428] hover:bg-[#4A3428] hover:text-white"
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
    <div className="rent-card-motion rounded-2xl border border-dashed border-[#D0BCA0] bg-white p-12 text-center shadow-sm">
      <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-xl bg-[#FDFBF9] text-[#4A3428] ring-1 ring-[#D0BCA0]">
        {createElement(Icon, { className: "h-7 w-7" })}
      </div>
      <h2 className="text-lg font-black text-[#4A3428]">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#8C6A48]">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

function IconButton({ title, onClick, icon }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="grid h-11 w-11 place-items-center rounded-xl border border-[#D0BCA0] bg-[#FDFBF9] text-[#4A3428] hover:border-[#4A3428] hover:bg-white"
      title={title}
    >
      {createElement(icon, { size: 18 })}
    </button>
  );
}
