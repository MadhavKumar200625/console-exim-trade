"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, Mail, ShieldCheck, RefreshCw } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState("password");
  const [form, setForm] = useState({ email: "", password: "", otp: "" });
  const [message, setMessage] = useState("");
  const [devOtp, setDevOtp] = useState("");
  const [loading, setLoading] = useState(false);

  async function submitLogin(event) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Login failed.");
      setStep("otp");
      setDevOtp(data.devOtp || "");
      setMessage(data.message);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function submitOtp(event) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp: form.otp }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "OTP verification failed.");
      router.replace(searchParams.get("next") || "/");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-linear-to-b from-[#f5f9ff] to-[#eaf3ff] px-4 py-12 text-[#003466]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-md rounded-[28px] border border-blue-100 bg-white/90 p-7 shadow-[0_24px_70px_rgba(0,52,102,0.14)] backdrop-blur-xl"
      >
        <div className="mb-7 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#031c35] text-cyan-200 shadow-xl">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight">Console Login</h1>
            <p className="mt-1 text-sm font-medium text-slate-500">
              Secure access with email OTP
            </p>
          </div>
        </div>

        {step === "password" ? (
          <form onSubmit={submitLogin} className="space-y-4">
            <label className="block text-sm font-bold text-slate-600">
              Email
              <span className="mt-2 flex items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50/50 px-4 py-3">
                <Mail size={17} className="text-blue-600" />
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                  className="min-w-0 flex-1 bg-transparent font-semibold outline-none"
                />
              </span>
            </label>
            <label className="block text-sm font-bold text-slate-600">
              Password
              <span className="mt-2 flex items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50/50 px-4 py-3">
                <Lock size={17} className="text-blue-600" />
                <input
                  type="password"
                  required
                  value={form.password}
                  onChange={(event) => setForm({ ...form, password: event.target.value })}
                  className="min-w-0 flex-1 bg-transparent font-semibold outline-none"
                />
              </span>
            </label>
            <button
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-800 px-5 py-3 text-sm font-bold text-white shadow-lg disabled:cursor-wait disabled:opacity-70"
            >
              {loading && <RefreshCw size={16} className="animate-spin" />}
              Continue
            </button>
          </form>
        ) : (
          <form onSubmit={submitOtp} className="space-y-4">
            <label className="block text-sm font-bold text-slate-600">
              Email OTP
              <input
                inputMode="numeric"
                required
                minLength={6}
                maxLength={6}
                value={form.otp}
                onChange={(event) => setForm({ ...form, otp: event.target.value.replace(/\D/g, "") })}
                className="mt-2 w-full rounded-2xl border border-blue-100 bg-blue-50/50 px-4 py-3 text-center text-2xl font-black tracking-[0.35em] outline-none focus:ring-2 focus:ring-blue-400"
              />
            </label>
            <button
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-800 px-5 py-3 text-sm font-bold text-white shadow-lg disabled:cursor-wait disabled:opacity-70"
            >
              {loading && <RefreshCw size={16} className="animate-spin" />}
              Verify OTP
            </button>
          </form>
        )}

        {message && (
          <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-800">
            {message}
            {devOtp && <span className="block pt-1 font-mono">Temporary OTP: {devOtp}</span>}
          </div>
        )}
      </motion.div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
