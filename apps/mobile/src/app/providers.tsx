import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Modal,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useLanguage } from "@/lib/LanguageContext";
import { apiFetch } from "@/lib/api";
import BottomNav from "@/components/BottomNav";

interface Provider {
  id: string;
  name: string;
  categoryId: string;
  city: string;
  phone: string;
  hourlyRate: number;
  isActive: boolean;
}

interface Category {
  id: string;
  name: string;
  nameCkb: string;
  isActive: boolean;
}

export default function ProvidersScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ categoryId?: string; title?: string }>();
  const { t, lang, isRTL, alignText, flexRowStyle } = useLanguage();

  const [categories, setCategories] = useState<Category[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    params.categoryId || "all"
  );
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProviderForDetail, setSelectedProviderForDetail] = useState<Provider | null>(null);

  useEffect(() => {
    loadData();
  }, [selectedCategoryId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const catRes = await apiFetch<Category[]>("/categories");
      if (catRes.success && catRes.data) {
        setCategories(catRes.data);
      }

      const endpoint =
        selectedCategoryId && selectedCategoryId !== "all"
          ? `/providers?categoryId=${selectedCategoryId}`
          : "/providers";

      const provRes = await apiFetch<Provider[]>(endpoint);
      if (provRes.success && provRes.data) {
        setProviders(provRes.data);
      }
    } catch (err: any) {
      console.warn("Error fetching providers:", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryName = (catId: string) => {
    const c = categories.find((cat) => cat.id === catId);
    if (!c) return lang === "ckb" ? "خزمەتگوزاری" : "Service";
    return isRTL ? c.nameCkb : c.name;
  };

  const filteredProviders = providers.filter((p) => {
    const matchesCity = selectedCity === "all" || p.city.toLowerCase() === selectedCity.toLowerCase();
    const matchesSearch =
      !searchQuery.trim() ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.city.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCity && matchesSearch;
  });

  const handleBookProvider = (providerId: string) => {
    setSelectedProviderForDetail(null);
    router.push({
      pathname: "/book",
      params: { providerId },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.header, flexRowStyle]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Ionicons
              name={isRTL ? "chevron-forward" : "chevron-back"}
              size={22}
              color="#0F172A"
            />
          </TouchableOpacity>

          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>
              {params.title || (lang === "ckb" ? "وەستا بەردەستەکان" : "Available Providers")}
            </Text>
            <Text style={styles.headerSubtitle}>
              {filteredProviders.length}{" "}
              {lang === "ckb" ? "وەستای شارەزا" : "verified technicians"}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.cityFilterChip, flexRowStyle]}
            onPress={() => {
              const cities = ["all", "Erbil", "Sulaymaniyah", "Ranya", "Duhok"];
              const currentIndex = cities.indexOf(selectedCity);
              const nextIndex = (currentIndex + 1) % cities.length;
              setSelectedCity(cities[nextIndex]);
            }}
          >
            <Ionicons name="filter" size={13} color="#059669" />
            <Text style={styles.cityFilterText}>
              {selectedCity === "all"
                ? lang === "ckb" ? "هەموو شارەکان" : "All Cities"
                : selectedCity === "Erbil"
                ? lang === "ckb" ? "هەولێر" : "Erbil"
                : selectedCity === "Sulaymaniyah"
                ? lang === "ckb" ? "سلێمانی" : "Sulaymaniyah"
                : selectedCity === "Ranya"
                ? lang === "ckb" ? "ڕانیە" : "Ranya"
                : lang === "ckb" ? "دهۆک" : "Duhok"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.searchContainer, flexRowStyle]}>
          <Ionicons name="search-outline" size={18} color="#94A3B8" />
          <TextInput
            style={[styles.searchInput, { textAlign: alignText }]}
            placeholder={
              lang === "ckb"
                ? "گەڕان بەپێی ناوی وەستا یان شار..."
                : "Search by technician name or city..."
            }
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={18} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[
            styles.categoryTabsList,
            isRTL && { flexDirection: "row-reverse" },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.tabPill,
              selectedCategoryId === "all" && styles.activeTabPill,
            ]}
            onPress={() => setSelectedCategoryId("all")}
          >
            <Text
              style={[
                styles.tabPillText,
                selectedCategoryId === "all" && styles.activeTabPillText,
              ]}
            >
              {lang === "ckb" ? "هەموو بەشەکان" : "All Services"}
            </Text>
          </TouchableOpacity>

          {categories.map((c) => {
            const isSelected = selectedCategoryId === c.id;
            const title = isRTL ? c.nameCkb : c.name;
            return (
              <TouchableOpacity
                key={c.id}
                style={[styles.tabPill, isSelected && styles.activeTabPill]}
                onPress={() => setSelectedCategoryId(c.id)}
              >
                <Text
                  style={[styles.tabPillText, isSelected && styles.activeTabPillText]}
                >
                  {title}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#059669" />
            <Text style={styles.loadingText}>{t.loading}</Text>
          </View>
        ) : filteredProviders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="people-outline" size={38} color="#94A3B8" />
            </View>
            <Text style={styles.emptyTitle}>
              {lang === "ckb"
                ? "هیچ وەستایەک بۆ ئەم بەشە بەردەست نییە"
                : "No providers found for this category"}
            </Text>
            <Text style={styles.emptySubtitle}>
              {lang === "ckb"
                ? "تکایە بەشێکی تر یان شارێکی تر تاقی بکەرەوە."
                : "Please try selecting a different category or city filter."}
            </Text>
            <TouchableOpacity
              style={styles.resetFiltersBtn}
              onPress={() => {
                setSelectedCategoryId("all");
                setSelectedCity("all");
                setSearchQuery("");
              }}
            >
              <Text style={styles.resetFiltersBtnText}>
                {lang === "ckb" ? "بینینی هەموو وەستاکان" : "Show All Providers"}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.providersList}>
            {filteredProviders.map((provider) => {
              const catName = getCategoryName(provider.categoryId);

              return (
                <TouchableOpacity
                  key={provider.id}
                  style={styles.providerCard}
                  activeOpacity={0.9}
                  onPress={() => setSelectedProviderForDetail(provider)}
                >
                  <View style={[styles.cardTopRow, flexRowStyle]}>
                    <View style={styles.avatarWrapper}>
                      <View style={styles.avatarCircle}>
                        <Text style={styles.avatarText}>
                          {provider.name[0]?.toUpperCase() || "W"}
                        </Text>
                      </View>
                      <View style={styles.onlineBadge} />
                    </View>

                    <View style={{ flex: 1, marginHorizontal: 12 }}>
                      <View style={[styles.nameRow, flexRowStyle]}>
                        <Text style={[styles.providerName, { textAlign: alignText }]}>
                          {provider.name}
                        </Text>
                        <Ionicons name="checkmark-circle" size={16} color="#059669" />
                      </View>

                      <View style={[styles.badgesRow, flexRowStyle]}>
                        <View style={styles.categoryBadge}>
                          <Text style={styles.categoryBadgeText}>{catName}</Text>
                        </View>
                        <View style={styles.cityBadge}>
                          <Ionicons name="location" size={11} color="#64748B" />
                          <Text style={styles.cityBadgeText}>
                            {provider.city === "Erbil"
                              ? lang === "ckb" ? "هەولێر" : "Erbil"
                              : provider.city === "Sulaymaniyah"
                              ? lang === "ckb" ? "سلێمانی" : "Sulaymaniyah"
                              : provider.city === "Ranya"
                              ? lang === "ckb" ? "ڕانیە" : "Ranya"
                              : provider.city === "Duhok"
                              ? lang === "ckb" ? "دهۆک" : "Duhok"
                              : provider.city}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  <View style={[styles.cardMetricsRow, flexRowStyle]}>
                    <View style={[styles.metricItem, flexRowStyle]}>
                      <Ionicons name="star" size={14} color="#EAB308" />
                      <Text style={styles.ratingNumber}>4.9</Text>
                      <Text style={styles.reviewsNumber}>(94 reviews)</Text>
                    </View>

                    <View style={[styles.priceTagBox, flexRowStyle]}>
                      <Text style={styles.rateAmount}>
                        {provider.hourlyRate.toLocaleString()} {t.iqd}
                      </Text>
                      <Text style={styles.rateUnit}>{t.perHour}</Text>
                    </View>
                  </View>

                  <View style={[styles.cardActionRow, flexRowStyle]}>
                    <TouchableOpacity
                      style={[styles.callBtn, flexRowStyle]}
                      onPress={() => {
                        Alert.alert(
                          provider.name,
                          `${lang === "ckb" ? "ژمارەی پەیوەندی:" : "Phone:"} ${provider.phone}`
                        );
                      }}
                    >
                      <Ionicons name="call-outline" size={15} color="#059669" />
                      <Text style={styles.callBtnText}>
                        {lang === "ckb" ? "پەیوەندی" : "Call"}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.bookBtn, flexRowStyle]}
                      onPress={() => handleBookProvider(provider.id)}
                      activeOpacity={0.85}
                    >
                      <Ionicons name="calendar" size={15} color="#FFFFFF" />
                      <Text style={styles.bookBtnText}>
                        {lang === "ckb" ? "حجزکردنی وەستا" : "Book Service"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        <View style={{ height: 95 }} />
      </ScrollView>

      <Modal
        visible={!!selectedProviderForDetail}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedProviderForDetail(null)}
      >
        <View style={styles.modalOverlay}>
          {selectedProviderForDetail && (
            <View style={styles.detailCard}>
              <View style={styles.modalHandle} />

              <View style={styles.detailHeader}>
                <View style={styles.detailAvatar}>
                  <Text style={styles.detailAvatarText}>
                    {selectedProviderForDetail.name[0]?.toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.detailName}>
                  {selectedProviderForDetail.name}
                </Text>
                <Text style={styles.detailCategory}>
                  {getCategoryName(selectedProviderForDetail.categoryId)} •{" "}
                  {selectedProviderForDetail.city === "Erbil"
                    ? lang === "ckb" ? "هەولێر" : "Erbil"
                    : selectedProviderForDetail.city === "Sulaymaniyah"
                    ? lang === "ckb" ? "سلێمانی" : "Sulaymaniyah"
                    : selectedProviderForDetail.city === "Ranya"
                    ? lang === "ckb" ? "ڕانیە" : "Ranya"
                    : selectedProviderForDetail.city === "Duhok"
                    ? lang === "ckb" ? "دهۆک" : "Duhok"
                    : selectedProviderForDetail.city}
                </Text>

                <View style={styles.ratingBadgeLarge}>
                  <Ionicons name="star" size={16} color="#EAB308" />
                  <Text style={styles.ratingBadgeLargeText}>4.9 (120+ Verified Bookings)</Text>
                </View>
              </View>

              <View style={styles.detailBody}>
                <View style={styles.detailFeatureRow}>
                  <Ionicons name="shield-checkmark" size={18} color="#059669" />
                  <Text style={styles.detailFeatureText}>
                    {lang === "ckb" ? "وەستای پشتڕاستکراو لەلایەن هۆمفیکس" : "Background Checked & Verified by HomeFix"}
                  </Text>
                </View>

                <View style={styles.detailFeatureRow}>
                  <Ionicons name="time" size={18} color="#059669" />
                  <Text style={styles.detailFeatureText}>
                    {lang === "ckb" ? "ئامادەیی بۆ کاری خێرا لە هەموو کاتێکدا" : "Available for emergency and scheduled jobs"}
                  </Text>
                </View>

                <View style={styles.detailFeatureRow}>
                  <Ionicons name="cash" size={18} color="#059669" />
                  <Text style={styles.detailFeatureText}>
                    {selectedProviderForDetail.hourlyRate.toLocaleString()} {t.iqd} {t.perHour} ({lang === "ckb" ? "بەبێ تێچووی شاراوە" : "No hidden charges"})
                  </Text>
                </View>
              </View>

              <View style={styles.detailModalFooter}>
                <TouchableOpacity
                  style={styles.detailBookBtn}
                  onPress={() => handleBookProvider(selectedProviderForDetail.id)}
                >
                  <Text style={styles.detailBookBtnText}>
                    {lang === "ckb" ? "داواکردنی ڕاستەوخۆ" : "Proceed to Booking"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.detailCloseBtn}
                  onPress={() => setSelectedProviderForDetail(null)}
                >
                  <Text style={styles.detailCloseBtnText}>
                    {lang === "ckb" ? "داخستن" : "Close"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </Modal>

      <BottomNav activeTab="home" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },

  header: {
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitleContainer: {
    flex: 1,
    marginHorizontal: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },
  headerSubtitle: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 2,
  },
  cityFilterChip: {
    alignItems: "center",
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    gap: 4,
  },
  cityFilterText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#059669",
  },

  searchContainer: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 14,
    height: 48,
    marginBottom: 14,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#0F172A",
    height: "100%",
    padding: 0,
    outlineStyle: "none" as any,
  },

  categoryTabsList: {
    paddingBottom: 14,
    gap: 8,
  },
  tabPill: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  activeTabPill: {
    backgroundColor: "#059669",
    borderColor: "#059669",
  },
  tabPillText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#475569",
  },
  activeTabPillText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },

  loadingContainer: {
    paddingVertical: 40,
    alignItems: "center",
    gap: 8,
  },
  loadingText: {
    fontSize: 13,
    color: "#64748B",
  },
  emptyContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 30,
    alignItems: "center",
    marginTop: 10,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 6,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 12,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 16,
  },
  resetFiltersBtn: {
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
  },
  resetFiltersBtnText: {
    color: "#059669",
    fontWeight: "700",
    fontSize: 13,
  },

  providersList: {
    gap: 14,
  },
  providerCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 16,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTopRow: {
    alignItems: "center",
    marginBottom: 12,
  },
  avatarWrapper: {
    position: "relative",
  },
  avatarCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#059669",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },
  onlineBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#10B981",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  nameRow: {
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  providerName: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
  },
  badgesRow: {
    alignItems: "center",
    gap: 6,
  },
  categoryBadge: {
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  categoryBadgeText: {
    fontSize: 10.5,
    fontWeight: "700",
    color: "#059669",
  },
  cityBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 3,
  },
  cityBadgeText: {
    fontSize: 10.5,
    fontWeight: "600",
    color: "#64748B",
  },

  cardMetricsRow: {
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 14,
  },
  metricItem: {
    alignItems: "center",
    gap: 4,
  },
  ratingNumber: {
    fontSize: 12,
    fontWeight: "800",
    color: "#0F172A",
  },
  reviewsNumber: {
    fontSize: 11,
    color: "#64748B",
  },
  priceTagBox: {
    alignItems: "baseline",
    gap: 3,
  },
  rateAmount: {
    fontSize: 14,
    fontWeight: "800",
    color: "#059669",
  },
  rateUnit: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "600",
  },

  cardActionRow: {
    alignItems: "center",
    gap: 10,
  },
  callBtn: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#BBF7D0",
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  callBtnText: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#059669",
  },
  bookBtn: {
    flex: 2,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#059669",
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  bookBtnText: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.5)",
    justifyContent: "flex-end",
  },
  detailCard: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 36,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#CBD5E1",
    alignSelf: "center",
    marginBottom: 16,
  },
  detailHeader: {
    alignItems: "center",
    marginBottom: 20,
  },
  detailAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#059669",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  detailAvatarText: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "800",
  },
  detailName: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 2,
  },
  detailCategory: {
    fontSize: 13,
    color: "#64748B",
    marginBottom: 8,
  },
  ratingBadgeLarge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF9C3",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 5,
  },
  ratingBadgeLargeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#854D0E",
  },
  detailBody: {
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: 16,
    gap: 12,
    marginBottom: 20,
  },
  detailFeatureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  detailFeatureText: {
    fontSize: 13,
    color: "#334155",
    fontWeight: "600",
    flex: 1,
  },
  detailModalFooter: {
    gap: 10,
  },
  detailBookBtn: {
    backgroundColor: "#059669",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  detailBookBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  detailCloseBtn: {
    backgroundColor: "#F1F5F9",
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
  },
  detailCloseBtnText: {
    color: "#475569",
    fontSize: 13,
    fontWeight: "700",
  },
});
