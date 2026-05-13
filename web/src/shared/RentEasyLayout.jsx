import { createElement } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  Boxes,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  PackagePlus,
  Search,
  ShoppingCart,
  UserRound,
} from "lucide-react";
import { currentUserEmail, getLocalCart, userInitials } from "./rentEasyData";

const navItems = [
  { to: "/home", label: "Catalog", icon: Boxes },
  { to: "/create-listing", label: "List Item", icon: PackagePlus },
  { to: "/my-listings", label: "My Listings", icon: ClipboardList },
];

export function SiteHeader({ searchValue = "", onSearchChange, cartCount }) {
  const navigate = useNavigate();
  const email = currentUserEmail();
  const isAdmin = email.endsWith("@renteasy.com");
  const count = cartCount ?? getLocalCart(email).reduce((sum, item) => sum + Number(item.quantity || 0), 0);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    navigate("/login");
  };

  return (
    <header className="rent-header-motion sticky top-0 z-40 border-b border-[#D0BCA0] bg-[#FDFBF9]/95 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link to="/home" className="flex items-center gap-3">
          <span className="rent-logo-pulse grid h-10 w-10 place-items-center rounded-lg bg-[#4A3428] text-lg font-black text-white shadow-sm">
            R
          </span>
          <span className="hidden leading-tight sm:block">
            <span className="block text-base font-black tracking-tight text-[#4A3428]">RentEasy</span>
            <span className="block text-xs font-medium text-[#8C6A48]">Borrow smarter</span>
          </span>
        </Link>

        <div className="relative hidden flex-1 md:block">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8C6A48]" />
          <input
            type="search"
            value={searchValue}
            onChange={(event) => onSearchChange?.(event.target.value)}
            placeholder="Search cameras, tools, speakers..."
            className="h-11 w-full rounded-full border border-[#D0BCA0] bg-[#FDFBF9] pl-11 pr-4 text-sm outline-none transition focus:border-[#4A3428] focus:bg-white focus:ring-4 focus:ring-[#D0BCA0]/45"
          />
        </div>

        <nav className="ml-auto hidden items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold transition ${
                  isActive ? "bg-[#FDFBF9] text-[#4A3428]" : "text-[#8C6A48] hover:bg-[#F5F2F0] hover:text-[#4A3428]"
                }`
              }
            >
              {createElement(item.icon, { className: "h-4 w-4" })}
              {item.label}
            </NavLink>
          ))}
          {isAdmin && (
            <NavLink
              to="/admin-dashboard"
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold transition ${
                  isActive ? "bg-[#FDFBF9] text-[#4A3428]" : "text-[#8C6A48] hover:bg-[#F5F2F0] hover:text-[#4A3428]"
                }`
              }
            >
              <LayoutDashboard className="h-4 w-4" />
              Admin
            </NavLink>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate("/cart")}
            className="relative grid h-10 w-10 place-items-center rounded-full border border-[#D0BCA0] bg-white text-[#4A3428] transition hover:border-[#4A3428] hover:text-[#4A3428]"
            title="Shopping cart"
          >
            <ShoppingCart className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[#8C6A48] px-1 text-xs font-bold text-white">
                {count}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => navigate("/profile")}
            className="hidden h-10 items-center gap-2 rounded-full border border-[#D0BCA0] bg-white px-2 pr-3 text-sm font-semibold text-[#4A3428] transition hover:border-[#4A3428] hover:text-[#4A3428] sm:flex"
          >
            <span className="grid h-7 w-7 place-items-center rounded-full bg-[#4A3428] text-xs text-white">{userInitials(email)}</span>
            Profile
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="grid h-10 w-10 place-items-center rounded-full border border-[#D0BCA0] bg-white text-[#8C6A48] transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            title="Logout"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
      <div className="border-t border-[#D0BCA0] px-4 py-3 md:hidden">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8C6A48]" />
          <input
            type="search"
            value={searchValue}
            onChange={(event) => onSearchChange?.(event.target.value)}
            placeholder="Search rentals"
            className="h-10 w-full rounded-full border border-[#D0BCA0] bg-[#FDFBF9] pl-11 pr-4 text-sm outline-none focus:border-[#4A3428] focus:ring-4 focus:ring-[#D0BCA0]/45"
          />
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-[#D0BCA0] bg-white">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 text-sm text-[#8C6A48] sm:px-6 md:grid-cols-4 lg:px-8">
        {[
          ["About", "How it works", "Rental safety"],
          ["Support", "Help center", "Contact"],
          ["Legal", "Privacy", "Terms"],
          ["Social", "Facebook", "Instagram"],
        ].map(([title, ...links]) => (
          <div key={title}>
            <h3 className="mb-3 text-sm font-black uppercase tracking-wide text-[#4A3428]">{title}</h3>
            <div className="space-y-2">
              {links.map((link) => (
                <p key={link}>{link}</p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </footer>
  );
}

export function Page({ children, searchValue, onSearchChange, cartCount }) {
  return (
    <div className="min-h-screen bg-[#F5F2F0] text-[#4A3428]">
      <SiteHeader searchValue={searchValue} onSearchChange={onSearchChange} cartCount={cartCount} />
      <main className="rent-page-motion">{children}</main>
      <Footer />
    </div>
  );
}

export function EmptyState({ icon: Icon = UserRound, title, description, action }) {
  return (
    <div className="rent-card-motion rounded-lg border border-dashed border-[#D0BCA0] bg-white p-10 text-center shadow-sm">
      <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-[#FDFBF9] text-[#4A3428]">
        {createElement(Icon, { className: "h-7 w-7" })}
      </div>
      <h2 className="text-lg font-black text-[#4A3428]">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#8C6A48]">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
