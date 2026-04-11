import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Loader2, AlertCircle } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.text();

      if (response.ok) {
        localStorage.setItem("token", data);
        navigate("/home");
      } else {
        setError(data || "Invalid credentials.");
      }
    } catch {
      setError("Server error. Unable to connect to RentEasy.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F5F2F0] p-6 font-sans">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-[#D0BCA0]">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-[#4A3428] rounded-xl mb-4">
            <span className="text-white font-bold text-2xl">R</span>
          </div>
          <h2 className="text-3xl font-bold text-[#4A3428]">Login</h2>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-100 flex items-center gap-3 text-red-800 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#8C6A48] mb-2 px-1">Email Address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-4 py-3 bg-[#FDFBF9] border border-[#D0BCA0] rounded-xl outline-none" placeholder="email@example.com" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#8C6A48] mb-2 px-1">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-4 py-3 bg-[#FDFBF9] border border-[#D0BCA0] rounded-xl outline-none" placeholder="••••••••" />
          </div>
          <button type="submit" disabled={isLoading} className="w-full py-4 bg-[#4A3428] hover:bg-[#3E2b22] text-white font-bold rounded-xl transition-all disabled:opacity-70">
            {isLoading ? <Loader2 className="animate-spin w-5 h-5 mx-auto" /> : "Login"}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-[#F5F2F0] text-center">
          <p className="text-[#8C6A48] text-sm">Don't have an account? <Link to="/register" className="font-bold text-[#4A3428] hover:underline">Create Account</Link></p>
        </div>
      </div>
    </div>
  );
}