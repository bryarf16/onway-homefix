import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useLanguage } from "@/lib/LanguageContext";
import { useAuth } from "@/lib/AuthContext";

export default function LoginScreen() {
  const router = useRouter();
  const { t, lang, toggleLanguage, isRTL, alignText, flexRowStyle } = useLanguage();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // پڕکردنەوەی خێرای کڕیاری تێست بۆ ئاسانکاری هەڵسەنگێنەرانی کۆمپانیا
  const fillDemoCustomer = () => {
    setEmail("customer@homefix.test");
    setPassword("customer123");
    setError(null);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setError(
        lang === "ckb"
          ? "تکایە هەردوو خانەی ئیمەیڵ و تێپەڕەوشە پڕبکەرەوە"
          : "Please fill in both email and password"
      );
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await login(email.trim(), password);
      // چوونە ناو ئەپەکە دوای لۆگینی سەرکەوتوو
      router.replace("/");
    } catch (err: any) {
      if (err.message?.includes("Invalid email or password") || err.message?.includes("401")) {
        setError(t.invalidCredentials);
      } else {
        setError(err.message || t.loginFailed);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* بەشی سەرەوە: دوگمەی گۆڕینی زمان */}
          <View style={[styles.topBar, flexRowStyle]}>
            <TouchableOpacity
              onPress={toggleLanguage}
              style={[styles.langButton, flexRowStyle]}
              activeOpacity={0.8}
            >
              <Ionicons name="globe-outline" size={16} color="#059669" />
              <Text style={styles.langButtonText}>
                {lang === "en" ? "کوردی" : "English"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* لۆگۆ و ناوی پڕۆژە */}
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <Ionicons name="build" size={32} color="#059669" />
            </View>
            <Text style={styles.appTitle}>HomeFix</Text>
            <Text style={[styles.title, { textAlign: alignText }]}>
              {t.loginTitle}
            </Text>
            <Text style={[styles.subtitle, { textAlign: alignText }]}>
              {t.loginSubtitle}
            </Text>
          </View>

          {/* کارتی خێرای کڕیاری تێست (Demo Customer Quick Card) */}
          <View style={styles.demoCard}>
            <View style={[styles.demoCardHeader, flexRowStyle]}>
              <View style={styles.demoBadge}>
                <Text style={styles.demoBadgeText}>
                  {lang === "ckb" ? "ئەکاونتی تێست" : "Demo Account"}
                </Text>
              </View>
              <TouchableOpacity
                onPress={fillDemoCustomer}
                style={[styles.fillButton, flexRowStyle]}
                activeOpacity={0.8}
              >
                <Ionicons name="flash" size={14} color="#059669" />
                <Text style={styles.fillButtonText}>{t.demoCustomerBtn}</Text>
              </TouchableOpacity>
            </View>
            <Text style={[styles.demoCredText, { textAlign: alignText }]}>
              customer@homefix.test  •  customer123
            </Text>
          </View>

          {/* پەیامی هەڵە */}
          {error && (
            <View style={[styles.errorContainer, flexRowStyle]}>
              <Ionicons name="alert-circle" size={18} color="#E11D48" />
              <Text style={[styles.errorText, { textAlign: alignText }]}>
                {error}
              </Text>
            </View>
          )}

          {/* فۆڕم */}
          <View style={styles.form}>
            {/* خانەی ئیمەیڵ */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { textAlign: alignText }]}>
                {t.email}
              </Text>
              <View style={[styles.inputWrapper, flexRowStyle]}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color="#94A3B8"
                  style={isRTL ? { marginLeft: 10 } : { marginRight: 10 }}
                />
                <TextInput
                  style={[styles.input, { textAlign: alignText }]}
                  placeholder="name@example.com"
                  placeholderTextColor="#94A3B8"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (error) setError(null);
                  }}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>

            {/* خانەی پاسۆرد */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { textAlign: alignText }]}>
                {t.password}
              </Text>
              <View style={[styles.inputWrapper, flexRowStyle]}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color="#94A3B8"
                  style={isRTL ? { marginLeft: 10 } : { marginRight: 10 }}
                />
                <TextInput
                  style={[styles.input, { textAlign: alignText }]}
                  placeholder="••••••••"
                  placeholderTextColor="#94A3B8"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (error) setError(null);
                  }}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color="#94A3B8"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* دوگمەی چوونەژوورەوە */}
            <TouchableOpacity
              style={[styles.primaryButton, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <View style={[styles.buttonContent, flexRowStyle]}>
                  <Text style={styles.primaryButtonText}>{t.signIn}</Text>
                  <Ionicons
                    name={isRTL ? "arrow-back" : "arrow-forward"}
                    size={18}
                    color="#FFFFFF"
                    style={isRTL ? { marginRight: 8 } : { marginLeft: 8 }}
                  />
                </View>
              )}
            </TouchableOpacity>

            {/* بەستەری خۆتۆمارکردن */}
            <View style={[styles.footer, flexRowStyle]}>
              <Text style={styles.footerText}>{t.dontHaveAccount} </Text>
              <TouchableOpacity onPress={() => router.push("/register")}>
                <Text style={styles.footerLink}>{t.signUp}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
  },
  topBar: {
    justifyContent: "flex-end",
    alignItems: "center",
    marginBottom: 16,
  },
  langButton: {
    alignItems: "center",
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  langButtonText: {
    color: "#059669",
    fontWeight: "700",
    fontSize: 13,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: "#ECFDF5",
    borderWidth: 1.5,
    borderColor: "#A7F3D0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  appTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1E293B",
    marginTop: 8,
  },
  subtitle: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 4,
    textAlign: "center",
  },
  demoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 14,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  demoCardHeader: {
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  demoBadge: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  demoBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#475569",
  },
  fillButton: {
    alignItems: "center",
    gap: 4,
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  fillButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#059669",
  },
  demoCredText: {
    fontSize: 12,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    color: "#64748B",
    marginTop: 4,
  },
  errorContainer: {
    backgroundColor: "#FFF1F2",
    borderWidth: 1,
    borderColor: "#FECDD3",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    alignItems: "center",
    gap: 8,
  },
  errorText: {
    color: "#BE123C",
    fontSize: 13,
    fontWeight: "500",
    flex: 1,
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
  },
  inputWrapper: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1.2,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 50,
    alignItems: "center",
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: "#0F172A",
    fontWeight: "500",
  },
  primaryButton: {
    backgroundColor: "#059669",
    borderRadius: 14,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    shadowColor: "#059669",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  footer: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
  },
  footerText: {
    fontSize: 13,
    color: "#64748B",
  },
  footerLink: {
    fontSize: 13,
    fontWeight: "700",
    color: "#059669",
  },
});
