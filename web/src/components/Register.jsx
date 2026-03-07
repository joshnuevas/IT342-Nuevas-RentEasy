import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";

export default function Register() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return setStatus({ type: "error", message: "Passwords do not match." });
    }

    setIsLoading(true);
    setStatus({ type: "", message: "" });

    try {
      const response = await fetch("http://localhost:8080/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password
        }),
      });

      const data = await response.text();

      if (response.ok && data === "User registered successfully") {
        setStatus({ type: "success", message: "Account created! Redirecting..." });
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setStatus({ type: "error", message: data || "Registration failed." });
      }
    } catch {
      setStatus({ type: "error", message: "Server error. Could not connect." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F5F2F0] p-6 font-sans">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-[#D0BCA0]">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-[#4A3428] mb-2 border-b-2 border-[#4A3428] inline-block pb-1">Create Account</h2>
        </div>

        {status.message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 text-sm ${
            status.type === 'success' ? 'bg-green-50 text-green-800 border-green-100' : 'bg-red-50 text-red-800 border-red-100'
          }`}>
            {status.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span>{status.message}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#8C6A48] mb-1 px-1">Full Name</label>
            <div className="flex gap-2">
              <input type="text" name="firstName" onChange={handleChange} required className="w-1/2 px-4 py-3 bg-[#FDFBF9] border border-[#D0BCA0] rounded-xl outline-none" placeholder="First Name" />
              <input type="text" name="lastName" onChange={handleChange} required className="w-1/2 px-4 py-3 bg-[#FDFBF9] border border-[#D0BCA0] rounded-xl outline-none" placeholder="Last Name" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#8C6A48] mb-1 px-1">Email Address</label>
            <input type="email" name="email" onChange={handleChange} required className="w-full px-4 py-3 bg-[#FDFBF9] border border-[#D0BCA0] rounded-xl outline-none" placeholder="email@example.com" />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#8C6A48] mb-1 px-1">Password</label>
            <input type="password" name="password" onChange={handleChange} required className="w-full px-4 py-3 bg-[#FDFBF9] border border-[#D0BCA0] rounded-xl outline-none" placeholder="••••••••" />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#8C6A48] mb-1 px-1">Confirm Password</label>
            <input type="password" name="confirmPassword" onChange={handleChange} required className="w-full px-4 py-3 bg-[#FDFBF9] border border-[#D0BCA0] rounded-xl outline-none" placeholder="••••••••" />
          </div>

          <button type="submit" disabled={isLoading} className="w-full py-4 bg-[#4A3428] hover:bg-[#3E2b22] text-white font-bold rounded-xl mt-4 transition-all disabled:opacity-70">
            {isLoading ? <Loader2 className="animate-spin w-5 h-5 mx-auto" /> : "Create Account"}
          </button>
        </form>

        <div className="mt-8 text-center text-sm">
          <Link to="/login" className="font-bold text-[#4A3428] border-b border-[#4A3428]">Already have an account?</Link>
        </div>
      </div>
    </div>
  );
}