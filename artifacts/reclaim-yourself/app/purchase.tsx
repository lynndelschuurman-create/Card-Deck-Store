import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { usePurchase } from "@/context/PurchaseContext";
import { useColors } from "@/hooks/useColors";

const PRICE = "$14.99";

const FEATURES = [
  "All 44 beautifully illustrated cards",
  "Daily card draw with personal reflection",
  "Today's practice + daily affirmation",
  "Full deck browsing",
  "Journaling — write & revisit reflections",
  "Yours forever — one-time purchase",
];

export default function PurchaseScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { purchase } = usePurchase();

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const validateEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());

  const handlePurchase = async () => {
    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address so we can send your receipt and let you restore access later.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    setEmailError("");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1800));
    await purchase(email);
    setLoading(false);
    setDone(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() => router.replace("/(tabs)"), 1600);
  };

  return (
    <LinearGradient
      colors={[colors.background, colors.secondary]}
      style={styles.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={[styles.container, { paddingTop: topPad + 16, paddingBottom: bottomPad + 24 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Text style={[styles.backText, { color: colors.mutedForeground }]}>← Back</Text>
          </Pressable>

          <Image
            source={require("@/assets/images/hero-card.png")}
            style={styles.heroImage}
            contentFit="cover"
          />

          <Text style={[styles.title, { color: colors.foreground }]}>Reclaim & Return</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            A card deck for the woman coming home to herself
          </Text>

          <View style={[styles.priceRow, { borderColor: colors.border }]}>
            <Text style={[styles.price, { color: colors.primary }]}>{PRICE}</Text>
            <Text style={[styles.priceSub, { color: colors.mutedForeground }]}>one-time · lifetime access</Text>
          </View>

          <View style={styles.features}>
            {FEATURES.map((f, i) => (
              <View key={i} style={styles.featureRow}>
                <View style={[styles.featureDot, { backgroundColor: colors.gold }]} />
                <Text style={[styles.featureText, { color: colors.foreground }]}>{f}</Text>
              </View>
            ))}
          </View>

          <Text style={[styles.pullQuote, { color: colors.foreground, borderLeftColor: colors.gold }]}>
            "You are not lost. You are on your way home."
          </Text>

          {done ? (
            <View style={[styles.successBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.successText, { color: colors.primary }]}>Unlocked! Welcome home.</Text>
            </View>
          ) : (
            <View style={styles.purchaseSection}>
              <Text style={[styles.emailLabel, { color: colors.mutedForeground }]}>Your email address</Text>
              <TextInput
                style={[
                  styles.emailInput,
                  {
                    backgroundColor: colors.card,
                    borderColor: emailError ? "#c0392b" : colors.border,
                    color: colors.foreground,
                  },
                ]}
                placeholder="your@email.com"
                placeholderTextColor={colors.mutedForeground}
                value={email}
                onChangeText={(t) => { setEmail(t); setEmailError(""); }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              {emailError ? (
                <Text style={styles.emailError}>{emailError}</Text>
              ) : (
                <Text style={[styles.emailHint, { color: colors.mutedForeground }]}>
                  Used to restore access on any device
                </Text>
              )}

              <Pressable
                style={({ pressed }) => [
                  styles.buyButton,
                  { backgroundColor: colors.primary, opacity: pressed || loading ? 0.8 : 1 },
                ]}
                onPress={handlePurchase}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Text style={styles.buyButtonText}>Purchase for {PRICE}</Text>
                    <Text style={styles.buyButtonSub}>Secure checkout</Text>
                  </>
                )}
              </Pressable>

              <Pressable onPress={() => router.push("/login")} style={styles.loginRow}>
                <Text style={[styles.loginText, { color: colors.mutedForeground }]}>
                  Already purchased?{" "}
                  <Text style={{ color: colors.primary }}>Log in to restore access</Text>
                </Text>
              </Pressable>
            </View>
          )}

          <Text style={[styles.note, { color: colors.mutedForeground }]}>
            Payment integration coming soon. This is a preview of the purchase flow.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  flex: { flex: 1 },
  container: { alignItems: "center", paddingHorizontal: 24 },
  backBtn: { alignSelf: "flex-start", marginBottom: 16 },
  backText: { fontSize: 15 },
  heroImage: { width: 160, height: 240, borderRadius: 16, marginBottom: 24 },
  title: { fontSize: 30, fontFamily: "PlayfairDisplay_700Bold", textAlign: "center", marginBottom: 8 },
  subtitle: { fontSize: 15, textAlign: "center", lineHeight: 22, marginBottom: 24 },
  priceRow: {
    alignItems: "center",
    paddingVertical: 20,
    marginBottom: 24,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    width: "100%",
  },
  price: { fontSize: 40, fontFamily: "PlayfairDisplay_700Bold", letterSpacing: 1 },
  priceSub: { fontSize: 13, marginTop: 4 },
  features: { width: "100%", gap: 14, marginBottom: 28 },
  featureRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  featureDot: { width: 6, height: 6, borderRadius: 3, marginTop: 7 },
  featureText: { fontSize: 15, flex: 1, lineHeight: 22 },
  pullQuote: {
    fontSize: 16,
    fontStyle: "italic",
    lineHeight: 26,
    textAlign: "left",
    width: "100%",
    paddingLeft: 16,
    borderLeftWidth: 3,
    marginBottom: 28,
  },
  purchaseSection: { width: "100%", gap: 10, marginBottom: 16 },
  emailLabel: { fontSize: 12, letterSpacing: 1.2, textTransform: "uppercase" },
  emailInput: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    width: "100%",
  },
  emailError: { color: "#c0392b", fontSize: 13, lineHeight: 20 },
  emailHint: { fontSize: 12 },
  buyButton: {
    width: "100%",
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    gap: 4,
    marginTop: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  buyButtonText: { color: "#fff", fontSize: 18, fontFamily: "PlayfairDisplay_700Bold" },
  buyButtonSub: { color: "rgba(255,255,255,0.75)", fontSize: 12 },
  loginRow: { alignItems: "center", paddingVertical: 4 },
  loginText: { fontSize: 14, textAlign: "center" },
  successBox: { width: "100%", borderRadius: 16, padding: 20, borderWidth: 1, alignItems: "center" },
  successText: { fontSize: 18, fontFamily: "PlayfairDisplay_700Bold" },
  note: { fontSize: 12, textAlign: "center", lineHeight: 18, marginTop: 8 },
});
