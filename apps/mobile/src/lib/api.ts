import Constants from "expo-constants";
import { Platform } from "react-native";
import safeStorage from "./storage";

// Resolve API host: browser hostname on web, Expo hostUri on native, or local fallbacks
export const getApiBaseUrl = (): string => {
  if (typeof window !== "undefined" && window.location?.hostname) {
    return `http://${window.location.hostname}:3001/api/v1`;
  }

  const hostUri = Constants.expoConfig?.hostUri;

  if (hostUri) {
    const host = hostUri.split(":")[0];
    return `http://${host}:3001/api/v1`;
  }

  if (Platform.OS === "android") {
    return "http://10.0.2.2:3001/api/v1";
  }

  return "http://localhost:3001/api/v1";
};

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

export const apiFetch = async <T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  const baseUrl = getApiBaseUrl();
  const token = await safeStorage.getItem("customer_token");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = `${baseUrl}${cleanEndpoint}`;

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    const rawText = await res.text();
    let data: any = {};

    try {
      data = rawText ? JSON.parse(rawText) : {};
    } catch {
      data = { message: rawText || "Server error occurred" };
    }

    if (!res.ok) {
      throw new Error(data.message || data.error || `HTTP ${res.status}: Failed`);
    }

    return data;
  } catch (err: any) {
    if (err.message?.includes("Network request failed") || err.message?.includes("Failed to fetch")) {
      throw new Error(`ناتوانرێت پەیوەندی بە سێرڤەرەوە بکرێت لە (${baseUrl}). تکایە دڵنیابە لە کارکردنی باکئیند.`);
    }
    throw err;
  }
};
