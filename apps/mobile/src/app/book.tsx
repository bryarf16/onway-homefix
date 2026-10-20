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
import { useAuth } from "@/lib/AuthContext";
import { apiFetch } from "@/lib/api";

interface Provider {
  id: string;
  name: string;
  categoryId: string;
  city: string;
  phone: string;
  hourlyRate: number;
}

export default function BookScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ providerId: string }>();
  const { t, lang, isRTL, alignText, flexRowStyle } = useLanguage();
  const { user } = useAuth();

  const [provider, setProvider] = useState<Provider | null>(null);
  const [isLoadingProvider, setIsLoadingProvider] = useState(true);

  // Form State
  const [customerName, setCustomerName] = useState(user?.name || "");
  const [phone, setPhone] = useState("0750 123 4567");
  const [address, setAddress] = useState(
    lang === "ckb" ? "هەولێر، گەڕەکی بەختیاری، کۆڵانی ١٤" : "Erbil, Bakhtiyari, Street 14"
  );
  const [selectedDateDay, setSelectedDateDay] = useState<"today" | "tomorrow" | "dayAfter">("today");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("10:00 AM");
  const [notes, setNotes] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successBookingId, setSuccessBookingId] = useState<string | null>(null);

  useEffect(() => {
    loadProviderDetails();
  }, [params.providerId]);

  const loadProviderDetails = async () => {
    if (!params.providerId) return;
    setIsLoadingProvider(true);
    try {
      const res = await apiFetch<Provider[]>("/providers");
      if (res.success && res.data) {
        const found = res.data.find((p) => p.id === params.providerId);
        if (found) {
          setProvider(found);
        }
      }
    } catch (err: any) {
      console.warn("Could not load provider:", err.message);
    } finally {
      setIsLoadingProvider(false);
    }
  };

  const getScheduledIsoString = () => {
    const d = new Date();
    if (selectedDateDay === "tomorrow") {
      d.setDate(d.getDate() + 1);
    } else if (selectedDateDay === "dayAfter") {
      d.setDate(d.getDate() + 2);
    }

    // دیاریکردنی کاتژمێر
    if (selectedTimeSlot.includes("09:00")) d.setHours(9, 0, 0, 0);
    else if (selectedTimeSlot.includes("10:00")) d.setHours(10, 0, 0, 0);
    else if (selectedTimeSlot.includes("01:00")) d.setHours(13, 0, 0, 0);
    else if (selectedTimeSlot.includes("04:00")) d.setHours(16, 0, 0, 0);
    else if (selectedTimeSlot.includes("07:00")) d.setHours(19, 0, 0, 0);
    else d.setHours(11, 0, 0, 0);

    return d.toISOString();
  };

  const handleSubmitBooking = async () => {
    if (!customerName.trim() || !phone.trim() || !address.trim()) {
      Alert.alert(
        lang === "ckb" ? "زانیاری تەواو نەکراو" : "Missing Information",
        lang === "ckb"
          ? "تکایە دڵنیابە لە پڕکردنەوەی ناو، ژمارەی مۆبایل و ناونیشان."
          : "Please fill in your name, phone number, and address."
      );
      return;
    }

    if (!provider) {
      Alert.alert("Error", "No provider selected.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await apiFetch("/bookings", {
        method: "POST",
        body: JSON.stringify({
          providerId: provider.id,
          customerName: customerName.trim(),
          phone: phone.trim(),
          address: address.trim(),
          scheduledAt: getScheduledIsoString(),
          notes: notes.trim() || undefined,
        }),
      });

      if (res.success && res.data) {
        setSuccessBookingId(res.data.id || "BK-" + Math.floor(Math.random() * 8999 + 1000));
      } else {
        throw new Error(res.message || "Failed to create booking");
      }
    } catch (err: any) {
      Alert.alert(
        lang === "ckb" ? "هەڵە لە حجزکردن" : "Booking Error",
        err.message || "Could not submit booking."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ========================================================
            1. HEADER & BACK BUTTON
            ======================================================== */}
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
            <Text style={styles.headerTitle}>{t.createBookingTitle}</Text>
            <Text style={styles.headerSubtitle}>
              {lang === "ckb"
                ? "تەنها چەند هەنگاوێک ماوە بۆ تەواوکردنی حجزەکەت"
                : "A few steps to confirm your professional technician"}
            </Text>
          </View>
        </View>

        {/* ========================================================
            2. PROVIDER SUMMARY CARD
            ======================================================== */}
        {isLoadingProvider ? (
          <View style={styles.providerLoadingCard}>
            <ActivityIndicator size="small" color="#059669" />
          </View>
        ) : provider ? (
          <View style={styles.providerSummaryCard}>
            <View style={[styles.providerSummaryRow, flexRowStyle]}>
              <View style={styles.providerAvatar}>
                <Text style={styles.providerAvatarText}>
                  {provider.name[0]?.toUpperCase()}
                </Text>
              </View>

              <View style={{ flex: 1, marginHorizontal: 12 }}>
                <View style={[styles.nameRow, flexRowStyle]}>
                  <Text style={[styles.providerName, { textAlign: alignText }]}>
                    {provider.name}
                  </Text>
                  <Ionicons name="checkmark-circle" size={16} color="#059669" />
                </View>
                <Text style={[styles.providerCity, { textAlign: alignText }]}>
                  {provider.city} • {provider.phone}
                </Text>
              </View>

              <View style={styles.rateBadge}>
                <Text style={styles.rateBadgeAmount}>
                  {provider.hourlyRate.toLocaleString()} {t.iqd}
                </Text>
                <Text style={styles.rateBadgeUnit}>{t.perHour}</Text>
              </View>
            </View>
          </View>
        ) : null}

        {/* ========================================================
            3. BOOKING FORM
            ======================================================== */}
        <View style={styles.formContainer}>
          {/* Customer Name */}
          <View style={styles.formGroup}>
            <Text style={[styles.inputLabel, { textAlign: alignText }]}>
              {t.customerName}
            </Text>
            <View style={[styles.inputWrapper, flexRowStyle]}>
              <Ionicons name="person-outline" size={18} color="#94A3B8" />
              <TextInput
                style={[styles.textInput, { textAlign: alignText }]}
                value={customerName}
                onChangeText={setCustomerName}
                placeholder={lang === "ckb" ? "ناوی تەواوی خۆت بنووسە" : "Enter your full name"}
                placeholderTextColor="#94A3B8"
              />
            </View>
          </View>

          {/* Phone Number */}
          <View style={styles.formGroup}>
            <Text style={[styles.inputLabel, { textAlign: alignText }]}>
              {t.phone}
            </Text>
            <View style={[styles.inputWrapper, flexRowStyle]}>
              <Ionicons name="call-outline" size={18} color="#94A3B8" />
              <TextInput
                style={[styles.textInput, { textAlign: alignText }]}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                placeholder="0750 000 0000"
                placeholderTextColor="#94A3B8"
              />
            </View>
          </View>

          {/* Full Address */}
          <View style={styles.formGroup}>
            <Text style={[styles.inputLabel, { textAlign: alignText }]}>
              {t.address}
            </Text>
            <View style={[styles.inputWrapper, flexRowStyle]}>
              <Ionicons name="location-outline" size={18} color="#94A3B8" />
              <TextInput
                style={[styles.textInput, { textAlign: alignText }]}
                value={address}
                onChangeText={setAddress}
                placeholder={
                  lang === "ckb"
                    ? "شار، گەڕەک، ناونیشانی تەواو"
                    : "City, neighborhood, building"
                }
                placeholderTextColor="#94A3B8"
              />
            </View>
          </View>

          {/* Date Selector Chips */}
          <View style={styles.formGroup}>
            <Text style={[styles.inputLabel, { textAlign: alignText }]}>
              {lang === "ckb" ? "ڕۆژی خزمەتگوزاری" : "Service Date"}
            </Text>
            <View style={[styles.chipsRow, flexRowStyle]}>
              <TouchableOpacity
                style={[
                  styles.chipBtn,
                  selectedDateDay === "today" && styles.activeChipBtn,
                ]}
                onPress={() => setSelectedDateDay("today")}
              >
                <Text
                  style={[
                    styles.chipBtnText,
                    selectedDateDay === "today" && styles.activeChipBtnText,
                  ]}
                >
                  {lang === "ckb" ? "ئەمڕۆ" : "Today"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.chipBtn,
                  selectedDateDay === "tomorrow" && styles.activeChipBtn,
                ]}
                onPress={() => setSelectedDateDay("tomorrow")}
              >
                <Text
                  style={[
                    styles.chipBtnText,
                    selectedDateDay === "tomorrow" && styles.activeChipBtnText,
                  ]}
                >
                  {lang === "ckb" ? "بەیانی" : "Tomorrow"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.chipBtn,
                  selectedDateDay === "dayAfter" && styles.activeChipBtn,
                ]}
                onPress={() => setSelectedDateDay("dayAfter")}
              >
                <Text
                  style={[
                    styles.chipBtnText,
                    selectedDateDay === "dayAfter" && styles.activeChipBtnText,
                  ]}
                >
                  {lang === "ckb" ? "دوو ڕۆژی تر" : "In 2 Days"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Time Slot Chips */}
          <View style={styles.formGroup}>
            <Text style={[styles.inputLabel, { textAlign: alignText }]}>
              {lang === "ckb" ? "کاتی گەیشتنی وەستا" : "Arrival Time Window"}
            </Text>
            <View style={[styles.timeChipsGrid, flexRowStyle]}>
              {["09:00 AM", "10:00 AM", "01:00 PM", "04:00 PM", "07:00 PM"].map(
                (time) => {
                  const isSelected = selectedTimeSlot === time;
                  return (
                    <TouchableOpacity
                      key={time}
                      style={[
                        styles.timeChip,
                        isSelected && styles.activeTimeChip,
                      ]}
                      onPress={() => setSelectedTimeSlot(time)}
                    >
                      <Ionicons
                        name="time-outline"
                        size={13}
                        color={isSelected ? "#FFFFFF" : "#64748B"}
                      />
                      <Text
                        style={[
                          styles.timeChipText,
                          isSelected && styles.activeTimeChipText,
                        ]}
                      >
                        {time}
                      </Text>
                    </TouchableOpacity>
                  );
                }
              )}
            </View>
          </View>

          {/* Notes / Description */}
          <View style={styles.formGroup}>
            <Text style={[styles.inputLabel, { textAlign: alignText }]}>
              {t.notes}
            </Text>
            <View style={[styles.textAreaWrapper]}>
              <TextInput
                style={[styles.textAreaInput, { textAlign: alignText }]}
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
                placeholder={t.notesPlaceholder}
                placeholderTextColor="#94A3B8"
              />
            </View>
          </View>

          {/* Transparent Price Summary */}
          <View style={styles.pricingSummaryCard}>
            <View style={[styles.priceSummaryRow, flexRowStyle]}>
              <Text style={styles.summaryLabel}>
                {lang === "ckb" ? "کرێی سەرەتایی وەستا" : "Initial Technician Rate"}
              </Text>
              <Text style={styles.summaryValue}>
                {provider ? `${provider.hourlyRate.toLocaleString()} ${t.iqd}` : `0 ${t.iqd}`}
              </Text>
            </View>

            <View style={[styles.priceSummaryRow, flexRowStyle]}>
              <Text style={styles.summaryLabel}>
                {lang === "ckb" ? "پشکنین و دیاریکردنی کێشە" : "Inspection & Diagnostics"}
              </Text>
              <Text style={[styles.summaryValue, { color: "#059669" }]}>
                {lang === "ckb" ? "بێبەرامبەر لەگەڵ چاککردن" : "Free with repair"}
              </Text>
            </View>

            <View style={[styles.priceSummaryRow, styles.totalSummaryRow, flexRowStyle]}>
              <Text style={styles.totalLabel}>
                {lang === "ckb" ? "کۆی گشتی خەمڵێنراو" : "Estimated Total"}
              </Text>
              <Text style={styles.totalValue}>
                {provider ? `${provider.hourlyRate.toLocaleString()} ${t.iqd}` : `0 ${t.iqd}`}
              </Text>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, flexRowStyle]}
            onPress={handleSubmitBooking}
            disabled={isSubmitting}
            activeOpacity={0.85}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="checkmark-done" size={20} color="#FFFFFF" />
                <Text style={styles.submitButtonText}>
                  {lang === "ckb" ? "تەئکیدکردنەوە و ناردنی داواکاری" : "Confirm & Send Booking"}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ========================================================
          SUCCESS MODAL
          ======================================================== */}
      <Modal
        visible={!!successBookingId}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setSuccessBookingId(null);
          router.replace("/bookings");
        }}
      >
        <View style={styles.successModalOverlay}>
          <View style={styles.successCard}>
            <View style={styles.successIconCircle}>
              <Ionicons name="checkmark" size={38} color="#FFFFFF" />
            </View>

            <Text style={styles.successTitle}>
              {lang === "ckb" ? "داواکارییەکەت تۆمارکرا!" : "Booking Confirmed!"}
            </Text>

            <Text style={styles.successSubtitle}>
              {lang === "ckb"
                ? "وەستاکە ئاگادارکرایەوە و پەیوەندیت پێوە دەکات بۆ تەواوکردنی وردەکارییەکان."
                : "The provider has been notified and will contact you shortly to confirm."}
            </Text>

            <View style={styles.refBox}>
              <Text style={styles.refLabel}>
                {lang === "ckb" ? "کۆدی حجزکردن:" : "Booking Reference:"}
              </Text>
              <Text style={styles.refId}>#{successBookingId?.slice(0, 8)}</Text>
            </View>

            <TouchableOpacity
              style={styles.viewBookingsBtn}
              onPress={() => {
                setSuccessBookingId(null);
                router.replace("/bookings");
              }}
            >
              <Text style={styles.viewBookingsBtnText}>
                {lang === "ckb" ? "سەیری حجزەکانم بکە" : "View My Bookings"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.goHomeBtn}
              onPress={() => {
                setSuccessBookingId(null);
                router.replace("/");
              }}
            >
              <Text style={styles.goHomeBtnText}>
                {lang === "ckb" ? "گەڕانەوە بۆ سەرەکی" : "Back to Home"}
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
    backgroundColor: "#F8FAFC",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  header: {
    alignItems: "center",
    marginBottom: 16,
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
  providerLoadingCard: {
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 16,
  },
  providerSummaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 14,
    marginBottom: 18,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  providerSummaryRow: {
    alignItems: "center",
  },
  providerAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#059669",
    justifyContent: "center",
    alignItems: "center",
  },
  providerAvatarText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  nameRow: {
    alignItems: "center",
    gap: 4,
  },
  providerName: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
  },
  providerCity: {
    fontSize: 11.5,
    color: "#64748B",
    marginTop: 2,
  },
  rateBadge: {
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    alignItems: "center",
  },
  rateBadgeAmount: {
    fontSize: 12,
    fontWeight: "800",
    color: "#059669",
  },
  rateBadgeUnit: {
    fontSize: 10,
    color: "#059669",
  },

  // Form
  formContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 18,
  },
  formGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 6,
  },
  inputWrapper: {
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
    gap: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 13,
    color: "#0F172A",
  },
  chipsRow: {
    gap: 8,
  },
  chipBtn: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
  },
  activeChipBtn: {
    backgroundColor: "#ECFDF5",
    borderColor: "#059669",
  },
  chipBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
  },
  activeChipBtnText: {
    color: "#059669",
    fontWeight: "800",
  },
  timeChipsGrid: {
    flexWrap: "wrap",
    gap: 6,
  },
  timeChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 5,
  },
  activeTimeChip: {
    backgroundColor: "#059669",
    borderColor: "#059669",
  },
  timeChipText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#475569",
  },
  activeTimeChipText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  textAreaWrapper: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    padding: 10,
    minHeight: 75,
  },
  textAreaInput: {
    fontSize: 13,
    color: "#0F172A",
    textAlignVertical: "top",
  },

  // Pricing
  pricingSummaryCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 14,
    marginBottom: 18,
    gap: 8,
  },
  priceSummaryRow: {
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 12,
    color: "#64748B",
  },
  summaryValue: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0F172A",
  },
  totalSummaryRow: {
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    paddingTop: 8,
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0F172A",
  },
  totalValue: {
    fontSize: 14,
    fontWeight: "800",
    color: "#059669",
  },
  submitButton: {
    backgroundColor: "#059669",
    paddingVertical: 14,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },

  // Success Modal
  successModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  successCard: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
  },
  successIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "#059669",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 6,
    textAlign: "center",
  },
  successSubtitle: {
    fontSize: 12.5,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 16,
  },
  refBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
    marginBottom: 20,
  },
  refLabel: {
    fontSize: 12,
    color: "#059669",
    fontWeight: "600",
  },
  refId: {
    fontSize: 13,
    fontWeight: "800",
    color: "#059669",
  },
  viewBookingsBtn: {
    width: "100%",
    backgroundColor: "#059669",
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 8,
  },
  viewBookingsBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  goHomeBtn: {
    width: "100%",
    backgroundColor: "#F1F5F9",
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
  },
  goHomeBtnText: {
    color: "#475569",
    fontSize: 13,
    fontWeight: "700",
  },
});
