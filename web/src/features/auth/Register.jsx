import { createElement, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle2, Loader2, Mail, ShieldCheck, UserRound } from "lucide-react";
import { registerUser } from "./auth.api";

export default function Register() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });
  const navigate = useNavigate();

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setStatus({ type: "error", message: "Passwords do not match." });
      return;
    }

    setIsLoading(true);
    setStatus({ type: "", message: "" });

    try {
      const response = await registerUser({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
      });
      const data = await response.text();

      if (response.ok) {
        setStatus({ type: "success", message: "Account created. Redirecting to login..." });
        setTimeout(() => navigate("/login"), 900);
      } else {
        setStatus({ type: "error", message: data || "Registration failed." });
      }
    } catch {
      localStorage.removeItem("token");
      setStatus({ type: "error", message: "Cannot reach the backend. Start Spring Boot first, then create the account again." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F2F0] px-4 py-8">
      <div className="rent-auth-motion mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-8 lg:grid-cols-[440px_1fr]">
        <section className="rent-card-motion rounded-lg border border-[#D0BCA0] bg-white p-6 shadow-xl shadow-[#D0BCA0]/60 sm:p-8">
          <div className="mb-8">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#8C6A48]">Start renting</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-[#4A3428]">Create your account</h1>
            <p className="mt-2 text-sm leading-6 text-[#8C6A48]">
              Sign up to list gear, add rentals to cart, and manage checkout details.
            </p>
          </div>

          {status.message && (
            <div
              className={`mb-5 rounded-lg border px-4 py-3 text-sm font-semibold ${
                status.type === "success"
                  ? "border-[#D0BCA0] bg-[#FDFBF9] text-[#4A3428]"
                  : "border-red-100 bg-red-50 text-red-700"
              }`}
            >
              {status.message}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="First name" name="firstName" value={formData.firstName} onChange={handleChange} icon={UserRound} />
              <Input label="Last name" name="lastName" value={formData.lastName} onChange={handleChange} icon={UserRound} />
            </div>
            <Input label="Email address" type="email" name="email" value={formData.email} onChange={handleChange} icon={Mail} />
            <Input label="Password" type="password" name="password" value={formData.password} onChange={handleChange} icon={ShieldCheck} />
            <Input
              label="Confirm password"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              icon={ShieldCheck}
            />

            <button
              type="submit"
              disabled={isLoading}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#4A3428] font-black text-white transition hover:bg-[#3E2B22] disabled:opacity-70"
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Create Account <CheckCircle2 className="h-4 w-4" /></>}
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-[#8C6A48]">
            Already have an account?{" "}
            <Link to="/login" className="font-black text-[#4A3428] hover:underline">
              Login
            </Link>
          </p>
        </section>

        <section className="rent-card-motion hidden overflow-hidden rounded-lg bg-[#4A3428] text-white shadow-2xl lg:block">
          <div className="relative min-h-[640px]">
            <img
              src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80"
              alt="Creator workspace with rental equipment"
              className="absolute inset-0 h-full w-full object-cover opacity-55"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-[#4A3428] via-[#4A3428]/70 to-[#8C6A48]/70" />
            <div className="relative flex h-full min-h-[640px] flex-col justify-end p-10">
              <p className="mb-4 inline-flex w-fit rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-[#FDFBF9] ring-1 ring-white/20">
                Built around the SDD rental journey
              </p>
              <h2 className="max-w-xl text-5xl font-black leading-tight tracking-tight">
                List products, browse rentals, manage cart, and checkout from one place.
              </h2>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function Input({ label, icon: Icon, ...props }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-[#4A3428]">{label}</span>
      <span className="relative block">
        {createElement(Icon, { className: "absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8C6A48]" })}
        <input
          {...props}
          required
          className="h-12 w-full rounded-lg border border-[#D0BCA0] bg-[#FDFBF9] pl-11 pr-4 outline-none transition focus:border-[#4A3428] focus:bg-white focus:ring-4 focus:ring-[#D0BCA0]/45"
        />
      </span>
    </label>
  );
}
