import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Loader2, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
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
          setError("Login succeeded but no backend token was returned. Please check the backend auth response.");
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
    <div className="min-h-screen bg-[#f6f2ec] px-4 py-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-8 lg:grid-cols-[1fr_440px]">
        <section className="hidden overflow-hidden rounded-lg bg-stone-950 text-white shadow-2xl lg:block">
          <div className="relative min-h-[640px]">
            <img
              src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80"
              alt="Rental gear displayed on a table"
              className="absolute inset-0 h-full w-full object-cover opacity-55"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-stone-950 via-stone-950/70 to-emerald-950/60" />
            <div className="relative flex h-full min-h-[640px] flex-col justify-between p-10">
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-lg bg-white text-xl font-black text-[#2f513f]">
                  R
                </span>
                <div>
                  <p className="text-xl font-black">RentEasy</p>
                  <p className="text-sm text-stone-300">Borrow what you need, when you need it.</p>
                </div>
              </div>
              <div>
                <p className="mb-4 inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-emerald-100 ring-1 ring-white/20">
                  Equipment rental marketplace
                </p>
                <h1 className="max-w-xl text-5xl font-black leading-tight tracking-tight">
                  Find reliable gear without buying it outright.
                </h1>
                <div className="mt-8 grid grid-cols-3 gap-3 text-sm">
                  {["Catalog", "Cart", "Checkout"].map((item) => (
                    <div key={item} className="rounded-lg bg-white/10 p-4 ring-1 ring-white/15 backdrop-blur">
                      <ShieldCheck className="mb-3 h-5 w-5 text-emerald-200" />
                      <p className="font-bold">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-stone-200 bg-white p-6 shadow-xl shadow-stone-200/70 sm:p-8">
          <div className="mb-8">
            <div className="mb-5 grid h-12 w-12 place-items-center rounded-lg bg-[#2f513f] text-lg font-black text-white lg:hidden">
              R
            </div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#d5673f]">Welcome back</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-stone-950">Login to RentEasy</h2>
            <p className="mt-2 text-sm leading-6 text-stone-500">
              Continue browsing rentals, managing your cart, and tracking your listings.
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-stone-700">Email address</span>
              <span className="relative block">
                <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  placeholder="you@example.com"
                  className="h-12 w-full rounded-lg border border-stone-200 bg-stone-50 pl-11 pr-4 outline-none transition focus:border-[#2f513f] focus:bg-white focus:ring-4 focus:ring-emerald-100"
                />
              </span>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-stone-700">Password</span>
              <span className="relative block">
                <LockKeyhole className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  placeholder="Enter your password"
                  className="h-12 w-full rounded-lg border border-stone-200 bg-stone-50 pl-11 pr-4 outline-none transition focus:border-[#2f513f] focus:bg-white focus:ring-4 focus:ring-emerald-100"
                />
              </span>
            </label>

            <button
              type="submit"
              disabled={isLoading}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#2f513f] font-black text-white transition hover:bg-[#244232] disabled:opacity-70"
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Login <ArrowRight className="h-4 w-4" /></>}
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-stone-500">
            New to RentEasy?{" "}
            <Link to="/register" className="font-black text-[#2f513f] hover:underline">
              Create an account
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}
