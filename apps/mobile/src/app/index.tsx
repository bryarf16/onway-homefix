import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  Image,
  ActivityIndicator,
  Modal,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useLanguage } from "@/lib/LanguageContext";
import { useAuth } from "@/lib/AuthContext";
import { apiFetch } from "@/lib/api";
import BottomNav from "@/components/BottomNav";

interface Category {
  id: string;
  name: string;
  nameCkb: string;
  icon?: string | null;
  isActive: boolean;
}

interface Provider {
  id: string;
  name: string;
  categoryId: string;
  city: string;
  phone: string;
  hourlyRate: number;
  isActive: boolean;
}

export default function HomeScreen() {
  const router = useRouter();
  const { t, lang, toggleLanguage, isRTL, alignText, flexRowStyle } = useLanguage();
  const { user } = useAuth();

  const [categories, setCategories] = useState<Category[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [selectedCity, setSelectedCity] = useState("Erbil");
  const [notificationModalVisible, setNotificationModalVisible] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [catRes, provRes] = await Promise.all([
        apiFetch<Category[]>("/categories"),
        apiFetch<Provider[]>("/providers"),
      ]);

      if (catRes.success && catRes.data) {
        setCategories(catRes.data);
      }
      if (provRes.success && provRes.data) {
        setProviders(provRes.data);
      }
    } catch (err: any) {
      console.warn("Failed to load home data:", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // دیاریکردنی ئایکۆنی شیاو بۆ هەر بەشێک
  const getCategoryIcon = (name: string, fallbackIcon?: string | null): any => {
    const n = name.toLowerCase();
    if (n.includes("clean")) return "home";
    if (n.includes("ac") || n.includes("hvac") || n.includes("تەبرید")) return "snow";
    if (n.includes("plumb") || n.includes("بۆڕی")) return "water";
    if (n.includes("electr") || n.includes("کارەبا")) return "flash";
    if (n.includes("wash") || n.includes("جلشۆر")) return "refresh";
    if (n.includes("refrig") || n.includes("سەلاجە")) return "cube";
    if (n.includes("micro") || n.includes("oven") || n.includes("فڕن")) return "flame";
    if (n.includes("paint") || n.includes("decor") || n.includes("بۆیاخ")) return "color-palette";
    return fallbackIcon || "construct";
  };

  // بەشە فلتەرکراوەکان بەپێی گەڕان
  const filteredCategories = categories.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      (c.nameCkb && c.nameCkb.toLowerCase().includes(q))
    );
  });

  // وەستا پێشنیازکراوەکان بۆ کاروسێل
  const featuredCards = [
    {
      id: "feat-ac",
      titleEn: "AC Repair & Gas Refill",
      titleCkb: "چاککردنەوە و گازی سپلیت",
      rating: "4.8",
      reviews: "1.8K",
      durationEn: "45 mins",
      durationCkb: "٤٥ خولەک",
      price: "25,000",
      originalPrice: "35,000",
      image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80",
      categoryNameEn: "AC Repair",
      targetProvider: providers.find((p) => p.name.includes("کاروان") || p.hourlyRate === 30000) || providers[0],
    },
    {
      id: "feat-clean",
      titleEn: "Deep Home Cleaning",
      titleCkb: "پاککردنەوەی گشتی ماڵ",
      rating: "4.9",
      reviews: "2.3K",
      durationEn: "2.5 hrs",
      durationCkb: "٢.٥ کاتژمێر",
      price: "15,000",
      originalPrice: "20,000",
      image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80",
      categoryNameEn: "House Cleaning",
      targetProvider: providers.find((p) => p.name.includes("پاکوخاوێنی")) || providers[1] || providers[0],
    },
    {
      id: "feat-plumb",
      titleEn: "Leakage & Pipe Repair",
      titleCkb: "چاککردنی دزەکردن و بۆڕی",
      rating: "4.7",
      reviews: "950",
      durationEn: "60 mins",
      durationCkb: "٦٠ خولەک",
      price: "20,000",
      originalPrice: "30,000",
      image: "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&fit=crop&w=600&q=80",
      categoryNameEn: "Plumbing",
      targetProvider: providers.find((p) => p.name.includes("ئەحمەد") || p.name.includes("ڕەنجدەر")) || providers[2] || providers[0],
    },
  ];

  const handleCategoryPress = (category: Category) => {
    const title = isRTL ? category.nameCkb : category.name;
    router.push({
      pathname: "/providers",
      params: { categoryId: category.id, title },
    });
  };

  const handleBookFeatured = (targetProvider?: Provider) => {
    if (targetProvider) {
      router.push({
        pathname: "/book",
        params: { providerId: targetProvider.id },
      });
    } else {
      router.push("/providers");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ========================================================
            1. TOP BAR: شوێن، ئاگاداری، گۆڕینی زمان
            ======================================================== */}
        <View style={[styles.topBar, flexRowStyle]}>
          <TouchableOpacity
            style={[styles.locationWrapper, flexRowStyle]}
            onPress={() => setLocationModalVisible(true)}
            activeOpacity={0.8}
          >
            <View style={styles.locationPinBadge}>
              <Ionicons name="location-sharp" size={18} color="#059669" />
            </View>
            <View style={{ marginHorizontal: 8 }}>
              <View style={[styles.locationRow, flexRowStyle]}>
                <Text style={styles.locationTitle}>
                  {selectedCity === "Erbil"
                    ? lang === "ckb" ? "هەولێر، گەڕەکی بەختیاری" : "Erbil, Bakhtiyari"
                    : selectedCity === "Sulaymaniyah"
                    ? lang === "ckb" ? "سلێمانی، شەقامی تووی مەلیك" : "Sulaymaniyah, Malik St"
                    : lang === "ckb" ? "دهۆک، ناوەندی شار" : "Duhok, City Center"}
                </Text>
                <Ionicons name="chevron-down" size={14} color="#64748B" />
              </View>
              <Text style={[styles.locationSubtitle, { textAlign: alignText }]}>
                {lang === "ckb" ? "خزمەتگوزاری بۆ ناونیشانی تۆ" : "Delivering to your location"}
              </Text>
            </View>
          </TouchableOpacity>

          <View style={[styles.topActions, flexRowStyle]}>
            {/* Notification Bell */}
            <TouchableOpacity
              style={styles.iconCircleBtn}
              onPress={() => setNotificationModalVisible(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="notifications-outline" size={20} color="#0F172A" />
              <View style={styles.unreadDot} />
            </TouchableOpacity>

            {/* Language Switcher Badge */}
            <TouchableOpacity
              style={[styles.langSwitchBtn, flexRowStyle]}
              onPress={toggleLanguage}
              activeOpacity={0.8}
            >
              <Ionicons name="globe-outline" size={14} color="#059669" />
              <Text style={styles.langSwitchText}>
                {lang === "en" ? "کوردی" : "EN"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ========================================================
            2. SEARCH BAR & FILTER
            ======================================================== */}
        <View style={[styles.searchContainer, flexRowStyle]}>
          <Ionicons name="search-outline" size={20} color="#94A3B8" />
          <TextInput
            style={[styles.searchInput, { textAlign: alignText }]}
            placeholder={
              lang === "ckb"
                ? "گەڕان بۆ ئامێر یان خزمەتگوزاری..."
                : "Search for appliance or service..."
            }
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 ? (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={18} color="#94A3B8" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.filterBtn}
              onPress={() => router.push("/providers")}
            >
              <Ionicons name="options-outline" size={18} color="#059669" />
            </TouchableOpacity>
          )}
        </View>

        {/* ========================================================
            3. PROMO HERO BANNER (دیزاینی سەوز لەگەڵ وێنەی وەستا)
            ======================================================== */}
        <View style={styles.promoBanner}>
          <View style={styles.promoContent}>
            {/* Left Content */}
            <View style={styles.promoTextCol}>
              <Text style={[styles.promoTitle, { textAlign: alignText }]}>
                {lang === "ckb"
                  ? "سپلیتەکەت فێنک ناکات؟\nبە پەلە چاکی دەکەین."
                  : "AC not cooling?\nWe'll fix it fast."}
              </Text>

              <View style={styles.featurePoints}>
                <View style={[styles.featurePointRow, flexRowStyle]}>
                  <Ionicons name="flash" size={13} color="#FDE047" />
                  <Text style={styles.featurePointText}>
                    {lang === "ckb"
                      ? "خزمەتگوزاری خێرا لە ٣٠ خولەکدا"
                      : "Instant service in 30 mins"}
                  </Text>
                </View>
                <View style={[styles.featurePointRow, flexRowStyle]}>
                  <Ionicons name="shield-checkmark" size={13} color="#A7F3D0" />
                  <Text style={styles.featurePointText}>
                    {lang === "ckb"
                      ? "وەستای شارەزا • پارچەی یەدەگی ئەسڵی"
                      : "Expert technicians • Genuine parts"}
                  </Text>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={[styles.promoButtonsRow, flexRowStyle]}>
                <TouchableOpacity
                  style={[styles.instantServiceBtn, flexRowStyle]}
                  onPress={() => router.push("/providers")}
                  activeOpacity={0.85}
                >
                  <Ionicons name="flash" size={14} color="#065F46" />
                  <Text style={styles.instantServiceBtnText}>
                    {lang === "ckb" ? "داواکاری خێرا" : "Instant Service"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.scheduleServiceBtn, flexRowStyle]}
                  onPress={() => router.push("/providers")}
                  activeOpacity={0.85}
                >
                  <Ionicons name="calendar-outline" size={14} color="#FFFFFF" />
                  <Text style={styles.scheduleServiceBtnText}>
                    {lang === "ckb" ? "دیاریکردنی کات" : "Schedule Service"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Right Graphic Badge */}
            <View style={styles.promoGraphicWrapper}>
              <View style={styles.promoGraphicCircle}>
                <Ionicons name="snow" size={48} color="#FFFFFF" />
              </View>
            </View>
          </View>

          {/* Dots Indicator */}
          <View style={styles.dotsRow}>
            <View style={[styles.dot, styles.activeDot]} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
        </View>

        {/* ========================================================
            4. POPULAR SERVICES GRID (٤ ستوون لە ٢ ڕیز)
            ======================================================== */}
        <View style={styles.sectionContainer}>
          <View style={[styles.sectionHeaderRow, flexRowStyle]}>
            <Text style={styles.sectionTitle}>
              {lang === "ckb" ? "خزمەتگوزارییە باوەکان" : "Popular Services"}
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/providers")}
              style={[styles.seeAllBtn, flexRowStyle]}
            >
              <Text style={styles.seeAllText}>
                {lang === "ckb" ? "هەمووی ببینە" : "See all"}
              </Text>
              <Ionicons
                name={isRTL ? "chevron-back" : "chevron-forward"}
                size={14}
                color="#059669"
              />
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="small" color="#059669" />
              <Text style={styles.loadingText}>{t.loading}</Text>
            </View>
          ) : (
            <View style={styles.servicesGrid}>
              {filteredCategories.slice(0, 8).map((cat) => {
                const iconName = getCategoryIcon(cat.name, cat.icon);
                const title = isRTL ? cat.nameCkb : cat.name;

                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={styles.serviceItemCard}
                    onPress={() => handleCategoryPress(cat)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.serviceIconBox}>
                      <Ionicons name={iconName} size={26} color="#059669" />
                    </View>
                    <Text
                      style={styles.serviceItemTitle}
                      numberOfLines={2}
                      ellipsizeMode="tail"
                    >
                      {title}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* ========================================================
            5. RECOMMENDED FOR YOU CAROUSEL
            ======================================================== */}
        <View style={styles.sectionContainer}>
          <View style={[styles.sectionHeaderRow, flexRowStyle]}>
            <Text style={styles.sectionTitle}>
              {lang === "ckb" ? "پێشنیارکراو بۆ تۆ" : "Recommended for you"}
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/providers")}
              style={[styles.seeAllBtn, flexRowStyle]}
            >
              <Text style={styles.seeAllText}>
                {lang === "ckb" ? "هەمووی ببینە" : "View all"}
              </Text>
              <Ionicons
                name={isRTL ? "chevron-back" : "chevron-forward"}
                size={14}
                color="#059669"
              />
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[
              styles.horizontalScrollList,
              isRTL && { flexDirection: "row-reverse" },
            ]}
          >
            {featuredCards.map((card) => {
              const title = isRTL ? card.titleCkb : card.titleEn;
              const duration = isRTL ? card.durationCkb : card.durationEn;

              return (
                <View key={card.id} style={styles.recommendCard}>
                  {/* Card Cover Image */}
                  <View style={styles.cardImageContainer}>
                    <Image
                      source={{ uri: card.image }}
                      style={styles.cardImage}
                      resizeMode="cover"
                    />
                    <View style={styles.bestsellerBadge}>
                      <Text style={styles.bestsellerText}>
                        {lang === "ckb" ? "پڕداواکراو" : "Bestseller"}
                      </Text>
                    </View>
                  </View>

                  {/* Card Body */}
                  <View style={styles.cardBody}>
                    <Text style={[styles.recommendTitle, { textAlign: alignText }]}>
                      {title}
                    </Text>

                    {/* Rating & Duration */}
                    <View style={[styles.ratingDurationRow, flexRowStyle]}>
                      <View style={[styles.ratingBox, flexRowStyle]}>
                        <Ionicons name="star" size={13} color="#EAB308" />
                        <Text style={styles.ratingText}>
                          {card.rating} ({card.reviews})
                        </Text>
                      </View>
                      <Text style={styles.dotSeparator}>•</Text>
                      <View style={[styles.durationBox, flexRowStyle]}>
                        <Ionicons name="time-outline" size={13} color="#64748B" />
                        <Text style={styles.durationText}>{duration}</Text>
                      </View>
                    </View>

                    {/* Verified Badge */}
                    <View style={[styles.verifiedBadgeRow, flexRowStyle]}>
                      <Ionicons name="shield-checkmark" size={13} color="#059669" />
                      <Text style={styles.verifiedBadgeText}>
                        {lang === "ckb" ? "شارەزای باوەڕپێکراو" : "Verified Professional"}
                      </Text>
                    </View>

                    {/* Price and Book Button */}
                    <View style={[styles.cardFooter, flexRowStyle]}>
                      <View>
                        <Text style={styles.priceText}>
                          {card.price} <Text style={styles.currencyText}>{t.iqd}</Text>
                        </Text>
                        <Text style={styles.originalPriceText}>
                          {card.originalPrice} {t.iqd}
                        </Text>
                      </View>

                      <TouchableOpacity
                        style={styles.bookNowBtn}
                        onPress={() => handleBookFeatured(card.targetProvider)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.bookNowBtnText}>
                          {lang === "ckb" ? "داواکردن" : "Book Now"}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </View>

        {/* ========================================================
            6. TRUST BADGES ROW (٤ متمانەپێکراوی)
            ======================================================== */}
        <View style={styles.trustRowContainer}>
          <View style={[styles.trustGrid, flexRowStyle]}>
            <View style={styles.trustItem}>
              <View style={styles.trustIconCircle}>
                <Ionicons name="shield-checkmark-outline" size={22} color="#059669" />
              </View>
              <Text style={styles.trustTitle}>
                {lang === "ckb" ? "وەستای پەسەندکراو" : "Verified Professionals"}
              </Text>
            </View>

            <View style={styles.trustItem}>
              <View style={styles.trustIconCircle}>
                <Ionicons name="cash-outline" size={22} color="#059669" />
              </View>
              <Text style={styles.trustTitle}>
                {lang === "ckb" ? "نرخی ڕوون و ئاشکرا" : "Transparent Pricing"}
              </Text>
            </View>

            <View style={styles.trustItem}>
              <View style={styles.trustIconCircle}>
                <Ionicons name="ribbon-outline" size={22} color="#059669" />
              </View>
              <Text style={styles.trustTitle}>
                {lang === "ckb" ? "تا ٣٠ ڕۆژ گەرەنتی" : "Up to 30 Days Warranty"}
              </Text>
            </View>

            <View style={styles.trustItem}>
              <View style={styles.trustIconCircle}>
                <Ionicons name="navigate-outline" size={22} color="#059669" />
              </View>
              <Text style={styles.trustTitle}>
                {lang === "ckb" ? "چاودێری ڕاستەوخۆ" : "Live Tracking"}
              </Text>
            </View>
          </View>
        </View>

        {/* سپەیس بۆ ئەوەی ناوەڕۆک نەچێتە ژێر BottomNav */}
        <View style={{ height: 85 }} />
      </ScrollView>

      {/* ========================================================
          7. BOTTOM NAVIGATION BAR
          ======================================================== */}
      <BottomNav activeTab="home" />

      {/* ========================================================
          MODALS: هەڵبژاردنی شار و ئاگادارییەکان
          ======================================================== */}
      <Modal
        visible={locationModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLocationModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalHeaderTitle}>
              {lang === "ckb" ? "شارەکەت هەڵبژێرە" : "Select Your City"}
            </Text>
            {["Erbil", "Sulaymaniyah", "Duhok"].map((city) => (
              <TouchableOpacity
                key={city}
                style={[
                  styles.cityOptionRow,
                  selectedCity === city && styles.selectedCityOption,
                  flexRowStyle,
                ]}
                onPress={() => {
                  setSelectedCity(city);
                  setLocationModalVisible(false);
                }}
              >
                <Ionicons
                  name="location"
                  size={18}
                  color={selectedCity === city ? "#059669" : "#64748B"}
                />
                <Text
                  style={[
                    styles.cityNameText,
                    selectedCity === city && styles.selectedCityNameText,
                  ]}
                >
                  {city === "Erbil"
                    ? lang === "ckb" ? "هەولێر (Erbil)" : "Erbil (هەولێر)"
                    : city === "Sulaymaniyah"
                    ? lang === "ckb" ? "سلێمانی (Sulaymaniyah)" : "Sulaymaniyah (سلێمانی)"
                    : lang === "ckb" ? "دهۆک (Duhok)" : "Duhok (دهۆک)"}
                </Text>
                {selectedCity === city && (
                  <Ionicons name="checkmark-circle" size={18} color="#059669" />
                )}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.closeCityBtn}
              onPress={() => setLocationModalVisible(false)}
            >
              <Text style={styles.closeCityBtnText}>
                {lang === "ckb" ? "داخستن" : "Close"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Notification Modal */}
      <Modal
        visible={notificationModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setNotificationModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.notifIconCircle}>
              <Ionicons name="notifications" size={28} color="#059669" />
            </View>
            <Text style={styles.modalHeaderTitle}>
              {lang === "ckb" ? "ئاگادارییەکان" : "Notifications"}
            </Text>
            <Text style={styles.notifEmptyText}>
              {lang === "ckb"
                ? "بەخێربێیت بۆ هۆمفیکس! کاتێک داواکارییەک بنێریت، نوێکارییەکانی لێرە دەبینیت."
                : "Welcome to HomeFix! Updates on your service requests will appear here."}
            </Text>
            <TouchableOpacity
              style={styles.closeCityBtn}
              onPress={() => setNotificationModalVisible(false)}
            >
              <Text style={styles.closeCityBtnText}>
                {lang === "ckb" ? "باشە" : "Got it"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },

  // 1. Top Bar
  topBar: {
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  locationWrapper: {
    alignItems: "center",
    flex: 1,
  },
  locationPinBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#ECFDF5",
    justifyContent: "center",
    alignItems: "center",
  },
  locationRow: {
    alignItems: "center",
    gap: 4,
  },
  locationTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },
  locationSubtitle: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 1,
  },
  topActions: {
    alignItems: "center",
    gap: 8,
  },
  iconCircleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    justifyContent: "center",
    alignItems: "center",
  },
  unreadDot: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#10B981",
  },
  langSwitchBtn: {
    alignItems: "center",
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  langSwitchText: {
    color: "#059669",
    fontWeight: "700",
    fontSize: 12,
  },

  // 2. Search Bar
  searchContainer: {
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#0F172A",
    padding: 0,
  },
  filterBtn: {
    padding: 2,
  },

  // 3. Promo Hero Banner
  promoBanner: {
    backgroundColor: "#064E3B",
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
    shadowColor: "#064E3B",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  promoContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  promoTextCol: {
    flex: 1,
    paddingRight: 10,
  },
  promoTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#FFFFFF",
    lineHeight: 23,
    marginBottom: 8,
  },
  featurePoints: {
    gap: 4,
    marginBottom: 14,
  },
  featurePointRow: {
    alignItems: "center",
    gap: 6,
  },
  featurePointText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#D1FAE5",
  },
  promoButtonsRow: {
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  instantServiceBtn: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    alignItems: "center",
    gap: 4,
  },
  instantServiceBtnText: {
    color: "#065F46",
    fontWeight: "700",
    fontSize: 11,
  },
  scheduleServiceBtn: {
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.4)",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    alignItems: "center",
    gap: 4,
  },
  scheduleServiceBtnText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 11,
  },
  promoGraphicWrapper: {
    width: 72,
    height: 72,
    justifyContent: "center",
    alignItems: "center",
  },
  promoGraphicCircle: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 14,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  activeDot: {
    width: 18,
    backgroundColor: "#10B981",
  },

  // 4. Section & Popular Services Grid
  sectionContainer: {
    marginBottom: 22,
  },
  sectionHeaderRow: {
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },
  seeAllBtn: {
    alignItems: "center",
    gap: 2,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#059669",
  },
  loadingBox: {
    padding: 24,
    alignItems: "center",
    gap: 8,
  },
  loadingText: {
    fontSize: 12,
    color: "#64748B",
  },
  servicesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 12,
  },
  serviceItemCard: {
    width: "23%",
    alignItems: "center",
  },
  serviceIconBox: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#DCFCE7",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  serviceItemTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#1E293B",
    textAlign: "center",
    lineHeight: 14,
  },

  // 5. Recommended Carousel
  horizontalScrollList: {
    paddingRight: 8,
    gap: 12,
  },
  recommendCard: {
    width: 250,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "hidden",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cardImageContainer: {
    width: "100%",
    height: 125,
    backgroundColor: "#F1F5F9",
    position: "relative",
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  bestsellerBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  bestsellerText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#0F172A",
  },
  cardBody: {
    padding: 12,
  },
  recommendTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 6,
  },
  ratingDurationRow: {
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  ratingBox: {
    alignItems: "center",
    gap: 3,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#0F172A",
  },
  dotSeparator: {
    fontSize: 11,
    color: "#CBD5E1",
  },
  durationBox: {
    alignItems: "center",
    gap: 3,
  },
  durationText: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "600",
  },
  verifiedBadgeRow: {
    alignItems: "center",
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
    marginBottom: 10,
    alignSelf: "flex-start",
  },
  verifiedBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#059669",
  },
  cardFooter: {
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  priceText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
  },
  currencyText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748B",
  },
  originalPriceText: {
    fontSize: 10,
    color: "#94A3B8",
    textDecorationLine: "line-through",
  },
  bookNowBtn: {
    backgroundColor: "#059669",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
  },
  bookNowBtnText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },

  // 6. Trust Badges Row
  trustRowContainer: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 8,
    marginBottom: 20,
  },
  trustGrid: {
    justifyContent: "space-around",
    alignItems: "flex-start",
  },
  trustItem: {
    alignItems: "center",
    width: "23%",
  },
  trustIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#ECFDF5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  trustTitle: {
    fontSize: 9.5,
    fontWeight: "700",
    color: "#334155",
    textAlign: "center",
    lineHeight: 12,
  },

  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalCard: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
  },
  modalHeaderTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 16,
    textAlign: "center",
  },
  cityOptionRow: {
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 8,
    gap: 8,
  },
  selectedCityOption: {
    borderColor: "#059669",
    backgroundColor: "#ECFDF5",
  },
  cityNameText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#334155",
    flex: 1,
  },
  selectedCityNameText: {
    color: "#059669",
  },
  closeCityBtn: {
    backgroundColor: "#F1F5F9",
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  closeCityBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#475569",
  },
  notifIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#ECFDF5",
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  notifEmptyText: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 16,
  },
});
