import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

const PRICE = "$14.99";

const FEATURES = [
  "44 beautifully illustrated cards",
  "Daily card draw with personal reflection",
  "Full deck browsing",
  "Deep-dive prompts for each card",
  "Yours forever — one-time purchase",
];

export default function PurchaseScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const handlePurchase = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1800));
    await AsyncStorage.setItem("hasPurchased", "true");
    setLoading(false);
    setDone(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() => router.back(), 1500);
  };

  return (
    <LinearGradient
      colors={[colors.background, colors.secondary]}
      style={styles.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      <ScrollView
        contentContainerStyle={[styles.container, { paddingTop: topPad + 16, paddingBottom: bottomPad + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <Pressable style={[styles.backBtn]} onPress={() => router.back()}>
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
        )}

        <Text style={[styles.note, { color: colors.mutedForeground }]}>
          Payment integration coming soon. This is a preview of the purchase flow.
        </Text>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
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
    marginBottom: 32,
  },
  buyButton: {
    width: "100%",
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    gap: 4,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  buyButtonText: { color: "#fff", fontSize: 18, fontFamily: "PlayfairDisplay_700Bold" },
  buyButtonSub: { color: "rgba(255,255,255,0.75)", fontSize: 12 },
  successBox: { width: "100%", borderRadius: 16, padding: 20, borderWidth: 1, alignItems: "center" },
  successText: { fontSize: 18, fontFamily: "PlayfairDisplay_700Bold" },
  note: { fontSize: 12, textAlign: "center", lineHeight: 18 },
});
