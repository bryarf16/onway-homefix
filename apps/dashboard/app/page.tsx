"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "./lib/LanguageContext";
import { useTranslation } from "react-i18next";
import { apiFetch } from "./lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Globe,
  LogOut,
  Wrench,
  CalendarCheck2,
  Clock,
  CheckCircle2,
  Filter,
  Layers,
  Users,
  RefreshCw,
  Plus,
  X,
  Check,
  Pencil,
} from "lucide-react";

interface Booking {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  scheduledAt: string;
  status: "pending" | "confirmed" | "in_progress" | "completed" | "cancelled";
  notes?: string;
  provider?: {
    id: string;
    name: string;
    city: string;
  };
}

interface Category {
  id: string;
  name: string;
  nameCkb: string;
  isActive: boolean;
}

interface Provider {
  id: string;
  categoryId?: string;
  name: string;
  city: string;
  phone: string;
  hourlyRate: number;
  isActive: boolean;
}

const categorySchema = z.object({
  name: z.string().min(2, "English name is required (min 2 chars)"),
  nameCkb: z.string().min(2, "ناوی کوردی پێویستە (لانیکەم ٢ پیت)"),
  isActive: z.boolean().optional(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

const providerSchema = z.object({
  name: z.string().min(2, "Provider name is required"),
  categoryId: z.string().min(1, "Please select a category"),
  city: z.string().min(2, "City is required"),
  phone: z.string().min(6, "Valid phone number is required"),
  hourlyRate: z.number().positive("Hourly rate must be positive"),
  isActive: z.boolean().optional(),
});

type ProviderFormValues = z.infer<typeof providerSchema>;

export default function DashboardPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { t, toggleLanguage, lang } = useLanguage();
  const { t: i18nT } = useTranslation();

  const [activeTab, setActiveTab] = useState<"bookings" | "categories" | "providers">("bookings");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [providerCategoryFilter, setProviderCategoryFilter] = useState<string>("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.push("/login");
    }
  }, [router]);

  const {
    data: bookingsResponse,
    isLoading: loadingBookings,
    refetch: refetchBookings,
    isFetching: isFetchingBookings,
  } = useQuery({
    queryKey: ["admin_bookings", statusFilter],
    queryFn: () =>
      apiFetch(statusFilter === "all" ? "/admin/bookings" : `/admin/bookings?status=${statusFilter}`),
  });

  const {
    data: categoriesResponse,
    isLoading: loadingCategories,
    refetch: refetchCategories,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: () => apiFetch("/categories"),
  });

  const {
    data: providersResponse,
    isLoading: loadingProviders,
    refetch: refetchProviders,
  } = useQuery({
    queryKey: ["providers", providerCategoryFilter],
    queryFn: () =>
      apiFetch(
        providerCategoryFilter === "all"
          ? "/providers?all=true"
          : `/providers?all=true&categoryId=${providerCategoryFilter}`
      ),
  });

  const bookings: Booking[] = bookingsResponse?.data || [];
  const categories: Category[] = categoriesResponse?.data || [];
  const providers: Provider[] = providersResponse?.data || [];
  const loading = loadingBookings || loadingCategories || loadingProviders;

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, newStatus }: { id: string; newStatus: string }) => {
      return apiFetch(`/bookings/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_bookings"] });
      showToast(t.successUpdated || "Updated successfully!");
    },
    onError: (err: any) => {
      alert(err.message || "Failed to update status");
    },
    onSettled: () => {
      setUpdatingId(null);
    },
  });

  const createCategoryMutation = useMutation({
    mutationFn: async (data: CategoryFormValues) => {
      return apiFetch("/categories", {
        method: "POST",
        body: JSON.stringify({
          name: data.name,
          nameCkb: data.nameCkb,
          isActive: true,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setShowCategoryModal(false);
      resetNewCategory();
      showToast(t.successAdded || "Added successfully!");
    },
    onError: (err: any) => {
      alert(err.message || "Failed to add category");
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Category> }) => {
      return apiFetch(`/categories/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setEditingCategory(null);
      showToast(t.successUpdated || "Updated successfully!");
    },
    onError: (err: any) => {
      alert(err.message || "Failed to update category");
    },
  });

  const createProviderMutation = useMutation({
    mutationFn: async (data: ProviderFormValues) => {
      return apiFetch("/providers", {
        method: "POST",
        body: JSON.stringify({
          name: data.name,
          categoryId: data.categoryId,
          city: data.city,
          phone: data.phone,
          hourlyRate: Number(data.hourlyRate),
          isActive: true,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["providers"] });
      setShowProviderModal(false);
      resetNewProvider();
      showToast(t.successAdded || "Added successfully!");
    },
    onError: (err: any) => {
      alert(err.message || "Failed to add provider");
    },
  });

  const updateProviderMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Provider> }) => {
      return apiFetch(`/providers/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["providers"] });
      setEditingProvider(null);
      showToast(t.successUpdated || "Updated successfully!");
    },
    onError: (err: any) => {
      alert(err.message || "Failed to update provider");
    },
  });

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const {
    register: registerNewCat,
    handleSubmit: submitNewCategory,
    reset: resetNewCategory,
    formState: { errors: newCatErrors, isSubmitting: savingCategory },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema) as any,
    defaultValues: { name: "", nameCkb: "", isActive: true },
  });

  const [showProviderModal, setShowProviderModal] = useState(false);
  const {
    register: registerNewProv,
    handleSubmit: submitNewProvider,
    reset: resetNewProvider,
    setValue: setNewProvValue,
    formState: { errors: newProvErrors, isSubmitting: savingProvider },
  } = useForm<ProviderFormValues>({
    resolver: zodResolver(providerSchema) as any,
    defaultValues: {
      name: "",
      categoryId: "",
      city: "Erbil",
      phone: "",
      hourlyRate: 25000,
      isActive: true,
    },
  });

  useEffect(() => {
    if (categories.length > 0) {
      setNewProvValue("categoryId", categories[0].id);
    }
  }, [categories, setNewProvValue]);

  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const {
    register: registerEditCat,
    handleSubmit: submitEditCategory,
    setValue: setEditCatValue,
    formState: { errors: editCatErrors, isSubmitting: savingEditCategory },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema) as any,
  });

  const openEditCategory = (c: Category) => {
    setEditingCategory(c);
    setEditCatValue("name", c.name);
    setEditCatValue("nameCkb", c.nameCkb);
    setEditCatValue("isActive", c.isActive);
  };

  const [editingProvider, setEditingProvider] = useState<Provider | null>(null);
  const {
    register: registerEditProv,
    handleSubmit: submitEditProvider,
    setValue: setEditProvValue,
    formState: { errors: editProvErrors, isSubmitting: savingEditProvider },
  } = useForm<ProviderFormValues>({
    resolver: zodResolver(providerSchema) as any,
  });

  const openEditProvider = (p: Provider) => {
    setEditingProvider(p);
    setEditProvValue("name", p.name);
    setEditProvValue("categoryId", p.categoryId || (categories[0]?.id || ""));
    setEditProvValue("city", p.city);
    setEditProvValue("phone", p.phone);
    setEditProvValue("hourlyRate", p.hourlyRate);
    setEditProvValue("isActive", p.isActive);
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    router.push("/login");
  };

  const handleUpdateStatus = (id: string, newStatus: string) => {
    setUpdatingId(id);
    updateStatusMutation.mutate({ id, newStatus });
  };

  const toggleProviderStatus = (id: string, currentStatus: boolean) => {
    updateProviderMutation.mutate({ id, data: { isActive: !currentStatus } });
  };

  const toggleCategoryStatus = (id: string, currentStatus: boolean) => {
    updateCategoryMutation.mutate({ id, data: { isActive: !currentStatus } });
  };

  const handleRefreshAll = () => {
    refetchBookings();
    refetchCategories();
    refetchProviders();
  };

  const totalCount = bookings.length;
  const pendingCount = bookings.filter((b) => b.status === "pending").length;
  const confirmedCount = bookings.filter((b) => b.status === "confirmed").length;
  const completedCount = bookings.filter((b) => b.status === "completed").length;

  const getStatusBadge = (status: Booking["status"]) => {
    const map: Record<string, { bg: string; label: string }> = {
      pending: { bg: "bg-amber-50 text-amber-700 border-amber-200", label: t.pending },
      confirmed: { bg: "bg-blue-50 text-blue-700 border-blue-200", label: t.confirmed },
      in_progress: { bg: "bg-purple-50 text-purple-700 border-purple-200", label: t.in_progress },
      completed: { bg: "bg-emerald-50 text-emerald-700 border-emerald-200", label: t.completed },
      cancelled: { bg: "bg-rose-50 text-rose-700 border-rose-200", label: t.cancelled },
    };
    const s = map[status] || map.pending;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${s.bg}`}>
        {s.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-16 selection:bg-emerald-500 selection:text-white relative">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg border border-emerald-500 font-medium text-sm">
          <Check className="w-5 h-5" />
          <span>{toastMessage}</span>
        </div>
      )}

      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
              <Wrench className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <span className="font-extrabold text-slate-900 text-xl leading-none block">HomeFix</span>
              <span className="text-xs text-slate-500 font-medium mt-1 block">
                {lang === "ckb" ? "داشبۆردی بەڕێوەبردن" : "Admin Workspace"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold shadow-2xs transition cursor-pointer"
            >
              <Globe className="w-4 h-4 text-slate-500" />
              <span>{lang === "en" ? "کوردی" : "English"}</span>
            </button>

            <button
              onClick={handleRefreshAll}
              disabled={loading || isFetchingBookings}
              title="Refresh"
              className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isFetchingBookings ? "animate-spin" : ""}`} />
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-100/60 text-rose-600 text-sm font-semibold transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>{t.logout}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between text-slate-500 mb-3">
              <span className="text-sm font-semibold">{t.totalBookings}</span>
              <CalendarCheck2 className="w-5 h-5 text-slate-400" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">{totalCount}</div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between text-amber-600 mb-3">
              <span className="text-sm font-semibold">{t.pendingBookings}</span>
              <Clock className="w-5 h-5" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">{pendingCount}</div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between text-blue-600 mb-3">
              <span className="text-sm font-semibold">{t.confirmedBookings}</span>
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">{confirmedCount}</div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between text-emerald-600 mb-3">
              <span className="text-sm font-semibold">{t.completedBookings}</span>
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">{completedCount}</div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6 border-b border-slate-200 pb-3.5">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setActiveTab("bookings")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition cursor-pointer ${
                activeTab === "bookings"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              <CalendarCheck2 className="w-4 h-4" />
              <span>{t.bookings}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-black/10">{bookings.length}</span>
            </button>

            <button
              onClick={() => setActiveTab("categories")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition cursor-pointer ${
                activeTab === "categories"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>{t.categories}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-black/10">{categories.length}</span>
            </button>

            <button
              onClick={() => setActiveTab("providers")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition cursor-pointer ${
                activeTab === "providers"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              <Users className="w-4 h-4" />
              <span>{t.providers}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-black/10">{providers.length}</span>
            </button>
          </div>

          <div>
            {activeTab === "categories" && (
              <button
                onClick={() => setShowCategoryModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl shadow-xs transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{t.addNewCategory}</span>
              </button>
            )}

            {activeTab === "providers" && (
              <button
                onClick={() => setShowProviderModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl shadow-xs transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{t.addNewProvider}</span>
              </button>
            )}
          </div>
        </div>

        {activeTab === "bookings" && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-slate-500 text-sm font-semibold">
                <Filter className="w-4 h-4" />
                <span>{t.status}:</span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {["all", "pending", "confirmed", "in_progress", "completed", "cancelled"].map(
                  (st) => (
                    <button
                      key={st}
                      onClick={() => setStatusFilter(st)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                        statusFilter === st
                          ? "bg-slate-900 text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {st === "all" ? t.allStatuses : (t as any)[st] || st}
                    </button>
                  )
                )}
              </div>
            </div>

            {loadingBookings ? (
              <div className="p-12 text-center text-slate-400">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
                <span>Loading bookings...</span>
              </div>
            ) : bookings.length === 0 ? (
              <div className="p-12 text-center text-slate-400 font-medium">
                {t.noBookings}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left rtl:text-right border-collapse">
                  <thead>
                    <tr className="bg-slate-50/75 border-b border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider">
                      <th className="py-4 px-6">{t.customer}</th>
                      <th className="py-4 px-6">{t.provider}</th>
                      <th className="py-4 px-6">{t.date}</th>
                      <th className="py-4 px-6">{t.status}</th>
                      <th className="py-4 px-6 text-center">{t.actions}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm font-medium">
                    {bookings.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-4 px-6">
                          <div className="font-bold text-slate-900">{b.customerName}</div>
                          <div className="text-xs text-slate-500 font-mono mt-0.5">{b.phone}</div>
                          <div className="text-xs text-slate-400 mt-0.5 truncate max-w-xs">{b.address}</div>
                        </td>

                        <td className="py-4 px-6">
                          <div className="font-bold text-slate-800">
                            {b.provider?.name || "N/A"}
                          </div>
                          <div className="text-xs text-slate-400">
                            {b.provider?.city === "Erbil"
                              ? lang === "ckb" ? "هەولێر" : "Erbil"
                              : b.provider?.city === "Sulaymaniyah"
                              ? lang === "ckb" ? "سلێمانی" : "Sulaymaniyah"
                              : b.provider?.city === "Ranya"
                              ? lang === "ckb" ? "ڕانیە" : "Ranya"
                              : b.provider?.city === "Duhok"
                              ? lang === "ckb" ? "دهۆک" : "Duhok"
                              : b.provider?.city || ""}
                          </div>
                        </td>

                        <td className="py-4 px-6 whitespace-nowrap text-xs text-slate-600">
                          {new Date(b.scheduledAt).toLocaleString(lang === "ckb" ? "ckb" : "en-US", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </td>

                        <td className="py-4 px-6 whitespace-nowrap">{getStatusBadge(b.status)}</td>

                        <td className="py-4 px-6 text-center whitespace-nowrap">
                          {b.status === "pending" && (
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleUpdateStatus(b.id, "confirmed")}
                                disabled={updatingId === b.id}
                                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition cursor-pointer disabled:opacity-50"
                              >
                                {lang === "ckb" ? "پەسەندکردن" : "Confirm"}
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(b.id, "cancelled")}
                                disabled={updatingId === b.id}
                                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-xs font-semibold transition cursor-pointer disabled:opacity-50"
                              >
                                {lang === "ckb" ? "هەڵوەشاندنەوە" : "Cancel"}
                              </button>
                            </div>
                          )}

                          {b.status === "confirmed" && (
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleUpdateStatus(b.id, "in_progress")}
                                disabled={updatingId === b.id}
                                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition cursor-pointer disabled:opacity-50"
                              >
                                {lang === "ckb" ? "دەستپێکردن" : "Start Progress"}
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(b.id, "cancelled")}
                                disabled={updatingId === b.id}
                                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-xs font-semibold transition cursor-pointer disabled:opacity-50"
                              >
                                {lang === "ckb" ? "هەڵوەشاندنەوە" : "Cancel"}
                              </button>
                            </div>
                          )}

                          {b.status === "in_progress" && (
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleUpdateStatus(b.id, "completed")}
                                disabled={updatingId === b.id}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition cursor-pointer disabled:opacity-50"
                              >
                                {lang === "ckb" ? "تەواوکردن" : "Complete"}
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(b.id, "cancelled")}
                                disabled={updatingId === b.id}
                                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-xs font-semibold transition cursor-pointer disabled:opacity-50"
                              >
                                {lang === "ckb" ? "هەڵوەشاندنەوە" : "Cancel"}
                              </button>
                            </div>
                          )}

                          {(b.status === "completed" || b.status === "cancelled") && (
                            <span className="text-xs text-slate-400 font-medium italic">
                              {lang === "ckb" ? "کۆتایی هاتووە" : "Closed"}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "categories" && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left rtl:text-right border-collapse">
                <thead>
                  <tr className="bg-slate-50/75 border-b border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider">
                    <th className="py-4 px-6">{t.name} (English)</th>
                    <th className="py-4 px-6">{t.nameKurdish} (کوردی)</th>
                    <th className="py-4 px-6">{t.status}</th>
                    <th className="py-4 px-6 text-center">{t.actions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm font-medium">
                  {categories.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-6 font-bold text-slate-900">{c.name}</td>
                      <td className="py-4 px-6 font-bold text-slate-800">{c.nameCkb}</td>
                      <td className="py-4 px-6">
                        <button
                          onClick={() => toggleCategoryStatus(c.id, c.isActive)}
                          className={`px-3 py-1 rounded-full text-xs font-semibold border transition cursor-pointer ${
                            c.isActive
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                              : "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200"
                          }`}
                        >
                          {c.isActive ? t.active || "Active" : t.inactive || "Inactive"}
                        </button>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <button
                          onClick={() => openEditCategory(c)}
                          className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition cursor-pointer inline-flex items-center gap-1 text-xs font-semibold"
                        >
                          <Pencil className="w-4 h-4" />
                          <span>{t.edit || "Edit"}</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "providers" && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-slate-500 text-sm font-semibold">
                <Filter className="w-4 h-4" />
                <span>{t.selectCategory}:</span>
              </div>
              <div>
                <select
                  value={providerCategoryFilter}
                  onChange={(e) => setProviderCategoryFilter(e.target.value)}
                  className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:border-emerald-500"
                >
                  <option value="all">{t.allCategories}</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {lang === "ckb" ? c.nameCkb : c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left rtl:text-right border-collapse">
                <thead>
                  <tr className="bg-slate-50/75 border-b border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider">
                    <th className="py-4 px-6">{t.name}</th>
                    <th className="py-4 px-6">{t.city}</th>
                    <th className="py-4 px-6">{t.phone}</th>
                    <th className="py-4 px-6">{t.hourlyRate}</th>
                    <th className="py-4 px-6">{t.status}</th>
                    <th className="py-4 px-6 text-center">{t.actions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm font-medium">
                  {providers.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-6 font-bold text-slate-900">{p.name}</td>
                      <td className="py-4 px-6 text-slate-600 font-medium">
                        {p.city === "Erbil"
                          ? lang === "ckb" ? "هەولێر" : "Erbil"
                          : p.city === "Sulaymaniyah"
                          ? lang === "ckb" ? "سلێمانی" : "Sulaymaniyah"
                          : p.city === "Ranya"
                          ? lang === "ckb" ? "ڕانیە" : "Ranya"
                          : p.city === "Duhok"
                          ? lang === "ckb" ? "دهۆک" : "Duhok"
                          : p.city}
                      </td>
                      <td className="py-4 px-6 font-mono text-xs text-slate-600">{p.phone}</td>
                      <td className="py-4 px-6 font-semibold text-slate-900">
                        {p.hourlyRate.toLocaleString()} {t.iqd}
                      </td>
                      <td className="py-4 px-6">
                        <button
                          onClick={() => toggleProviderStatus(p.id, p.isActive)}
                          className={`px-3 py-1 rounded-full text-xs font-semibold border transition cursor-pointer ${
                            p.isActive
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                              : "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200"
                          }`}
                        >
                          {p.isActive ? t.active || "Active" : t.inactive || "Inactive"}
                        </button>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <button
                          onClick={() => openEditProvider(p)}
                          className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition cursor-pointer inline-flex items-center gap-1 text-xs font-semibold"
                        >
                          <Pencil className="w-4 h-4" />
                          <span>{t.edit || "Edit"}</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {showCategoryModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <h2 className="text-base font-bold text-slate-900">{t.addNewCategory}</h2>
              <button
                onClick={() => setShowCategoryModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={submitNewCategory((data) => createCategoryMutation.mutate(data))}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {t.name} (English)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Electrical Services"
                  {...registerNewCat("name")}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:border-emerald-500"
                />
                {newCatErrors.name && (
                  <p className="text-rose-600 text-xs mt-1 font-medium">{newCatErrors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {t.nameKurdish} (کوردی)
                </label>
                <input
                  type="text"
                  placeholder="بۆ نموونە: خزمەتگوزاری کارەبا"
                  {...registerNewCat("nameCkb")}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:border-emerald-500"
                />
                {newCatErrors.nameCkb && (
                  <p className="text-rose-600 text-xs mt-1 font-medium">{newCatErrors.nameCkb.message}</p>
                )}
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 text-xs font-semibold rounded-xl hover:bg-slate-50 cursor-pointer"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={savingCategory}
                  className="px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-xl hover:bg-emerald-700 disabled:opacity-50 cursor-pointer"
                >
                  {savingCategory ? "..." : t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showProviderModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <h2 className="text-base font-bold text-slate-900">{t.addNewProvider}</h2>
              <button
                onClick={() => setShowProviderModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={submitNewProvider((data) => createProviderMutation.mutate(data))}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">{t.name}</label>
                <input
                  type="text"
                  placeholder="e.g. وەستا سامان محەمەد"
                  {...registerNewProv("name")}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:border-emerald-500"
                />
                {newProvErrors.name && (
                  <p className="text-rose-600 text-xs mt-1 font-medium">{newProvErrors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {t.categories}
                </label>
                <select
                  {...registerNewProv("categoryId")}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:border-emerald-500"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {lang === "ckb" ? c.nameCkb : c.name}
                    </option>
                  ))}
                </select>
                {newProvErrors.categoryId && (
                  <p className="text-rose-600 text-xs mt-1 font-medium">
                    {newProvErrors.categoryId.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">{t.city}</label>
                  <select
                    {...registerNewProv("city")}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Erbil">{lang === "ckb" ? "هەولێر (Erbil)" : "Erbil"}</option>
                    <option value="Sulaymaniyah">{lang === "ckb" ? "سلێمانی (Sulaymaniyah)" : "Sulaymaniyah"}</option>
                    <option value="Ranya">{lang === "ckb" ? "ڕانیە (Ranya)" : "Ranya"}</option>
                    <option value="Duhok">{lang === "ckb" ? "دهۆک (Duhok)" : "Duhok"}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    {t.hourlyRate}
                  </label>
                  <input
                    type="number"
                    step="1000"
                    {...registerNewProv("hourlyRate", { valueAsNumber: true })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                  {newProvErrors.hourlyRate && (
                    <p className="text-rose-600 text-xs mt-1 font-medium">
                      {newProvErrors.hourlyRate.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">{t.phone}</label>
                <input
                  type="text"
                  placeholder="0750xxxxxxx"
                  {...registerNewProv("phone")}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-mono font-medium text-slate-900 focus:outline-none focus:border-emerald-500"
                />
                {newProvErrors.phone && (
                  <p className="text-rose-600 text-xs mt-1 font-medium">{newProvErrors.phone.message}</p>
                )}
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowProviderModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 text-xs font-semibold rounded-xl hover:bg-slate-50 cursor-pointer"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={savingProvider}
                  className="px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-xl hover:bg-emerald-700 disabled:opacity-50 cursor-pointer"
                >
                  {savingProvider ? "..." : t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingCategory && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <h2 className="text-base font-bold text-slate-900">{t.editCategory}</h2>
              <button
                onClick={() => setEditingCategory(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={submitEditCategory((data) =>
                updateCategoryMutation.mutate({ id: editingCategory.id, data })
              )}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {t.name} (EN)
                </label>
                <input
                  type="text"
                  {...registerEditCat("name")}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:border-emerald-500"
                />
                {editCatErrors.name && (
                  <p className="text-rose-600 text-xs mt-1 font-medium">{editCatErrors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {t.nameKurdish} (CKB)
                </label>
                <input
                  type="text"
                  {...registerEditCat("nameCkb")}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:border-emerald-500"
                />
                {editCatErrors.nameCkb && (
                  <p className="text-rose-600 text-xs mt-1 font-medium">
                    {editCatErrors.nameCkb.message}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="editCatActive"
                  {...registerEditCat("isActive")}
                  className="w-4 h-4 text-emerald-600 rounded-sm border-slate-300 focus:ring-emerald-500 cursor-pointer"
                />
                <label htmlFor="editCatActive" className="text-sm font-semibold text-slate-700 cursor-pointer">
                  {t.active || "Active"}
                </label>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 text-xs font-semibold rounded-xl hover:bg-slate-50 cursor-pointer"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={savingEditCategory}
                  className="px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-xl hover:bg-emerald-700 disabled:opacity-50 cursor-pointer"
                >
                  {savingEditCategory ? "..." : t.saveChanges || t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingProvider && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <h2 className="text-base font-bold text-slate-900">{t.editProvider}</h2>
              <button
                onClick={() => setEditingProvider(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={submitEditProvider((data) =>
                updateProviderMutation.mutate({ id: editingProvider.id, data })
              )}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">{t.name}</label>
                <input
                  type="text"
                  {...registerEditProv("name")}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:border-emerald-500"
                />
                {editProvErrors.name && (
                  <p className="text-rose-600 text-xs mt-1 font-medium">{editProvErrors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {t.categories}
                </label>
                <select
                  {...registerEditProv("categoryId")}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:border-emerald-500"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {lang === "ckb" ? c.nameCkb : c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">{t.city}</label>
                  <select
                    {...registerEditProv("city")}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Erbil">{lang === "ckb" ? "هەولێر (Erbil)" : "Erbil"}</option>
                    <option value="Sulaymaniyah">{lang === "ckb" ? "سلێمانی (Sulaymaniyah)" : "Sulaymaniyah"}</option>
                    <option value="Ranya">{lang === "ckb" ? "ڕانیە (Ranya)" : "Ranya"}</option>
                    <option value="Duhok">{lang === "ckb" ? "دهۆک (Duhok)" : "Duhok"}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    {t.hourlyRate}
                  </label>
                  <input
                    type="number"
                    step="1000"
                    {...registerEditProv("hourlyRate", { valueAsNumber: true })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                  {editProvErrors.hourlyRate && (
                    <p className="text-rose-600 text-xs mt-1 font-medium">
                      {editProvErrors.hourlyRate.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">{t.phone}</label>
                <input
                  type="text"
                  {...registerEditProv("phone")}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-mono font-medium text-slate-900 focus:outline-none focus:border-emerald-500"
                />
                {editProvErrors.phone && (
                  <p className="text-rose-600 text-xs mt-1 font-medium">{editProvErrors.phone.message}</p>
                )}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="editProvActive"
                  {...registerEditProv("isActive")}
                  className="w-4 h-4 text-emerald-600 rounded-sm border-slate-300 focus:ring-emerald-500 cursor-pointer"
                />
                <label htmlFor="editProvActive" className="text-sm font-semibold text-slate-700 cursor-pointer">
                  {t.active || "Active"}
                </label>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingProvider(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 text-xs font-semibold rounded-xl hover:bg-slate-50 cursor-pointer"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={savingEditProvider}
                  className="px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-xl hover:bg-emerald-700 disabled:opacity-50 cursor-pointer"
                >
                  {savingEditProvider ? "..." : t.saveChanges || t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}