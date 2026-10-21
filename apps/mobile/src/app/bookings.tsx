import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useLanguage } from "@/lib/LanguageContext";
import { apiFetch } from "@/lib/api";
import BottomNav from "@/components/BottomNav";

interface Booking {
  id: string;
  customerId: string;
  providerId: string;
  customerName: string;
  phone: string;
  address: string;
  scheduledAt: string;
  notes?: string | null;
  status: "pending" | "confirmed" | "in_progress" | "completed" | "cancelled";
  createdAt: string;
  provider?: {
    name: string;
    city: string;
    phone: string;
    hourlyRate: number;
  };
}

export default function BookingsScreen() {
  const router = useRouter();
  const { t, lang, isRTL, alignText, flexRowStyle } = useLanguage();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filterTab, setFilterTab] = useState<"all" | "active" | "completed">("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const res = await apiFetch<Booking[]>("/bookings/me");
      if (res.success && res.data) {
        setBookings(res.data);
      }
    } catch (err: any) {
      console.warn("Error fetching bookings:", err.message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const onRefresh = () => {
    setIsRefreshing(true);
    loadBookings();
  };

  const getStatusBadgeStyle = (status: Booking["status"]) => {
    switch (status) {
      case "pending":
        return {
          bg: "#FEF3C7",
          text: "#B45309",
          label: lang === "ckb" ? "چاوەڕوانکراو" : "Pending",
          icon: "time-outline",
        };
      case "confirmed":
        return {
          bg: "#E0F2FE",
          text: "#0369A1",
          label: lang === "ckb" ? "پەسەندکراو" : "Confirmed",
          icon: "checkmark-circle-outline",
        };
      case "in_progress":
        return {
          bg: "#EEF2FF",
          text: "#4338CA",
          label: lang === "ckb" ? "لە جێبەجێکردندا" : "In Progress",
          icon: "construct-outline",
        };
      case "completed":
        return {
          bg: "#ECFDF5",
          text: "#047857",
          label: lang === "ckb" ? "تەواوکراو" : "Completed",
          icon: "checkmark-done-circle",
        };
      case "cancelled":
        return {
          bg: "#FFF1F2",
          text: "#BE123C",
          label: lang === "ckb" ? "هەڵوەشاوە" : "Cancelled",
          icon: "close-circle-outline",
        };
      default:
        return {
          bg: "#F1F5F9",
          text: "#475569",
          label: status,
          icon: "ellipse-outline",
        };
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString(lang === "ckb" ? "ckb" : "en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoString;
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (filterTab === "active") {
      return (
        b.status === "pending" ||
        b.status === "confirmed" ||
        b.status === "in_progress"
      );
    }
    if (filterTab === "completed") {
      return b.status === "completed" || b.status === "cancelled";
    }
    return true;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={["#059669"]}
            tintColor="#059669"
          />
        }
      >
        <View style={[styles.header, flexRowStyle]}>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>{t.myBookings}</Text>
            <Text style={styles.headerSubtitle}>{t.bookingsSubtitle}</Text>
          </View>

          <TouchableOpacity
            style={styles.refreshBtn}
            onPress={onRefresh}
            activeOpacity={0.8}
          >
            <Ionicons name="reload" size={18} color="#059669" />
          </TouchableOpacity>
        </View>

        <View style={[styles.segmentContainer, flexRowStyle]}>
          <TouchableOpacity
            style={[
              styles.segmentBtn,
              filterTab === "all" && styles.activeSegmentBtn,
            ]}
            onPress={() => setFilterTab("all")}
          >
            <Text
              style={[
                styles.segmentBtnText,
                filterTab === "all" && styles.activeSegmentBtnText,
              ]}
            >
              {lang === "ckb" ? "هەمووی" : "All"} ({bookings.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.segmentBtn,
              filterTab === "active" && styles.activeSegmentBtn,
            ]}
            onPress={() => setFilterTab("active")}
          >
            <Text
              style={[
                styles.segmentBtnText,
                filterTab === "active" && styles.activeSegmentBtnText,
              ]}
            >
              {lang === "ckb" ? "چالاک" : "Active"} (
              {
                bookings.filter(
                  (b) =>
                    b.status === "pending" ||
                    b.status === "confirmed" ||
                    b.status === "in_progress"
                ).length
              }
              )
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.segmentBtn,
              filterTab === "completed" && styles.activeSegmentBtn,
            ]}
            onPress={() => setFilterTab("completed")}
          >
            <Text
              style={[
                styles.segmentBtnText,
                filterTab === "completed" && styles.activeSegmentBtnText,
              ]}
            >
              {lang === "ckb" ? "تەواوکراو" : "Completed"} (
              {
                bookings.filter(
                  (b) => b.status === "completed" || b.status === "cancelled"
                ).length
              }
              )
            </Text>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#059669" />
            <Text style={styles.loadingText}>{t.loading}</Text>
          </View>
        ) : filteredBookings.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="calendar-outline" size={40} color="#94A3B8" />
            </View>
            <Text style={styles.emptyTitle}>{t.noBookings}</Text>
            <Text style={styles.emptySubtitle}>{t.bookFirstService}</Text>
            <TouchableOpacity
              style={styles.exploreBtn}
              onPress={() => router.push("/")}
              activeOpacity={0.85}
            >
              <Text style={styles.exploreBtnText}>
                {lang === "ckb" ? "بینینی خزمەتگوزارییەکان" : "Explore Services"}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.bookingsList}>
            {filteredBookings.map((booking) => {
              const statusMeta = getStatusBadgeStyle(booking.status);

              return (
                <View key={booking.id} style={styles.bookingCard}>
                  <View style={[styles.cardHeaderRow, flexRowStyle]}>
                    <View style={styles.bookingRefRow}>
                      <Text style={styles.bookingRefText}>
                        #BK-{booking.id.slice(0, 8)}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: statusMeta.bg },
                        flexRowStyle,
                      ]}
                    >
                      <Ionicons
                        name={statusMeta.icon as any}
                        size={12}
                        color={statusMeta.text}
                      />
                      <Text
                        style={[styles.statusBadgeText, { color: statusMeta.text }]}
                      >
                        {statusMeta.label}
                      </Text>
                    </View>
                  </View>

                  <View style={[styles.providerRow, flexRowStyle]}>
                    <View style={styles.providerAvatar}>
                      <Text style={styles.providerAvatarText}>
                        {(booking.provider?.name || "W")[0].toUpperCase()}
                      </Text>
                    </View>

                    <View style={{ flex: 1, marginHorizontal: 12 }}>
                      <Text style={[styles.providerName, { textAlign: alignText }]}>
                        {booking.provider?.name || (lang === "ckb" ? "وەستای هۆمفیکس" : "HomeFix Provider")}
                      </Text>
                      <Text style={[styles.providerDetail, { textAlign: alignText }]}>
                        {booking.provider?.city || "Erbil"} •{" "}
                        {booking.provider?.hourlyRate?.toLocaleString() || "25,000"} {t.iqd} {t.perHour}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.metaBox}>
                    <View style={[styles.metaItem, flexRowStyle]}>
                      <Ionicons name="time-outline" size={15} color="#059669" />
                      <Text style={[styles.metaText, { textAlign: alignText }]}>
                        {t.scheduledFor}: {formatDate(booking.scheduledAt)}
                      </Text>
                    </View>

                    <View style={[styles.metaItem, flexRowStyle]}>
                      <Ionicons name="location-outline" size={15} color="#059669" />
                      <Text
                        style={[styles.metaText, { textAlign: alignText }]}
                        numberOfLines={1}
                      >
                        {booking.address}
                      </Text>
                    </View>

                    {booking.notes && (
                      <View style={[styles.metaItem, flexRowStyle]}>
                        <Ionicons name="document-text-outline" size={15} color="#64748B" />
                        <Text
                          style={[styles.notesText, { textAlign: alignText }]}
                          numberOfLines={2}
                        >
                          "{booking.notes}"
                        </Text>
                      </View>
                    )}
                  </View>

                  <View style={[styles.cardFooter, flexRowStyle]}>
                    <TouchableOpacity
                      style={[styles.footerBtn, flexRowStyle]}
                      onPress={() => {
                        Alert.alert(
                          booking.provider?.name || "Provider",
                          `${lang === "ckb" ? "ژمارەی پەیوەندی:" : "Phone:"} ${booking.provider?.phone || booking.phone}`
                        );
                      }}
                    >
                      <Ionicons name="call" size={14} color="#059669" />
                      <Text style={styles.footerBtnText}>
                        {lang === "ckb" ? "پەیوەندی" : "Call"}
                      </Text>
                    </TouchableOpacity>

                    <View style={styles.liveTrackingIndicator}>
                      <View style={styles.livePulse} />
                      <Text style={styles.liveTrackingText}>
                        {lang === "ckb" ? "چاودێری ڕاستەوخۆ" : "Live Track"}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        <View style={{ height: 95 }} />
      </ScrollView>

      <BottomNav activeTab="bookings" />
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
    marginBottom: 16,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
  },
  headerSubtitle: {
    fontSize: 11.5,
    color: "#64748B",
    marginTop: 2,
  },
  refreshBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    justifyContent: "center",
    alignItems: "center",
  },

  segmentContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 4,
    marginBottom: 16,
    gap: 4,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: "center",
  },
  activeSegmentBtn: {
    backgroundColor: "#ECFDF5",
  },
  segmentBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
  },
  activeSegmentBtnText: {
    color: "#059669",
    fontWeight: "800",
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
    padding: 32,
    alignItems: "center",
    marginTop: 20,
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
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 6,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 12.5,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 20,
  },
  exploreBtn: {
    backgroundColor: "#059669",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
  },
  exploreBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 13,
  },

  bookingsList: {
    gap: 14,
  },
  bookingCard: {
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
  cardHeaderRow: {
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    marginBottom: 12,
  },
  bookingRefRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  bookingRefText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0F172A",
  },
  statusBadge: {
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 5,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  providerRow: {
    alignItems: "center",
    marginBottom: 12,
  },
  providerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#059669",
    justifyContent: "center",
    alignItems: "center",
  },
  providerAvatarText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
  },
  providerName: {
    fontSize: 14.5,
    fontWeight: "800",
    color: "#0F172A",
  },
  providerDetail: {
    fontSize: 11.5,
    color: "#64748B",
    marginTop: 2,
  },
  metaBox: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 12,
    gap: 8,
    marginBottom: 12,
  },
  metaItem: {
    alignItems: "center",
    gap: 8,
  },
  metaText: {
    fontSize: 12,
    color: "#334155",
    fontWeight: "600",
    flex: 1,
  },
  notesText: {
    fontSize: 11.5,
    color: "#64748B",
    fontStyle: "italic",
    flex: 1,
  },
  cardFooter: {
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 4,
  },
  footerBtn: {
    alignItems: "center",
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 5,
  },
  footerBtnText: {
    fontSize: 11.5,
    fontWeight: "700",
    color: "#059669",
  },
  liveTrackingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  livePulse: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#10B981",
  },
  liveTrackingText: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "600",
  },
});
