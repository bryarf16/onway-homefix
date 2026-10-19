"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "./lib/LanguageContext";
import { apiFetch } from "./lib/api";
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

export default function DashboardPage() {
  const router = useRouter();
  const { t, toggleLanguage, lang } = useLanguage();

  const [activeTab, setActiveTab] = useState<"bookings" | "categories" | "providers">("bookings");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [providerCategoryFilter, setProviderCategoryFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // پەیامی سەرکەوتن (Toast Notification)
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // مۆداڵەکانی زیادکردن
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatNameCkb, setNewCatNameCkb] = useState("");
  const [savingCategory, setSavingCategory] = useState(false);

  const [showProviderModal, setShowProviderModal] = useState(false);
  const [newProvName, setNewProvName] = useState("");
  const [newProvCatId, setNewProvCatId] = useState("");
  const [newProvCity, setNewProvCity] = useState("Erbil");
  const [newProvPhone, setNewProvPhone] = useState("");
  const [newProvRate, setNewProvRate] = useState(25000);
  const [savingProvider, setSavingProvider] = useState(false);

  // مۆداڵەکانی دەستکاریکردن (Edit Modals)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editCatName, setEditCatName] = useState("");
  const [editCatNameCkb, setEditCatNameCkb] = useState("");
  const [editCatActive, setEditCatActive] = useState(true);
  const [savingEditCategory, setSavingEditCategory] = useState(false);

  const [editingProvider, setEditingProvider] = useState<Provider | null>(null);
  const [editProvName, setEditProvName] = useState("");
  const [editProvCatId, setEditProvCatId] = useState("");
  const [editProvCity, setEditProvCity] = useState("Erbil");
  const [editProvPhone, setEditProvPhone] = useState("");
  const [editProvRate, setEditProvRate] = useState(25000);
  const [editProvActive, setEditProvActive] = useState(true);
  const [savingEditProvider, setSavingEditProvider] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.push("/login");
      return;
    }
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [bRes, cRes, pRes] = await Promise.all([
        apiFetch("/admin/bookings"),
        apiFetch("/categories"),
        apiFetch("/providers?all=true"),
      ]);
      setBookings(bRes.data || []);
      setCategories(cRes.data || []);
      setProviders(pRes.data || []);
      if (cRes.data?.length > 0 && !newProvCatId) {
        setNewProvCatId(cRes.data[0].id);
      }
    } catch (err) {
      console.error("Failed to load dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    router.push("/login");
  };

  // نوێکردنەوەی دۆخی حجز
  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    try {
      await apiFetch(`/bookings/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });
      showToast(t.successUpdated || "Updated successfully!");
      await loadData();
    } catch (err: any) {
      alert(err.message || "Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  // زیادکردنی بەشی نوێ
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName || !newCatNameCkb) return;
    setSavingCategory(true);
    try {
      await apiFetch("/categories", {
        method: "POST",
        body: JSON.stringify({
          name: newCatName,
          nameCkb: newCatNameCkb,
          isActive: true,
        }),
      });
      setShowCategoryModal(false);
      setNewCatName("");
      setNewCatNameCkb("");
      showToast(t.successAdded || "Added successfully!");
      await loadData();
    } catch (err: any) {
      alert(err.message || "Failed to add category");
    } finally {
      setSavingCategory(false);
    }
  };

  // زیادکردنی وەستای نوێ
  const handleCreateProvider = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProvName || !newProvPhone) return;

    // دیاریکردنی دڵنیایی کاتی بۆ بەشەکە ئەگەر یەکەم دانە هەڵنەبژێردرابێت
    const selectedCatId = newProvCatId || (categories.length > 0 ? categories[0].id : "");

    if (!selectedCatId) {
      alert(lang === "ckb" ? "تکایە سەرەتا بەشێک دروست بکە یان هەڵبژێرە" : "Please select or create a category first");
      return;
    }

    setSavingProvider(true);
    try {
      await apiFetch("/providers", {
        method: "POST",
        body: JSON.stringify({
          name: newProvName,
          categoryId: selectedCatId,
          city: newProvCity,
          phone: newProvPhone,
          hourlyRate: Number(newProvRate),
          isActive: true,
        }),
      });
      setShowProviderModal(false);
      setNewProvName("");
      setNewProvPhone("");
      showToast(t.successAdded || "Added successfully!");
      await loadData();
    } catch (err: any) {
      alert(err.message || "Failed to add provider");
    } finally {
      setSavingProvider(false);
    }
  };

  // گۆڕینی دۆخی وەستا لە چالاک بۆ ناچالاک و بەپێچەوانەوە
  const toggleProviderStatus = async (id: string, currentStatus: boolean) => {
    try {
      await apiFetch(`/providers/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      showToast(t.successUpdated || "Updated successfully!");
      await loadData();
    } catch (err: any) {
      alert(err.message || "Failed to update provider");
    }
  };

  // دەستکاریکردنی کەتەگۆری
  const openEditCategory = (c: Category) => {
    setEditingCategory(c);
    setEditCatName(c.name);
    setEditCatNameCkb(c.nameCkb);
    setEditCatActive(c.isActive);
  };

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    setSavingEditCategory(true);
    try {
      await apiFetch(`/categories/${editingCategory.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          name: editCatName,
          nameCkb: editCatNameCkb,
          isActive: editCatActive,
        }),
      });
      setEditingCategory(null);
      showToast(t.successUpdated || "Updated successfully!");
      await loadData();
    } catch (err: any) {
      alert(err.message || "Failed to update category");
    } finally {
      setSavingEditCategory(false);
    }
  };

  // گۆڕینی دۆخی کەتەگۆری لە چالاک بۆ ناچالاک و بەپێچەوانەوە
  const toggleCategoryStatus = async (id: string, currentStatus: boolean) => {
    try {
      await apiFetch(`/categories/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      showToast(t.successUpdated || "Updated successfully!");
      await loadData();
    } catch (err: any) {
      alert(err.message || "Failed to update category");
    }
  };

  // دەستکاریکردنی وەستا
  const openEditProvider = (p: Provider) => {
    setEditingProvider(p);
    setEditProvName(p.name);
    setEditProvCatId(p.categoryId || (categories.length > 0 ? categories[0].id : ""));
    setEditProvCity(p.city);
    setEditProvPhone(p.phone);
    setEditProvRate(p.hourlyRate);
    setEditProvActive(p.isActive);
  };

  const handleUpdateProvider = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProvider) return;
    setSavingEditProvider(true);
    try {
      await apiFetch(`/providers/${editingProvider.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          name: editProvName,
          categoryId: editProvCatId,
          city: editProvCity,
          phone: editProvPhone,
          hourlyRate: Number(editProvRate),
          isActive: editProvActive,
        }),
      });
      setEditingProvider(null);
      showToast(t.successUpdated || "Updated successfully!");
      await loadData();
    } catch (err: any) {
      alert(err.message || "Failed to update provider");
    } finally {
      setSavingEditProvider(false);
    }
  };
  // فلتەری حجزەکان
  const filteredBookings = bookings.filter((b) => {
    if (statusFilter === "all") return true;
    return b.status === statusFilter;
  });

  // فلتەری وەستاکان بەپێی بەشەکان
  const filteredProviders = providers.filter((p) => {
    if (providerCategoryFilter === "all") return true;
    return p.categoryId === providerCategoryFilter;
  });

  // ژماردنی ئامارەکان
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
      {/* پەیامی سەرکەوتن (Toast) */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg border border-emerald-500 font-medium text-sm animate-bounce">
          <Check className="w-5 h-5" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* هێڵی سەرەوە (Header) */}
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
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold shadow-2xs transition"
            >
              <Globe className="w-4 h-4 text-slate-500" />
              <span>{lang === "en" ? "کوردی" : "English"}</span>
            </button>

            <button
              onClick={loadData}
              disabled={loading}
              title="Refresh"
              className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-100/60 text-rose-600 text-sm font-semibold transition"
            >
              <LogOut className="w-4 h-4" />
              <span>{t.logout}</span>
            </button>
          </div>
        </div>
      </header>

      {/* ناوەڕۆک */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* کارتەکانی ئامار */}
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

        {/* دوگمەکانی هەڵبژاردنی تاب */}
        <div className="flex items-center justify-between mb-6 border-b border-slate-200 pb-3.5">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setActiveTab("bookings")}
              className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === "bookings"
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-100/80 border border-slate-200/90"
                }`}
            >
              <CalendarCheck2 className="w-4 h-4" />
              <span>{t.bookings}</span>
            </button>

            <button
              onClick={() => setActiveTab("categories")}
              className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === "categories"
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-100/80 border border-slate-200/90"
                }`}
            >
              <Layers className="w-4 h-4" />
              <span>{t.categories}</span>
            </button>

            <button
              onClick={() => setActiveTab("providers")}
              className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === "providers"
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-100/80 border border-slate-200/90"
                }`}
            >
              <Users className="w-4 h-4" />
              <span>{t.providers}</span>
            </button>
          </div>

          {/* دوگمەی زیادکردن بەپێی تابی کراوە */}
          {activeTab === "categories" && (
            <button
              onClick={() => setShowCategoryModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>{t.addNewCategory}</span>
            </button>
          )}

          {activeTab === "providers" && (
            <button
              onClick={() => setShowProviderModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>{t.addNewProvider}</span>
            </button>
          )}
        </div>

        {/* تاب ١: خشتەی حجزەکان (Bookings) */}
        {activeTab === "bookings" && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <div className="flex items-center gap-2.5">
                <Filter className="w-4 h-4 text-slate-500" />
                <span className="text-sm font-semibold text-slate-700">{t.status}:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="text-sm bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-slate-700 font-medium focus:outline-none focus:border-emerald-500 shadow-xs"
                >
                  <option value="all">{t.allStatuses}</option>
                  <option value="pending">{t.pending}</option>
                  <option value="confirmed">{t.confirmed}</option>
                  <option value="in_progress">{t.in_progress}</option>
                  <option value="completed">{t.completed}</option>
                  <option value="cancelled">{t.cancelled}</option>
                </select>
              </div>

              <div className="text-sm text-slate-500 font-medium">
                {filteredBookings.length} {t.bookings}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-start">
                <thead className="bg-slate-50/90 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-5 text-start">{t.customer}</th>
                    <th className="py-3.5 px-5 text-start">{t.provider}</th>
                    <th className="py-3.5 px-5 text-start">{t.date}</th>
                    <th className="py-3.5 px-5 text-start">{t.status}</th>
                    <th className="py-3.5 px-5 text-end">{t.actions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  {filteredBookings.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400 text-sm">
                        {t.noBookings}
                      </td>
                    </tr>
                  ) : (
                    filteredBookings.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-4 px-5">
                          <div className="font-bold text-slate-900 text-base">{b.customerName}</div>
                          <div className="text-xs text-slate-500 font-mono mt-0.5">{b.phone}</div>
                          <div className="text-xs text-slate-400 truncate max-w-xs mt-0.5">{b.address}</div>
                        </td>
                        <td className="py-4 px-5">
                          <div className="font-semibold text-slate-800 text-sm">{b.provider?.name || "-"}</div>
                          <div className="text-xs text-slate-500 mt-0.5">{b.provider?.city || "-"}</div>
                        </td>
                        <td className="py-4 px-5 font-mono text-slate-600 text-xs">
                          {new Date(b.scheduledAt).toLocaleString(lang === "ckb" ? "ar-IQ" : "en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="py-4 px-5">{getStatusBadge(b.status)}</td>
                        <td className="py-4 px-5 text-end">
                          <div className="inline-flex items-center gap-2">
                            {b.status === "pending" && (
                              <button
                                onClick={() => handleUpdateStatus(b.id, "confirmed")}
                                disabled={updatingId === b.id}
                                className="px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 rounded-xl text-xs font-semibold transition"
                              >
                                {t.confirmed}
                              </button>
                            )}

                            {b.status === "confirmed" && (
                              <button
                                onClick={() => handleUpdateStatus(b.id, "in_progress")}
                                disabled={updatingId === b.id}
                                className="px-3 py-1.5 bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 rounded-xl text-xs font-semibold transition"
                              >
                                {t.in_progress}
                              </button>
                            )}

                            {b.status === "in_progress" && (
                              <button
                                onClick={() => handleUpdateStatus(b.id, "completed")}
                                disabled={updatingId === b.id}
                                className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 rounded-xl text-xs font-semibold transition"
                              >
                                {t.completed}
                              </button>
                            )}

                            {(b.status === "pending" || b.status === "confirmed") && (
                              <button
                                onClick={() => handleUpdateStatus(b.id, "cancelled")}
                                disabled={updatingId === b.id}
                                className="px-2.5 py-1.5 bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 rounded-xl text-xs font-semibold transition"
                              >
                                {t.cancelled}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* تاب ٢: بەشەکان (Categories) */}
        {activeTab === "categories" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {categories.map((c) => (
              <div
                key={c.id}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-lg mb-4 border border-emerald-100">
                  {c.name.charAt(0)}
                </div>
                <h3 className="font-bold text-slate-900 text-base">{c.name}</h3>
                <p className="text-sm text-emerald-600 font-medium mt-1">{c.nameCkb}</p>
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500">
                  <span>{t.status}:</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => openEditCategory(c)}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-emerald-600 transition"
                      title={t.edit}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleCategoryStatus(c.id, c.isActive)}
                      title={lang === "ckb" ? "کلیک بکە بۆ گۆڕینی دۆخ" : "Click to toggle status"}
                      className={`text-xs px-2.5 py-1 rounded-full font-semibold border transition-all cursor-pointer hover:opacity-80 active:scale-95 ${c.isActive
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-slate-100 text-slate-600 border-slate-200"
                        }`}
                    >
                      {c.isActive ? (t.active || "Active") : (t.inactive || "Inactive")}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* تاب ٣: وەستاکان (Providers) */}
        {activeTab === "providers" && (
          <div>
            {/* فلتەری وەستاکان بەپێی بەش (Category Filter) */}
            <div className="mb-6 flex items-center gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs max-w-md">
              <Filter className="w-4 h-4 text-slate-500" />
              <span className="text-sm font-semibold text-slate-700">{t.categories}:</span>
              <select
                value={providerCategoryFilter}
                onChange={(e) => setProviderCategoryFilter(e.target.value)}
                className="text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-700 font-medium focus:outline-none focus:border-emerald-500 w-full"
              >
                <option value="all">{t.allCategories || "All Categories"}</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {lang === "ckb" ? c.nameCkb : c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredProviders.length === 0 ? (
                <div className="col-span-full py-12 text-center text-slate-400 text-sm bg-white rounded-2xl border border-slate-200">
                  {lang === "ckb" ? "هیچ وەستایەک نەدۆزرایەوە." : "No providers found in this category."}
                </div>
              ) : (
                filteredProviders.map((p) => (
                  <div
                    key={p.id}
                    className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-slate-900 text-base">{p.name}</h3>
                        <span className="text-sm text-slate-500 font-medium">{p.city}</span>
                      </div>

                      {/* دوگمەکانی دەستکاریکردن و گۆڕینی دۆخی وەستا */}
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditProvider(p)}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-emerald-600 transition"
                          title={t.edit}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleProviderStatus(p.id, p.isActive)}
                          title={lang === "ckb" ? "کلیک بکە بۆ گۆڕینی دۆخ" : "Click to toggle status"}
                          className={`text-xs px-3 py-1 rounded-full font-semibold border transition-all cursor-pointer hover:opacity-80 active:scale-95 ${p.isActive
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-slate-100 text-slate-600 border-slate-200"
                            }`}
                        >
                          {p.isActive ? (t.active || "چالاک") : (t.inactive || "ناچالاک")}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2.5 text-sm text-slate-600 mt-3 pt-3 border-t border-slate-100">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">{t.phone}:</span>
                        <span className="font-mono text-slate-800 font-medium">{p.phone}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">{t.hourlyRate}:</span>
                        <span className="font-semibold text-emerald-600 text-base">
                          {p.hourlyRate.toLocaleString()} {t.iqd}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>

      {/* مۆداڵی زیادکردنی بەشی نوێ */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <h2 className="text-base font-bold text-slate-900">{t.addNewCategory}</h2>
              <button
                onClick={() => setShowCategoryModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">{t.name} (EN)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Painting"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">{t.nameKurdish} (CKB)</label>
                <input
                  type="text"
                  required
                  placeholder="بۆ نموونە: بۆیاخکاری"
                  value={newCatNameCkb}
                  onChange={(e) => setNewCatNameCkb(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 text-xs font-semibold rounded-xl hover:bg-slate-50"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={savingCategory}
                  className="px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-xl hover:bg-emerald-700 disabled:opacity-50"
                >
                  {savingCategory ? "..." : t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* مۆداڵی زیادکردنی وەستای نوێ */}
      {showProviderModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <h2 className="text-base font-bold text-slate-900">{t.addNewProvider}</h2>
              <button
                onClick={() => setShowProviderModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProvider} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">{t.name}</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ئاری ڕەحمان"
                  value={newProvName}
                  onChange={(e) => setNewProvName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">{t.categories}</label>
                <select
                  value={newProvCatId}
                  onChange={(e) => setNewProvCatId(e.target.value)}
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
                    value={newProvCity}
                    onChange={(e) => setNewProvCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Erbil">Erbil</option>
                    <option value="Sulaymaniyah">Sulaymaniyah</option>
                    <option value="Duhok">Duhok</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">{t.hourlyRate}</label>
                  <input
                    type="number"
                    required
                    step="1000"
                    value={newProvRate}
                    onChange={(e) => setNewProvRate(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">{t.phone}</label>
                <input
                  type="text"
                  required
                  placeholder="0750xxxxxxx"
                  value={newProvPhone}
                  onChange={(e) => setNewProvPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-mono font-medium text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowProviderModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 text-xs font-semibold rounded-xl hover:bg-slate-50"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={savingProvider}
                  className="px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-xl hover:bg-emerald-700 disabled:opacity-50"
                >
                  {savingProvider ? "..." : t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* مۆداڵی دەستکاریکردنی بەش (Edit Category Modal) */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <h2 className="text-base font-bold text-slate-900">{t.editCategory}</h2>
              <button
                onClick={() => setEditingCategory(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">{t.name} (EN)</label>
                <input
                  type="text"
                  required
                  value={editCatName}
                  onChange={(e) => setEditCatName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">{t.nameKurdish} (CKB)</label>
                <input
                  type="text"
                  required
                  value={editCatNameCkb}
                  onChange={(e) => setEditCatNameCkb(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="editCatActive"
                  checked={editCatActive}
                  onChange={(e) => setEditCatActive(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded-sm border-slate-300 focus:ring-emerald-500"
                />
                <label htmlFor="editCatActive" className="text-sm font-semibold text-slate-700 cursor-pointer">
                  {t.active || "Active"}
                </label>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 text-xs font-semibold rounded-xl hover:bg-slate-50"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={savingEditCategory}
                  className="px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-xl hover:bg-emerald-700 disabled:opacity-50"
                >
                  {savingEditCategory ? "..." : (t.saveChanges || t.save)}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* مۆداڵی دەستکاریکردنی وەستا (Edit Provider Modal) */}
      {editingProvider && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <h2 className="text-base font-bold text-slate-900">{t.editProvider}</h2>
              <button
                onClick={() => setEditingProvider(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateProvider} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">{t.name}</label>
                <input
                  type="text"
                  required
                  value={editProvName}
                  onChange={(e) => setEditProvName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">{t.categories}</label>
                <select
                  value={editProvCatId}
                  onChange={(e) => setEditProvCatId(e.target.value)}
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
                    value={editProvCity}
                    onChange={(e) => setEditProvCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Erbil">Erbil</option>
                    <option value="Sulaymaniyah">Sulaymaniyah</option>
                    <option value="Duhok">Duhok</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">{t.hourlyRate}</label>
                  <input
                    type="number"
                    required
                    step="1000"
                    value={editProvRate}
                    onChange={(e) => setEditProvRate(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">{t.phone}</label>
                <input
                  type="text"
                  required
                  value={editProvPhone}
                  onChange={(e) => setEditProvPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-mono font-medium text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="editProvActive"
                  checked={editProvActive}
                  onChange={(e) => setEditProvActive(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded-sm border-slate-300 focus:ring-emerald-500"
                />
                <label htmlFor="editProvActive" className="text-sm font-semibold text-slate-700 cursor-pointer">
                  {t.active || "Active"}
                </label>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingProvider(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 text-xs font-semibold rounded-xl hover:bg-slate-50"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={savingEditProvider}
                  className="px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-xl hover:bg-emerald-700 disabled:opacity-50"
                >
                  {savingEditProvider ? "..." : (t.saveChanges || t.save)}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}