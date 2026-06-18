import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import {
  FlatList,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { usePurchase } from "@/context/PurchaseContext";
import { CARDS } from "@/constants/cards";

const STRIPE_URL = "https://buy.stripe.com/7sYdR97dpeBl8Nh4QO7AI00";
const FREE_COUNT = 3;

export default function DeckScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { hasPurchased } = usePurchase();

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const renderCard = ({ item, index }: { item: (typeof CARDS)[0]; index: number }) => {
    const locked = !hasPurchased && index >= FREE_COUNT;
    return (
      <Pressable
        style={({ pressed }) => [
          styles.cardItem,
          { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.85 : 1 },
        ]}
        onPress={() => {
          if (locked) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            Linking.openURL(STRIPE_URL);
          } else {
            Haptics.selectionAsync();
            router.push({ pathname: "/card/[id]", params: { id: item.id } });
          }
        }}
      >
        <LinearGradient
          colors={locked ? ["#c9c9c9", "#b0b0b0"] : [colors.primary, colors.accent]}
          style={styles.cardNumber}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.cardNumberText}>{String(index + 1).padStart(2, "0")}</Text>
        </LinearGradient>
        <View style={styles.cardInfo}>
          <Text
            style={[styles.cardTitle, { color: locked ? colors.mutedForeground : colors.foreground }]}
            numberOfLines={1}
          >
            {locked ? "Locked" : item.title}
          </Text>
          <Text style={[styles.cardSub, { color: colors.mutedForeground }]} numberOfLines={2}>
            {locked ? "Purchase to unlock all 44 cards" : item.theme}
          </Text>
        </View>
        {locked && <Text style={[styles.lockIcon, { color: colors.mutedForeground }]}>🔒</Text>}
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={CARDS}
        keyExtractor={(item) => item.id}
        renderItem={renderCard}
        contentContainerStyle={{
          paddingTop: topPad + 16,
          paddingBottom: insets.bottom + 100,
          paddingHorizontal: 20,
          gap: 12,
        }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={[styles.headerTitle, { color: colors.foreground }]}>The Deck</Text>
            <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>
              {hasPurchased
                ? "44 cards for coming home to yourself"
                : `${FREE_COUNT} free cards · purchase to unlock all 44`}
            </Text>
            {!hasPurchased && (
              <Pressable
                style={({ pressed }) => [styles.unlockBanner, { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 }]}
                onPress={() => { Haptics.selectionAsync(); Linking.openURL(STRIPE_URL); }}
              >
                <Text style={styles.unlockBannerText}>
                  ✨ Unlock Premium Access — $14.99
                </Text>
                <Text style={styles.unlockBannerSub}>
                  All 44 cards · one-time · lifetime access
                </Text>
              </Pressable>
            )}
          </View>
        }
        scrollEnabled={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { marginBottom: 20, gap: 4 },
  headerTitle: { fontSize: 28, fontFamily: "PlayfairDisplay_700Bold", marginBottom: 4 },
  headerSub: { fontSize: 14, lineHeight: 20 },
  unlockBanner: {
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    gap: 4,
  },
  unlockBannerText: { fontSize: 15, fontFamily: "PlayfairDisplay_700Bold", color: "#fff" },
  unlockBannerSub: { fontSize: 12, color: "rgba(255,255,255,0.8)" },
  cardItem: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    gap: 14,
  },
  cardNumber: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  cardNumberText: { color: "#fff", fontSize: 13, fontWeight: "700" as const },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: "600" as const, marginBottom: 3, fontFamily: "PlayfairDisplay_700Bold" },
  cardSub: { fontSize: 13, lineHeight: 18 },
  lockIcon: { fontSize: 18 },
});
