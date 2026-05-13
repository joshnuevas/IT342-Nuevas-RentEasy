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
    <header className="rent-header-motion sticky top-0 z-40 flex h-16 items-center justify-between border-b border-[#D0BCA0] bg-white px-6">
      <button
        type="button"
        className="border-2 border-[#4A3428] bg-[#FDFBF9] px-4 py-1.5 font-bold tracking-wide text-[#4A3428]"
        onClick={() => navigate("/home")}
      >
        RentEasy
      </button>

      <div className="relative mx-8 hidden max-w-2xl flex-1 md:block">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8C6A48]" />
        <input
          type="search"
          value={searchValue}
          onChange={(event) => onSearchChange?.(event.target.value)}
          placeholder="[Search]"
          className="w-full border-2 border-[#D0BCA0] bg-white py-1.5 pl-10 pr-4 text-sm text-[#4A3428] outline-none focus:border-[#4A3428]"
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate("/create-listing")}
          className="hidden items-center gap-2 border-2 border-[#4A3428] px-3 py-1.5 text-sm font-medium hover:bg-[#F5F2F0] sm:flex"
        >
          <Plus size={16} /> [List Item]
        </button>
        <button
          type="button"
          onClick={() => navigate("/my-listings")}
          className="border-2 border-[#4A3428] p-1.5 hover:bg-[#F5F2F0]"
          title="My Listings"
        >
          <List size={18} />
        </button>
        <button
          type="button"
          onClick={() => navigate("/cart")}
          className="relative border-2 border-[#4A3428] p-1.5 hover:bg-[#F5F2F0]"
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
          className="border-2 border-[#4A3428] p-1.5 hover:bg-[#F5F2F0]"
          title="Profile"
        >
          <UserRound size={18} />
        </button>
        <button
          type="button"
          onClick={handleLogout}
          className="border-2 border-[#4A3428] px-3 py-1.5 text-sm font-bold hover:bg-[#4A3428] hover:text-white"
        >
          <LogOut size={16} className="inline sm:hidden" />
          <span className="hidden sm:inline">[Logout]</span>
        </button>
      </div>
    </header>
  );
}

export function Page({ children, searchValue, onSearchChange, cartCount }) {
  return (
    <div className="min-h-screen bg-[#F5F2F0] font-sans text-[#4A3428]">
      <SiteHeader searchValue={searchValue} onSearchChange={onSearchChange} cartCount={cartCount} />
      <main className="rent-page-motion">{children}</main>
    </div>
  );
}

export function EmptyState({ icon: Icon = UserRound, title, description, action }) {
  return (
    <div className="rent-card-motion border-2 border-dashed border-[#D0BCA0] bg-white p-12 text-center shadow-sm">
      <div className="mx-auto mb-4 grid h-14 w-14 place-items-center border-2 border-[#4A3428] bg-[#FDFBF9] text-[#4A3428]">
        {createElement(Icon, { className: "h-7 w-7" })}
      </div>
      <h2 className="text-lg font-black text-[#4A3428]">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#8C6A48]">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
