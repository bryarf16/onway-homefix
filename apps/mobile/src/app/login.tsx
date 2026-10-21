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

          <TouchableOpacity
            onPress={fillDemoCustomer}
            style={[styles.demoPill, flexRowStyle]}
            activeOpacity={0.7}
          >
            <Ionicons name="sparkles-outline" size={14} color="#059669" />
            <Text style={styles.demoPillText}>
              {lang === "ckb" ? "پڕکردنەوەی ئەکاونتی تێست" : "Auto-fill Demo Account"}
            </Text>
          </TouchableOpacity>

          {error && (
            <View style={[styles.errorContainer, flexRowStyle]}>
              <Ionicons name="alert-circle" size={18} color="#E11D48" />
              <Text style={[styles.errorText, { textAlign: alignText }]}>
                {error}
              </Text>
            </View>
          )}

          <View style={styles.form}>
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
  demoPill: {
    alignSelf: "center",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#DCFCE7",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    marginBottom: 20,
  },
  demoPillText: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#059669",
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
    height: "100%",
    fontSize: 14.5,
    color: "#0F172A",
    fontWeight: "500",
    padding: 0,
    outlineStyle: "none" as any,
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
