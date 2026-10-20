import Constants from "expo-constants";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * ناونیشانی زیرەکی سێرڤەر (Dynamic API URL)
 * بەپێی جۆری ئامێر و شوێنی ڕەنکردن خۆکارانە گونجاوترین IP دەستنیشان دەکات:
 * 1. مۆبایلی ڕاستەقینە لە ڕێگەی Expo Go: ناونیشانی IPی کۆمپیوتەرەکەت وەردەگرێت لە hostUri
 * 2. ئیمولەیتەری ئەندرۆید: بەستنەوە لە ڕێگەی 10.0.2.2:3001
 * 3. وێب یان iOS Simulator: localhost:3001
 */
export const getApiBaseUrl = (): string => {
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
  const token = await AsyncStorage.getItem("customer_token");

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
    // ئەگەر کێشەی هێڵ یان سێرڤەر هەبوو
    if (err.message?.includes("Network request failed") || err.message?.includes("Failed to fetch")) {
      throw new Error(`ناتوانرێت پەیوەندی بە سێرڤەرەوە بکرێت لە (${baseUrl}). تکایە دڵنیابە لە کارکردنی باکئیند.`);
    }
    throw err;
  }
};
