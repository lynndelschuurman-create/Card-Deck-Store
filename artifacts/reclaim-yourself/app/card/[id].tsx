import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { CARDS } from "@/constants/cards";

export default function CardDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const card = CARDS.find((c) => c.id === id);
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  if (!card) return null;

  return (
    <LinearGradient
      colors={[colors.background, colors.secondary]}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={[styles.container, { paddingTop: topPad + 16, paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Text style={[styles.backText, { color: colors.mutedForeground }]}>← Back</Text>
        </Pressable>

        <View style={[styles.cardBadge, { backgroundColor: colors.primary }]}>
          <Text style={styles.cardBadgeText}>Card {CARDS.indexOf(card) + 1} of {CARDS.length}</Text>
        </View>

        <Text style={[styles.title, { color: colors.foreground }]}>{card.title}</Text>
        <Text style={[styles.theme, { color: colors.mutedForeground }]}>{card.theme}</Text>

        <View style={[styles.divider, { backgroundColor: colors.gold }]} />

        <Text style={[styles.message, { color: colors.foreground }]}>{card.message}</Text>

        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Reflection Prompt</Text>
          <Text style={[styles.sectionText, { color: colors.foreground }]}>{card.reflection}</Text>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Today's Practice</Text>
          <Text style={[styles.sectionText, { color: colors.foreground }]}>{card.practice}</Text>
        </View>

        <Text style={[styles.affirmation, { color: colors.foreground, borderLeftColor: colors.gold }]}>
          {card.affirmation}
        </Text>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 24, alignItems: "flex-start" },
  backBtn: { marginBottom: 20 },
  backText: { fontSize: 15 },
  cardBadge: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 16,
  },
  cardBadgeText: { color: "#fff", fontSize: 12, fontWeight: "600" as const },
  title: { fontSize: 32, fontFamily: "PlayfairDisplay_700Bold", lineHeight: 40, marginBottom: 6 },
  theme: { fontSize: 14, letterSpacing: 1, textTransform: "uppercase", marginBottom: 20 },
  divider: { width: 40, height: 2, borderRadius: 2, marginBottom: 20 },
  message: { fontSize: 17, lineHeight: 28, fontStyle: "italic", marginBottom: 28 },
  section: {
    width: "100%",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    marginBottom: 16,
    gap: 8,
  },
  sectionLabel: { fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase" },
  sectionText: { fontSize: 15, lineHeight: 24 },
  affirmation: {
    fontSize: 16,
    fontStyle: "italic",
    lineHeight: 26,
    paddingLeft: 16,
    borderLeftWidth: 3,
    marginTop: 8,
  },
});
