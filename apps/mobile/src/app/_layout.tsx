import React, { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";
import { LanguageProvider } from "@/lib/LanguageContext";
import { AuthProvider, useAuth } from "@/lib/AuthContext";

function RootNavigation() {
  const { token, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  // بەڕێوەبردنی خۆکارانەی پاراستنی شاشەکان (Auth Guard)
  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "login" || segments[0] === "register";

    if (!token && !inAuthGroup) {
      // ئەگەر لۆگین نەبووبێت، بینێرە بۆ شاشەی لۆگین
      router.replace("/login");
    } else if (token && inAuthGroup) {
      // ئەگەر لۆگین بووبێت و لە شاشەی لۆگین بێت، بینێرە بۆ سەرەکی
      router.replace("/");
    }
  }, [token, isLoading, segments]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#059669" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#F8FAFC" },
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ headerShown: false }} />
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="providers" options={{ headerShown: false }} />
        <Stack.Screen name="book" options={{ headerShown: false }} />
        <Stack.Screen name="bookings" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <RootNavigation />
      </AuthProvider>
    </LanguageProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
});
