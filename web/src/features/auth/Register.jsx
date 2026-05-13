import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
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
    <div className="min-h-screen bg-[#F5F2F0] px-4 py-10 font-sans text-[#4A3428]">
      <main className="rent-auth-motion mx-auto flex min-h-[calc(100vh-5rem)] max-w-2xl items-center justify-center">
        <section className="w-full border-2 border-[#4A3428] bg-white p-8 shadow-sm">
          <div className="mb-8 text-center">
            <div className="rent-logo-pulse mx-auto mb-5 inline-block border-2 border-[#4A3428] bg-[#FDFBF9] px-6 py-2 text-2xl font-black">
              RentEasy
            </div>
            <h1 className="text-xl font-bold uppercase">[Register]</h1>
          </div>

          {status.message && (
            <div
              className={`mb-5 border-2 px-4 py-3 text-sm font-bold ${
                status.type === "success"
                  ? "border-[#D0BCA0] bg-[#FDFBF9] text-[#4A3428]"
                  : "border-red-500 bg-red-50 text-red-700"
              }`}
            >
              {status.message}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="[First Name]" name="firstName" value={formData.firstName} onChange={handleChange} />
              <Input label="[Last Name]" name="lastName" value={formData.lastName} onChange={handleChange} />
            </div>
            <Input label="[Email]" type="email" name="email" value={formData.email} onChange={handleChange} />
            <Input label="[Password]" type="password" name="password" value={formData.password} onChange={handleChange} />
            <Input
              label="[Confirm Password]"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
            />

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center border-2 border-[#4A3428] bg-[#4A3428] py-3 font-bold uppercase text-white hover:bg-[#3E2B22] disabled:opacity-70"
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "[Create Account]"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm font-medium text-[#8C6A48]">
            [Already registered?]{" "}
            <Link to="/login" className="font-bold text-[#4A3428] underline">
              [Login]
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
      <span className="mb-2 inline-block border-2 border-[#4A3428] bg-[#FDFBF9] px-3 py-1 text-sm font-bold">
        {label}
      </span>
      <input
        {...props}
        required
        className="w-full border-2 border-[#4A3428] bg-white p-3 text-sm outline-none focus:bg-[#FDFBF9]"
      />
    </label>
  );
}
