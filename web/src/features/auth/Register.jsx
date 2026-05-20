import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ClipboardCheck, Loader2, PackagePlus, ShieldCheck } from "lucide-react";
import { registerUser } from "./auth.api";

const blankForm = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export default function Register() {
  const [formData, setFormData] = useState(blankForm);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });
  const navigate = useNavigate();

  const handleChange = (event) => {
    setFormData((prev) => ({ ...prev, [event.target.name]: event.target.value }));
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
    <div className="rent-auth-page px-4 py-6 font-sans text-[#4A3428]">
      <main className="rent-auth-motion mx-auto flex min-h-[calc(100vh-3rem)] max-w-5xl items-center justify-center">
        <section className="rent-auth-card">
          <div className="rent-auth-brand">
            <div>
              <div className="rent-auth-brand-mark">R</div>
              <p className="mt-6 text-sm font-black uppercase text-white/70">RentEasy</p>
              <h2 className="mt-3 max-w-sm text-4xl font-black leading-tight text-white">Start renting in minutes</h2>
              <p className="mt-4 max-w-md text-sm leading-6 text-white/75">
                Create an account, list items for approval, and keep rental activity organized.
              </p>
            </div>
            <AuthHighlights />
          </div>

          <div className="rent-auth-form">
            <div className="mb-6 text-center sm:text-left">
              <div className="rent-logo-pulse mx-auto mb-4 inline-grid h-12 w-12 place-items-center rounded-lg bg-[#4A3428] text-xl font-black text-white shadow-sm sm:mx-0">
                R
              </div>
              <p className="mb-2 text-sm font-black uppercase text-[#4A3428]">RentEasy</p>
              <h1 className="text-3xl font-black text-[#4A3428]">Create account</h1>
            </div>

            {status.message && (
              <div
                className={`mb-5 rounded-lg border px-4 py-3 text-sm font-bold ${
                  status.type === "success"
                    ? "border-[#D0BCA0] bg-[#FDFBF9] text-[#4A3428]"
                    : "border-red-200 bg-red-50 text-red-700"
                }`}
              >
                {status.message}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="First Name" name="firstName" placeholder="Enter your first name" value={formData.firstName} onChange={handleChange} />
                <Input label="Last Name" name="lastName" placeholder="Enter your last name" value={formData.lastName} onChange={handleChange} />
              </div>
              <Input label="Email" type="email" name="email" placeholder="Enter your email address" value={formData.email} onChange={handleChange} />
              <Input label="Password" type="password" name="password" placeholder="Enter your password" value={formData.password} onChange={handleChange} />
              <Input
                label="Confirm Password"
                type="password"
                name="confirmPassword"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />

              <button
                type="submit"
                disabled={isLoading}
                className="flex h-11 w-full items-center justify-center rounded-lg bg-[#4A3428] font-black uppercase text-white shadow-sm hover:bg-[#3E2B22] disabled:opacity-70"
              >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Create Account"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm font-medium text-[#8C6A48]">
              Already registered?{" "}
              <Link to="/login" className="font-black text-[#4A3428] hover:underline">
                Login
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
    { icon: ShieldCheck, title: "Secure profile", text: "Your account gates the cart, listings, and checkout pages." },
    { icon: PackagePlus, title: "Owner tools", text: "Submit rental items with photos, price, stock, and category." },
    { icon: ClipboardCheck, title: "Admin approval", text: "New listings enter a review queue before appearing in the catalog." },
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
        className="h-11 w-full rounded-lg border border-[#D0BCA0] bg-[#FDFBF9] px-4 text-sm outline-none focus:border-[#4A3428] focus:bg-white focus:ring-4 focus:ring-[#D0BCA0]/35"
      />
    </label>
  );
}


