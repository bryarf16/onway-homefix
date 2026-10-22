import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// In-memory fallback map to maintain state if AsyncStorage or native modules are null / fail
const memoryStorage = new Map<string, string>();
let useMemoryFallbackOnly = false;

const isWeb = Platform.OS === "web";

export const safeStorage = {
  async getItem(key: string): Promise<string | null> {
    if (isWeb) {
      try {
        if (typeof window !== "undefined" && window.localStorage) {
          const val = window.localStorage.getItem(key);
          if (val !== null) {
            memoryStorage.set(key, val);
          }
          return val ?? memoryStorage.get(key) ?? null;
        }
      } catch {
        return memoryStorage.get(key) ?? null;
      }
    }

    if (useMemoryFallbackOnly || !AsyncStorage || typeof AsyncStorage.getItem !== "function") {
      return memoryStorage.get(key) ?? null;
    }

    try {
      const value = await AsyncStorage.getItem(key);
      if (value !== null) {
        memoryStorage.set(key, value);
      }
      return value ?? memoryStorage.get(key) ?? null;
    } catch {
      // Native module is null or legacy storage error: switch silently to in-memory fallback
      useMemoryFallbackOnly = true;
      return memoryStorage.get(key) ?? null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    memoryStorage.set(key, value);

    if (isWeb) {
      try {
        if (typeof window !== "undefined" && window.localStorage) {
          window.localStorage.setItem(key, value);
        }
      } catch {
        // Silently handled by in-memory storage
      }
      return;
    }

    if (useMemoryFallbackOnly || !AsyncStorage || typeof AsyncStorage.setItem !== "function") {
      return;
    }

    try {
      await AsyncStorage.setItem(key, value);
    } catch {
      useMemoryFallbackOnly = true;
    }
  },

  async removeItem(key: string): Promise<void> {
    memoryStorage.delete(key);

    if (isWeb) {
      try {
        if (typeof window !== "undefined" && window.localStorage) {
          window.localStorage.removeItem(key);
        }
      } catch {
        // Silently handled
      }
      return;
    }

    if (useMemoryFallbackOnly || !AsyncStorage || typeof AsyncStorage.removeItem !== "function") {
      return;
    }

    try {
      await AsyncStorage.removeItem(key);
    } catch {
      useMemoryFallbackOnly = true;
    }
  },

  async clear(): Promise<void> {
    memoryStorage.clear();

    if (isWeb) {
      try {
        if (typeof window !== "undefined" && window.localStorage) {
          window.localStorage.clear();
        }
      } catch {
        // Silently handled
      }
      return;
    }

    if (useMemoryFallbackOnly || !AsyncStorage || typeof AsyncStorage.clear !== "function") {
      return;
    }

    try {
      await AsyncStorage.clear();
    } catch {
      useMemoryFallbackOnly = true;
    }
  },
};

export const getItem = safeStorage.getItem;
export const setItem = safeStorage.setItem;
export const removeItem = safeStorage.removeItem;
export const clear = safeStorage.clear;

export default safeStorage;
