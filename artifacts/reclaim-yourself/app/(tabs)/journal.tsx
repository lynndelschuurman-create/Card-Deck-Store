import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { usePurchase } from "@/context/PurchaseContext";
import { CARDS } from "@/constants/cards";

const STRIPE_URL = "https://buy.stripe.com/7sYdR97dpeBl8Nh4QO7AI00";
const STORAGE_KEY = "journal_entries";

export interface JournalEntry {
  id: string;
  cardId: string;
  text: string;
  createdAt: string;
}

function JournalLocked() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.lockedInner, { paddingTop: topPad + 40, paddingBottom: insets.bottom + 100 }]}>
        <Text style={[styles.lockEmoji]}>📓</Text>
        <Text style={[styles.lockedTitle, { color: colors.foreground }]}>Your journal awaits</Text>
        <Text style={[styles.lockedBody, { color: colors.mutedForeground }]}>
          Journal is a premium feature. Write reflections for every card, revisit your entries, and track your journey home to yourself.
        </Text>
        <View style={[styles.lockedFeatures, { borderLeftColor: colors.gold }]}>
          <Text style={[styles.lockedFeatureText, { color: colors.foreground }]}>
            "Write whatever comes up for you..."
          </Text>
        </View>
        <Pressable
          style={({ pressed }) => [
            styles.lockedBtn,
            { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
          ]}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); Linking.openURL(STRIPE_URL); }}
        >
          <Text style={styles.lockedBtnText}>Unlock Premium Access — $22</Text>
          <Text style={styles.lockedBtnSub}>One-time · lifetime access</Text>
        </Pressable>
        <Pressable onPress={() => router.push("/login")} style={styles.loginLink}>
          <Text style={[styles.loginLinkText, { color: colors.mutedForeground }]}>
            Already purchased?{" "}
            <Text style={{ color: colors.primary }}>Log in to restore access</Text>
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function JournalScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { hasPurchased } = usePurchase();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string>(CARDS[0].id);
  const [draftText, setDraftText] = useState("");
  const [showCardPicker, setShowCardPicker] = useState(false);
  const [view, setView] = useState<"write" | "read">("write");
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (hasPurchased) loadEntries();
  }, [hasPurchased]);

  const loadEntries = async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) setEntries(JSON.parse(raw));
    } catch {}
  };

  const saveEntries = async (updated: JournalEntry[]) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setEntries(updated);
  };

  const handleSave = async () => {
    if (!draftText.trim()) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const entry: JournalEntry = {
      id: Date.now().toString(),
      cardId: selectedCardId,
      text: draftText.trim(),
      createdAt: new Date().toISOString(),
    };
    const updated = [entry, ...entries];
    await saveEntries(updated);
    setDraftText("");
    setView("read");
  };

  const handleDelete = (id: string) => {
    Alert.alert("Delete entry", "Are you sure you want to delete this reflection?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const updated = entries.filter((e) => e.id !== id);
          await saveEntries(updated);
        },
      },
    ]);
  };

  if (!hasPurchased) return <JournalLocked />;

  const selectedCard = CARDS.find((c) => c.id === selectedCardId);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={[styles.inner, { paddingTop: topPad + 16, paddingBottom: insets.bottom + 100 }]}>
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: colors.foreground }]}>Journal</Text>
          <View style={[styles.toggle, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
            <Pressable
              style={[styles.toggleBtn, view === "write" && { backgroundColor: colors.primary }]}
              onPress={() => setView("write")}
            >
              <Text style={[styles.toggleText, { color: view === "write" ? "#fff" : colors.mutedForeground }]}>Write</Text>
            </Pressable>
            <Pressable
              style={[styles.toggleBtn, view === "read" && { backgroundColor: colors.primary }]}
              onPress={() => setView("read")}
            >
              <Text style={[styles.toggleText, { color: view === "read" ? "#fff" : colors.mutedForeground }]}>
                Entries {entries.length > 0 ? `(${entries.length})` : ""}
              </Text>
            </Pressable>
          </View>
        </View>

        {view === "write" ? (
          <View style={styles.writeArea}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>Which card are you reflecting on?</Text>
            <Pressable
              style={[styles.cardPicker, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => setShowCardPicker(!showCardPicker)}
            >
              <View>
                <Text style={[styles.cardPickerTitle, { color: colors.foreground }]}>{selectedCard?.title}</Text>
                <Text style={[styles.cardPickerTheme, { color: colors.mutedForeground }]}>{selectedCard?.theme}</Text>
              </View>
              <Text style={[styles.chevron, { color: colors.mutedForeground }]}>{showCardPicker ? "▲" : "▼"}</Text>
            </Pressable>

            {showCardPicker && (
              <View style={[styles.pickerDropdown, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <FlatList
                  data={CARDS}
                  keyExtractor={(item) => item.id}
                  style={{ maxHeight: 200 }}
                  showsVerticalScrollIndicator={false}
                  renderItem={({ item }) => (
                    <Pressable
                      style={[
                        styles.pickerItem,
                        item.id === selectedCardId && { backgroundColor: colors.secondary },
                      ]}
                      onPress={() => {
                        setSelectedCardId(item.id);
                        setShowCardPicker(false);
                      }}
                    >
                      <Text style={[styles.pickerItemTitle, { color: colors.foreground }]}>{item.title}</Text>
                      <Text style={[styles.pickerItemTheme, { color: colors.mutedForeground }]}>{item.theme}</Text>
                    </Pressable>
                  )}
                />
              </View>
            )}

            {selectedCard && (
              <View style={[styles.promptBox, { borderLeftColor: colors.gold }]}>
                <Text style={[styles.promptLabel, { color: colors.mutedForeground }]}>Reflection prompt</Text>
                <Text style={[styles.promptText, { color: colors.foreground }]}>{selectedCard.reflection}</Text>
              </View>
            )}

            <TextInput
              ref={inputRef}
              style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
              placeholder="Write whatever comes up for you..."
              placeholderTextColor={colors.mutedForeground}
              multiline
              value={draftText}
              onChangeText={setDraftText}
              textAlignVertical="top"
            />

            <Pressable
              style={({ pressed }) => [
                styles.saveBtn,
                { backgroundColor: draftText.trim() ? colors.primary : colors.muted, opacity: pressed ? 0.85 : 1 },
              ]}
              onPress={handleSave}
              disabled={!draftText.trim()}
            >
              <Text style={[styles.saveBtnText, { color: draftText.trim() ? "#fff" : colors.mutedForeground }]}>
                Save reflection
              </Text>
            </Pressable>
          </View>
        ) : (
          <View style={{ flex: 1 }}>
            {entries.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No reflections yet</Text>
                <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                  Draw a card and write what comes up for you. Your words are for you alone.
                </Text>
                <Pressable onPress={() => setView("write")}>
                  <Text style={[styles.emptyLink, { color: colors.primary }]}>Write your first reflection</Text>
                </Pressable>
              </View>
            ) : (
              <FlatList
                data={entries}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ gap: 14, paddingBottom: 20 }}
                renderItem={({ item }) => {
                  const card = CARDS.find((c) => c.id === item.cardId);
                  return (
                    <View style={[styles.entryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                      <View style={styles.entryHeader}>
                        <View>
                          <Text style={[styles.entryCardTitle, { color: colors.primary }]}>{card?.title}</Text>
                          <Text style={[styles.entryDate, { color: colors.mutedForeground }]}>{formatDate(item.createdAt)}</Text>
                        </View>
                        <Pressable onPress={() => handleDelete(item.id)} hitSlop={12}>
                          <Text style={[styles.deleteBtn, { color: colors.mutedForeground }]}>✕</Text>
                        </Pressable>
                      </View>
                      <View style={[styles.entryDivider, { backgroundColor: colors.gold }]} />
                      <Text style={[styles.entryText, { color: colors.foreground }]}>{item.text}</Text>
                    </View>
                  );
                }}
              />
            )}
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1, paddingHorizontal: 20 },
  lockedInner: {
    flex: 1,
    paddingHorizontal: 28,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  lockEmoji: { fontSize: 48, marginBottom: 4 },
  lockedTitle: { fontSize: 26, fontFamily: "PlayfairDisplay_700Bold", textAlign: "center" },
  lockedBody: { fontSize: 15, lineHeight: 24, textAlign: "center" },
  lockedFeatures: { paddingLeft: 16, borderLeftWidth: 3, alignSelf: "stretch" },
  lockedFeatureText: { fontSize: 15, fontStyle: "italic", lineHeight: 24 },
  lockedBtn: {
    alignSelf: "stretch",
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    gap: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 5,
  },
  lockedBtnText: { color: "#fff", fontSize: 17, fontFamily: "PlayfairDisplay_700Bold" },
  lockedBtnSub: { color: "rgba(255,255,255,0.75)", fontSize: 12 },
  loginLink: { marginTop: 4 },
  loginLinkText: { fontSize: 14, textAlign: "center" },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
  title: { fontSize: 28, fontFamily: "PlayfairDisplay_700Bold" },
  toggle: { flexDirection: "row", borderRadius: 10, borderWidth: 1, overflow: "hidden" },
  toggleBtn: { paddingVertical: 7, paddingHorizontal: 14, borderRadius: 9 },
  toggleText: { fontSize: 13, fontWeight: "600" as const },
  writeArea: { flex: 1, gap: 14 },
  label: { fontSize: 12, letterSpacing: 1.2, textTransform: "uppercase" },
  cardPicker: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  cardPickerTitle: { fontSize: 16, fontFamily: "PlayfairDisplay_700Bold" },
  cardPickerTheme: { fontSize: 12, marginTop: 2 },
  chevron: { fontSize: 12 },
  pickerDropdown: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
    marginTop: -8,
  },
  pickerItem: { paddingVertical: 10, paddingHorizontal: 14 },
  pickerItemTitle: { fontSize: 15, fontWeight: "600" as const },
  pickerItemTheme: { fontSize: 12, marginTop: 1 },
  promptBox: { paddingLeft: 14, borderLeftWidth: 3, gap: 4 },
  promptLabel: { fontSize: 11, letterSpacing: 1.2, textTransform: "uppercase" },
  promptText: { fontSize: 14, lineHeight: 22, fontStyle: "italic" },
  input: {
    flex: 1,
    minHeight: 160,
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    fontSize: 15,
    lineHeight: 24,
  },
  saveBtn: { borderRadius: 14, paddingVertical: 16, alignItems: "center" },
  saveBtnText: { fontSize: 16, fontFamily: "PlayfairDisplay_700Bold" },
  emptyState: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10, paddingHorizontal: 20 },
  emptyTitle: { fontSize: 20, fontFamily: "PlayfairDisplay_700Bold" },
  emptyText: { fontSize: 14, lineHeight: 22, textAlign: "center" },
  emptyLink: { fontSize: 15, fontFamily: "PlayfairDisplay_700Bold", marginTop: 8 },
  entryCard: { borderRadius: 16, padding: 18, borderWidth: 1, gap: 10 },
  entryHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  entryCardTitle: { fontSize: 16, fontFamily: "PlayfairDisplay_700Bold" },
  entryDate: { fontSize: 12, marginTop: 2 },
  deleteBtn: { fontSize: 16, paddingLeft: 8 },
  entryDivider: { height: 1.5, width: 32, borderRadius: 2 },
  entryText: { fontSize: 15, lineHeight: 24 },
});
