import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Alert,
} from "react-native";
import { useRouter, usePathname } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useLanguage } from "@/lib/LanguageContext";
import { useAuth } from "@/lib/AuthContext";

interface BottomNavProps {
  activeTab?: "home" | "bookings" | "support" | "account";
}

export default function BottomNav({ activeTab = "home" }: BottomNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { t, lang, toggleLanguage, isRTL, flexRowStyle, alignText } = useLanguage();
  const { user, logout } = useAuth();

  const [supportModalVisible, setSupportModalVisible] = useState(false);
  const [accountModalVisible, setAccountModalVisible] = useState(false);

  const handleNav = (tab: "home" | "bookings" | "support" | "account") => {
    if (tab === "home") {
      if (pathname !== "/") router.push("/");
    } else if (tab === "bookings") {
      if (pathname !== "/bookings") router.push("/bookings");
    } else if (tab === "support") {
      setSupportModalVisible(true);
    } else if (tab === "account") {
      setAccountModalVisible(true);
    }
  };

  const handleLogout = async () => {
    setAccountModalVisible(false);
    await logout();
    router.replace("/login");
  };

  return (
    <>
      <View style={[styles.navContainer, flexRowStyle]}>
        {/* Home */}
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => handleNav("home")}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.iconWrapper,
              activeTab === "home" && styles.activeIconWrapper,
            ]}
          >
            <Ionicons
              name={activeTab === "home" ? "home" : "home-outline"}
              size={22}
              color={activeTab === "home" ? "#059669" : "#64748B"}
            />
          </View>
          <Text
            style={[
              styles.tabLabel,
              activeTab === "home" && styles.activeTabLabel,
            ]}
          >
            {t.home}
          </Text>
        </TouchableOpacity>

        {/* Bookings */}
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => handleNav("bookings")}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.iconWrapper,
              activeTab === "bookings" && styles.activeIconWrapper,
            ]}
          >
            <Ionicons
              name={activeTab === "bookings" ? "calendar" : "calendar-outline"}
              size={22}
              color={activeTab === "bookings" ? "#059669" : "#64748B"}
            />
          </View>
          <Text
            style={[
              styles.tabLabel,
              activeTab === "bookings" && styles.activeTabLabel,
            ]}
          >
            {t.bookings}
          </Text>
        </TouchableOpacity>

        {/* Support */}
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => handleNav("support")}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.iconWrapper,
              activeTab === "support" && styles.activeIconWrapper,
            ]}
          >
            <Ionicons
              name={activeTab === "support" ? "headset" : "headset-outline"}
              size={22}
              color={activeTab === "support" ? "#059669" : "#64748B"}
            />
          </View>
          <Text
            style={[
              styles.tabLabel,
              activeTab === "support" && styles.activeTabLabel,
            ]}
          >
            {t.support}
          </Text>
        </TouchableOpacity>

        {/* Account */}
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => handleNav("account")}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.iconWrapper,
              activeTab === "account" && styles.activeIconWrapper,
            ]}
          >
            <Ionicons
              name={activeTab === "account" ? "person" : "person-outline"}
              size={22}
              color={activeTab === "account" ? "#059669" : "#64748B"}
            />
          </View>
          <Text
            style={[
              styles.tabLabel,
              activeTab === "account" && styles.activeTabLabel,
            ]}
          >
            {t.account}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Support Modal */}
      <Modal
        visible={supportModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSupportModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.supportBadge}>
                <Ionicons name="headset" size={28} color="#059669" />
              </View>
              <Text style={styles.modalTitle}>
                {lang === "ckb" ? "پشتیوانی و پەیوەندی" : "Customer Support"}
              </Text>
              <Text style={styles.modalSubtitle}>
                {lang === "ckb"
                  ? "تیمی پشتیوانی هۆمفیکس ٢٤ کاتژمێر لە خزمەتتاندایە"
                  : "HomeFix support team is available 24/7 to assist you"}
              </Text>
            </View>

            <View style={styles.contactList}>
              <View style={[styles.contactCard, flexRowStyle]}>
                <Ionicons name="call" size={20} color="#059669" />
                <View style={{ flex: 1, marginHorizontal: 10 }}>
                  <Text style={[styles.contactName, { textAlign: alignText }]}>
                    {lang === "ckb" ? "هێڵی گەرم (خێرا)" : "Hotline"}
                  </Text>
                  <Text style={[styles.contactDetail, { textAlign: alignText }]}>
                    0750 000 0000
                  </Text>
                </View>
              </View>

              <View style={[styles.contactCard, flexRowStyle]}>
                <Ionicons name="logo-whatsapp" size={20} color="#16A34A" />
                <View style={{ flex: 1, marginHorizontal: 10 }}>
                  <Text style={[styles.contactName, { textAlign: alignText }]}>
                    WhatsApp
                  </Text>
                  <Text style={[styles.contactDetail, { textAlign: alignText }]}>
                    +964 750 123 4567
                  </Text>
                </View>
              </View>

              <View style={[styles.contactCard, flexRowStyle]}>
                <Ionicons name="mail" size={20} color="#0284C7" />
                <View style={{ flex: 1, marginHorizontal: 10 }}>
                  <Text style={[styles.contactName, { textAlign: alignText }]}>
                    Email Support
                  </Text>
                  <Text style={[styles.contactDetail, { textAlign: alignText }]}>
                    support@homefix.test
                  </Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={styles.closeModalBtn}
              onPress={() => setSupportModalVisible(false)}
            >
              <Text style={styles.closeModalBtnText}>
                {lang === "ckb" ? "داخستن" : "Close"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Account / Profile Modal */}
      <Modal
        visible={accountModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAccountModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarLetter}>
                  {(user?.name || "C")[0].toUpperCase()}
                </Text>
              </View>
              <Text style={styles.modalTitle}>
                {user?.name || (lang === "ckb" ? "کڕیار" : "Customer")}
              </Text>
              <Text style={styles.modalSubtitle}>
                {user?.email || "customer@homefix.test"}
              </Text>
              <View style={styles.roleBadge}>
                <Ionicons name="shield-checkmark" size={14} color="#059669" />
                <Text style={styles.roleBadgeText}>
                  {lang === "ckb" ? "ئەکاونتی چالاککراو" : "Verified Customer"}
                </Text>
              </View>
            </View>

            <View style={styles.accountOptions}>
              {/* Language Switch */}
              <TouchableOpacity
                style={[styles.accountOptionRow, flexRowStyle]}
                onPress={() => {
                  toggleLanguage();
                }}
              >
                <View style={[styles.optionIconBox, { backgroundColor: "#ECFDF5" }]}>
                  <Ionicons name="globe-outline" size={18} color="#059669" />
                </View>
                <Text style={[styles.optionLabel, { textAlign: alignText, flex: 1 }]}>
                  {lang === "ckb" ? "گۆڕینی زمان بۆ ئینگلیزی" : "Switch to کوردی (CKB)"}
                </Text>
                <Ionicons
                  name={isRTL ? "chevron-back" : "chevron-forward"}
                  size={18}
                  color="#94A3B8"
                />
              </TouchableOpacity>

              {/* View Bookings */}
              <TouchableOpacity
                style={[styles.accountOptionRow, flexRowStyle]}
                onPress={() => {
                  setAccountModalVisible(false);
                  router.push("/bookings");
                }}
              >
                <View style={[styles.optionIconBox, { backgroundColor: "#EFF6FF" }]}>
                  <Ionicons name="calendar-outline" size={18} color="#2563EB" />
                </View>
                <Text style={[styles.optionLabel, { textAlign: alignText, flex: 1 }]}>
                  {t.myBookings}
                </Text>
                <Ionicons
                  name={isRTL ? "chevron-back" : "chevron-forward"}
                  size={18}
                  color="#94A3B8"
                />
              </TouchableOpacity>

              {/* Logout */}
              <TouchableOpacity
                style={[styles.accountOptionRow, styles.logoutOptionRow, flexRowStyle]}
                onPress={handleLogout}
              >
                <View style={[styles.optionIconBox, { backgroundColor: "#FFF1F2" }]}>
                  <Ionicons name="log-out-outline" size={18} color="#E11D48" />
                </View>
                <Text
                  style={[
                    styles.optionLabel,
                    { color: "#E11D48", textAlign: alignText, flex: 1 },
                  ]}
                >
                  {t.logout}
                </Text>
                <Ionicons
                  name={isRTL ? "chevron-back" : "chevron-forward"}
                  size={18}
                  color="#E11D48"
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.closeModalBtn}
              onPress={() => setAccountModalVisible(false)}
            >
              <Text style={styles.closeModalBtnText}>
                {lang === "ckb" ? "داخستن" : "Close"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  navContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 72,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    paddingHorizontal: 16,
    justifyContent: "space-around",
    alignItems: "center",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 8,
  },
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    paddingVertical: 6,
  },
  iconWrapper: {
    width: 38,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  activeIconWrapper: {
    backgroundColor: "#ECFDF5",
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748B",
    marginTop: 2,
  },
  activeTabLabel: {
    color: "#059669",
    fontWeight: "700",
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    alignItems: "center",
    marginBottom: 20,
  },
  supportBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#ECFDF5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#059669",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  avatarLetter: {
    fontSize: 26,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
    gap: 6,
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#059669",
  },
  contactList: {
    gap: 10,
    marginBottom: 20,
  },
  contactCard: {
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  contactName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
  },
  contactDetail: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  accountOptions: {
    gap: 10,
    marginBottom: 20,
  },
  accountOptionRow: {
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    gap: 12,
  },
  logoutOptionRow: {
    backgroundColor: "#FFF1F2",
    borderColor: "#FECDD3",
  },
  optionIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },
  closeModalBtn: {
    backgroundColor: "#F1F5F9",
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
  },
  closeModalBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#475569",
  },
});
