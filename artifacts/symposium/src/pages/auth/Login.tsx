import React from "react";
import { Link } from "wouter";
import { useLogin } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { INPUT_BASE, inputBorder } from "@/components/ui/form-primitives";

export default function Login() {
  const loginMutation = useLogin();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [errors, setErrors] = React.useState<{ email?: string; password?: string; general?: string }>({});

  const validate = () => {
    const e: typeof errors = {};
    if (!email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Invalid email address";
    if (!password) e.password = "Password is required";
    else if (password.length < 6) e.password = "Password must be at least 6 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    loginMutation.mutate(
      { data: { email, password } },
      {
        onSuccess: (res) => {
          localStorage.setItem("satbds_token", res.token);
          window.location.href = (res.user.role === "admin" || res.user.role === "super_admin") ? "/admin/" : "/portal/";
        },
        onError: () => {
          setErrors({ general: "Invalid email or password. Please try again." });
        },
      }
    );
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: "linear-gradient(135deg, var(--navy) 0%, rgba(11,39,68,0.95) 60%, rgba(14,110,116,0.2) 100%)" }}
    >
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/">
            <h1 className="font-sans text-3xl font-bold cursor-pointer" style={{ color: "var(--gold)" }}>
              SEAT-MSPTM 2027
            </h1>
          </Link>
          <p className="mt-1 text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
            22–23 March 2027 · Sunway Putra Hotel, Kuala Lumpur
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="bg-white rounded-2xl shadow-2xl p-8"
        >
          <h2 className="font-sans text-2xl font-bold mb-1" style={{ color: "var(--navy)" }}>
            Sign In to Your Account
          </h2>
          <p className="text-[13px] mb-6" style={{ color: "var(--text-muted)" }}>
            Access your SEAT-MSPTM 2027 delegate portal
          </p>

          {errors.general && (
            <div
              className="mb-4 px-4 py-3 rounded-lg text-[13px]"
              style={{ background: "var(--status-danger-bg)", color: "var(--status-danger-text)" }}
            >
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[13px] font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>
                Email Address <span style={{ color: "var(--red)" }}>*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrors((p) => ({ ...p, email: undefined, general: undefined }));
                }}
                placeholder="you@example.com"
                className={INPUT_BASE}
                style={inputBorder(errors.email)}
                autoFocus
                autoComplete="email"
              />
              {errors.email && (
                <p className="text-[12px] mt-1" style={{ color: "var(--red)" }}>{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-[13px] font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>
                Password <span style={{ color: "var(--red)" }}>*</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrors((p) => ({ ...p, password: undefined, general: undefined }));
                }}
                placeholder="Enter your password"
                className={INPUT_BASE}
                style={inputBorder(errors.password)}
                autoComplete="current-password"
              />
              {errors.password && (
                <p className="text-[12px] mt-1" style={{ color: "var(--red)" }}>{errors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-60 transition-opacity mt-2"
              style={{ background: "var(--gold)" }}
            >
              {loginMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {loginMutation.isPending ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <p className="mt-5 text-center text-[13px]" style={{ color: "var(--text-muted)" }}>
            Don't have an account?{" "}
            <Link href="/register" className="font-semibold" style={{ color: "var(--teal)" }}>
              Register now
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
