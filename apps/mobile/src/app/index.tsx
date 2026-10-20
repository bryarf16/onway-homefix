import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useLanguage } from "@/lib/LanguageContext";
import { useAuth } from "@/lib/AuthContext";

export default function HomeScreen() {
  const router = useRouter();
  const { t, lang, toggleLanguage, isRTL, alignText, flexRowStyle } = useLanguage();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* هێڵی سەرەوە: ناو و دوگمەی زمان و دەرچوون */}
        <View style={[styles.header, flexRowStyle]}>
          <View style={[styles.brandWrapper, flexRowStyle]}>
            <View style={styles.brandIcon}>
              <Ionicons name="build" size={20} color="#059669" />
            </View>
            <View>
              <Text style={styles.brandName}>HomeFix</Text>
              <Text style={styles.customerName}>
                {user?.name || (lang === "ckb" ? "کڕیار" : "Customer")}
              </Text>
            </View>
          </View>

          <View style={[styles.headerActions, flexRowStyle]}>
            <TouchableOpacity
              onPress={toggleLanguage}
              style={[styles.langButton, flexRowStyle]}
              activeOpacity={0.8}
            >
              <Ionicons name="globe-outline" size={15} color="#059669" />
              <Text style={styles.langButtonText}>
                {lang === "en" ? "کوردی" : "EN"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleLogout}
              style={styles.logoutButton}
              activeOpacity={0.8}
            >
              <Ionicons name="log-out-outline" size={20} color="#E11D48" />
            </TouchableOpacity>
          </View>
        </View>

        {/* باڕی بەخێرهاتن (Hero Banner) */}
        <View style={styles.heroCard}>
          <View style={[styles.heroRow, flexRowStyle]}>
            <View style={styles.heroTextContainer}>
              <Text style={[styles.heroGreeting, { textAlign: alignText }]}>
                {lang === "ckb" ? `سڵاو، ${user?.name || "بەڕێز"} 👋` : `Hello, ${user?.name || "there"} 👋`}
              </Text>
              <Text style={[styles.heroSubtitle, { textAlign: alignText }]}>
                {t.categoriesTitle}
              </Text>
            </View>
            <View style={styles.heroIconBadge}>
              <Ionicons name="shield-checkmark" size={28} color="#059669" />
            </View>
          </View>
        </View>

        {/* دوگمەکانی بەشی خێرا (Quick Actions) */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { textAlign: alignText }]}>
            {t.home}
          </Text>
        </View>

        {/* کارتی ئاگاداری بۆ هەنگاوی داهاتوو */}
        <View style={styles.readyCard}>
          <View style={styles.readyIconCircle}>
            <Ionicons name="checkmark-circle" size={32} color="#059669" />
          </View>
          <Text style={[styles.readyTitle, { textAlign: alignText }]}>
            {lang === "ckb"
              ? "لۆگین و سیستەمی زمان ١٠٠٪ سەرکەوتوو بوو!"
              : "Auth & i18n are 100% Ready!"}
          </Text>
          <Text style={[styles.readySubtitle, { textAlign: alignText }]}>
            {lang === "ckb"
              ? "ئێستا تۆ بە ئەکاونتی کڕیاری تێست دەچیتە ژوورەوە. لە هەنگاوی داهاتوودا لیستی خزمەتگوزارییەکان و وەستاکان بەستراوە لەگەڵ داتابەیس پیشان دەدرێن."
              : "You are signed in as demo customer. Categories and providers from API will load in the next step."}
          </Text>

          <TouchableOpacity
            onPress={toggleLanguage}
            style={[styles.switchLangBigBtn, flexRowStyle]}
            activeOpacity={0.8}
          >
            <Ionicons name="language" size={18} color="#FFFFFF" />
            <Text style={styles.switchLangBigText}>
              {lang === "en" ? "گۆڕین بۆ کوردی (RTL)" : "Switch to English (LTR)"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  header: {
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  brandWrapper: {
    alignItems: "center",
    gap: 10,
  },
  brandIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#ECFDF5",
    borderWidth: 1.2,
    borderColor: "#A7F3D0",
    justifyContent: "center",
    alignItems: "center",
  },
  brandName: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
    lineHeight: 20,
  },
  customerName: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
    marginTop: 2,
  },
  headerActions: {
    alignItems: "center",
    gap: 8,
  },
  langButton: {
    alignItems: "center",
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 5,
  },
  langButtonText: {
    color: "#059669",
    fontWeight: "700",
    fontSize: 12,
  },
  logoutButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#FFF1F2",
    borderWidth: 1,
    borderColor: "#FECDD3",
    justifyContent: "center",
    alignItems: "center",
  },
  heroCard: {
    backgroundColor: "#059669",
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#059669",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  heroRow: {
    justifyContent: "space-between",
    alignItems: "center",
  },
  heroTextContainer: {
    flex: 1,
  },
  heroGreeting: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 13,
    color: "#D1FAE5",
    fontWeight: "500",
  },
  heroIconBadge: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  readyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  readyIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#ECFDF5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  readyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 6,
  },
  readySubtitle: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
  switchLangBigBtn: {
    backgroundColor: "#059669",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
    gap: 8,
  },
  switchLangBigText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
});
