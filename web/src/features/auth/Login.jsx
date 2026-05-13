import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
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
    <div className="min-h-screen bg-[#F5F2F0] px-4 py-10 font-sans text-[#4A3428]">
      <main className="rent-auth-motion mx-auto flex min-h-[calc(100vh-5rem)] max-w-xl items-center justify-center">
        <section className="w-full rounded-lg border border-[#D0BCA0] bg-white p-8 shadow-xl shadow-[#D0BCA0]/45">
          <div className="mb-8 text-center">
            <div className="rent-logo-pulse mx-auto mb-5 inline-block rounded-lg bg-[#4A3428] px-6 py-3 text-2xl font-black text-white shadow-sm">
              RentEasy
            </div>
            <h1 className="text-3xl font-black tracking-tight text-[#4A3428]">Login</h1>
          </div>

          {error && (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <Input label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
            <Input label="Password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />

            <button
              type="submit"
              disabled={isLoading}
              className="flex h-12 w-full items-center justify-center rounded-lg bg-[#4A3428] font-black uppercase tracking-wide text-white shadow-sm hover:bg-[#3E2B22] disabled:opacity-70"
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
        </section>
      </main>
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
