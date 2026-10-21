"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "../lib/LanguageContext";
import { useTranslation } from "react-i18next";
import { apiFetch } from "../lib/api";
import { Globe, Wrench, Eye, EyeOff, ShieldCheck, ArrowRight, ArrowLeft, AlertCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { t, toggleLanguage, lang, dir } = useLanguage();
  const { t: i18nT } = useTranslation();

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "admin@homefix.test",
      password: "admin123",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setError("");
    setLoading(true);

    try {
      const res = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify(data),
      });

      if (res.data?.user?.role !== "admin") {
        throw new Error("admin_only");
      }

      localStorage.setItem("admin_token", res.data.token);
      localStorage.setItem("admin_user", JSON.stringify(res.data.user));
      router.push("/");
    } catch (err: any) {
      if (err.message === "admin_only") {
        setError(t.adminOnly);
      } else if (
        err.message?.includes("Invalid email or password") ||
        err.message?.includes("Invalid")
      ) {
        setError(t.invalidCredentials);
      } else {
        setError(err.message || t.loginFailed);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative bg-[#F8FAFC] text-slate-900 selection:bg-emerald-500 selection:text-white">
      <div className="absolute top-6 right-6 rtl:right-auto rtl:left-6">
        <button
          type="button"
          onClick={toggleLanguage}
          className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-sm font-semibold shadow-xs hover:shadow-sm transition-all"
        >
          <Globe className="w-4 h-4 text-slate-500" />
          <span>{lang === "en" ? "کوردی" : "English"}</span>
        </button>
      </div>

      <div className="w-full max-w-[440px]">
        <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-200/90 p-8 sm:p-9">
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-4 shadow-xs">
              <Wrench className="w-7 h-7 stroke-[2.2]" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{t.loginTitle}</h1>
            <p className="text-sm text-slate-500 mt-2 text-center leading-relaxed max-w-xs">
              {t.loginSubtitle}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3.5 bg-rose-50 border border-rose-200 text-rose-600 text-sm rounded-xl font-medium flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                {t.email}
              </label>
              <input
                type="email"
                {...register("email")}
                placeholder="admin@homefix.test"
                className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all text-sm shadow-xs"
              />
              {errors.email && (
                <p className="text-rose-600 text-xs mt-1.5 font-medium">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                {t.password}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all text-sm shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3.5 rtl:right-auto rtl:left-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-rose-600 text-xs mt-1.5 font-medium">
                  {errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2.5 text-sm disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <span>{t.signingIn}</span>
              ) : (
                <>
                  <span>{t.signIn}</span>
                  {dir === "rtl" ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-sm">
            <div className="flex items-center gap-2 font-semibold text-slate-600 mb-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span className="text-xs">Demo Admin Access:</span>
            </div>
            <div className="flex justify-between items-center bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-200/80 font-mono text-xs text-slate-700">
              <span className="select-all">admin@homefix.test</span>
              <span className="text-emerald-700 font-bold select-all">admin123</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}