import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CreditCard, Loader2, PackageCheck, ShieldCheck } from "lucide-react";
import { loginUser } from "./auth.api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await loginUser({ email, password });
      const data = await response.text();

      if (response.ok) {
        if (!data) {
          localStorage.removeItem("token");
          setError("Login succeeded, but no backend token was returned.");
          return;
        }

        localStorage.setItem("token", data);
        localStorage.setItem("userEmail", email);
        navigate(email.endsWith("@renteasy.com") ? "/admin-dashboard" : "/home");
      } else {
        localStorage.removeItem("token");
        setError(data || "Invalid email or password.");
      }
    } catch {
      localStorage.removeItem("token");
      setError("Cannot reach the backend. Start Spring Boot first, then log in again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rent-auth-page px-4 py-10 font-sans text-[#4A3428]">
      <main className="rent-auth-motion mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl items-center justify-center">
        <section className="rent-auth-card">
          <div className="rent-auth-brand">
            <div>
              <div className="rent-auth-brand-mark">R</div>
              <p className="mt-6 text-sm font-black uppercase text-white/70">RentEasy</p>
              <h2 className="mt-3 max-w-sm text-4xl font-black leading-tight text-white">Rent gear with confidence</h2>
              <p className="mt-4 max-w-md text-sm leading-6 text-white/75">
                Browse approved listings, manage your cart, and track rentals from one polished workspace.
              </p>
            </div>
            <AuthHighlights />
          </div>

          <div className="rent-auth-form">
            <div className="mb-8 text-center sm:text-left">
              <div className="rent-logo-pulse mx-auto mb-5 inline-grid h-12 w-12 place-items-center rounded-lg bg-[#4A3428] text-xl font-black text-white shadow-sm sm:mx-0">
                R
              </div>
              <p className="mb-2 text-sm font-black uppercase text-[#4A3428]">RentEasy</p>
              <h1 className="text-3xl font-black text-[#4A3428]">Welcome back</h1>
            </div>

            {error && (
              <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <Input
                label="Email"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
              <Input
                label="Password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />

              <button
                type="submit"
                disabled={isLoading}
                className="flex h-12 w-full items-center justify-center rounded-lg bg-[#4A3428] font-black uppercase text-white shadow-sm hover:bg-[#3E2B22] disabled:opacity-70"
              >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Login"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm font-medium text-[#8C6A48]">
              No account yet?{" "}
              <Link to="/register" className="font-black text-[#4A3428] hover:underline">
                Register
              </Link>
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

function AuthHighlights() {
  const items = [
    { icon: PackageCheck, title: "Approved rentals", text: "Only reviewed listings appear in the catalog." },
    { icon: ShieldCheck, title: "Protected account", text: "Customer and admin areas stay separated after login." },
    { icon: CreditCard, title: "PayMongo checkout", text: "Paid orders are tracked after checkout returns." },
  ];

  return (
    <div className="mt-6 space-y-3">
      {items.map((item) => (
        <div key={item.title} className="flex gap-3 rounded-lg bg-white/10 p-4 ring-1 ring-white/15">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/12">
            <item.icon className="h-5 w-5" />
          </div>
          <div>
            <p className="font-black text-white">{item.title}</p>
            <p className="mt-1 text-sm leading-5 text-white/75">{item.text}</p>
          </div>
        </div>
      ))}
    </div>
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


