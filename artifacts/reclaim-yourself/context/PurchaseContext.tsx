import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

interface PurchaseContextValue {
  hasPurchased: boolean;
  userEmail: string | null;
  isLoading: boolean;
  login: (email: string) => Promise<"verified" | "not_found" | "offline">;
  logout: () => Promise<void>;
}

const PurchaseContext = createContext<PurchaseContextValue>({
  hasPurchased: false,
  userEmail: null,
  isLoading: true,
  login: async () => "not_found",
  logout: async () => {},
});

const PURCHASED_KEY = "hasPurchased";
const EMAIL_KEY = "purchasedEmail";

function getApiBase(): string {
  if (Platform.OS === "web") {
    return "/api";
  }
  const domain = process.env.EXPO_PUBLIC_API_URL;
  return domain ? domain.replace(/\/$/, "") : "/api";
}

async function verifyEmailWithApi(email: string): Promise<boolean> {
  try {
    const res = await fetch(`${getApiBase()}/purchases/verify?email=${encodeURIComponent(email)}`);
    if (!res.ok) return false;
    const data = (await res.json()) as { purchased: boolean };
    return data.purchased === true;
  } catch {
    return false;
  }
}

export function PurchaseProvider({ children }: { children: React.ReactNode }) {
  const [hasPurchased, setHasPurchased] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [purchased, email] = await Promise.all([
          AsyncStorage.getItem(PURCHASED_KEY),
          AsyncStorage.getItem(EMAIL_KEY),
        ]);
        if (purchased === "true") setHasPurchased(true);
        if (email) setUserEmail(email);
      } catch {}
      setIsLoading(false);
    })();
  }, []);

  const login = useCallback(async (email: string): Promise<"verified" | "not_found" | "offline"> => {
    const trimmed = email.trim().toLowerCase();

    let verified = false;
    try {
      verified = await verifyEmailWithApi(trimmed);
    } catch {
      // Network unavailable — fall back to locally cached state
      const raw = await AsyncStorage.getItem(EMAIL_KEY);
      if (raw === trimmed) {
        setHasPurchased(true);
        setUserEmail(trimmed);
        return "offline";
      }
      return "offline";
    }

    if (verified) {
      await Promise.all([
        AsyncStorage.setItem(PURCHASED_KEY, "true"),
        AsyncStorage.setItem(EMAIL_KEY, trimmed),
      ]);
      setHasPurchased(true);
      setUserEmail(trimmed);
      return "verified";
    }

    return "not_found";
  }, []);

  const logout = useCallback(async () => {
    await Promise.all([
      AsyncStorage.removeItem(PURCHASED_KEY),
      AsyncStorage.removeItem(EMAIL_KEY),
    ]);
    setHasPurchased(false);
    setUserEmail(null);
  }, []);

  return (
    <PurchaseContext.Provider value={{ hasPurchased, userEmail, isLoading, login, logout }}>
      {children}
    </PurchaseContext.Provider>
  );
}

export function usePurchase() {
  return useContext(PurchaseContext);
}
