import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

interface PurchaseContextValue {
  hasPurchased: boolean;
  userEmail: string | null;
  isLoading: boolean;
  purchase: (email: string) => Promise<void>;
  login: (email: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const PurchaseContext = createContext<PurchaseContextValue>({
  hasPurchased: false,
  userEmail: null,
  isLoading: true,
  purchase: async () => {},
  login: async () => false,
  logout: async () => {},
});

const PURCHASED_KEY = "hasPurchased";
const EMAIL_KEY = "purchasedEmail";
const EMAILS_LIST_KEY = "purchasedEmailsList";

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

  const purchase = useCallback(async (email: string) => {
    const trimmed = email.trim().toLowerCase();
    const raw = await AsyncStorage.getItem(EMAILS_LIST_KEY);
    const existing: string[] = raw ? JSON.parse(raw) : [];
    if (!existing.includes(trimmed)) {
      existing.push(trimmed);
    }
    await Promise.all([
      AsyncStorage.setItem(PURCHASED_KEY, "true"),
      AsyncStorage.setItem(EMAIL_KEY, trimmed),
      AsyncStorage.setItem(EMAILS_LIST_KEY, JSON.stringify(existing)),
    ]);
    setHasPurchased(true);
    setUserEmail(trimmed);
  }, []);

  const login = useCallback(async (email: string): Promise<boolean> => {
    const trimmed = email.trim().toLowerCase();
    const raw = await AsyncStorage.getItem(EMAILS_LIST_KEY);
    const existing: string[] = raw ? JSON.parse(raw) : [];
    if (existing.includes(trimmed)) {
      await Promise.all([
        AsyncStorage.setItem(PURCHASED_KEY, "true"),
        AsyncStorage.setItem(EMAIL_KEY, trimmed),
      ]);
      setHasPurchased(true);
      setUserEmail(trimmed);
      return true;
    }
    return false;
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
    <PurchaseContext.Provider value={{ hasPurchased, userEmail, isLoading, purchase, login, logout }}>
      {children}
    </PurchaseContext.Provider>
  );
}

export function usePurchase() {
  return useContext(PurchaseContext);
}
