import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { CARDS } from "@/constants/cards";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH * 0.78;
const CARD_HEIGHT = CARD_WIDTH * 1.5;

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const router = useRouter();

  const [revealed, setRevealed] = useState(false);
  const [todayCard, setTodayCard] = useState<(typeof CARDS)[0] | null>(null);
  const [cardIndex, setCardIndex] = useState(0);
  const [hasPurchased, setHasPurchased] = useState(false);

  const flipAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadTodayCard();
    loadPurchaseStatus();
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const loadPurchaseStatus = async () => {
    const val = await AsyncStorage.getItem("hasPurchased");
    if (val === "true") setHasPurchased(true);
  };

  const loadTodayCard = async () => {
    const today = new Date().toDateString();
    const stored = await AsyncStorage.getItem("todayCard");
    const storedDate = await AsyncStorage.getItem("todayCardDate");

    if (stored && storedDate === today) {
      const card = JSON.parse(stored);
      setTodayCard(card);
      const idx = CARDS.findIndex((c) => c.id === card.id);
      setCardIndex(idx >= 0 ? idx : 0);
    } else {
      const randomIdx = Math.floor(Math.random() * CARDS.length);
      const card = CARDS[randomIdx];
      setCardIndex(randomIdx);
      setTodayCard(card);
      await AsyncStorage.setItem("todayCard", JSON.stringify(card));
      await AsyncStorage.setItem("todayCardDate", today);
    }
  };

  const flipCard = () => {
    if (!hasPurchased && cardIndex > 2) {
      router.push("/purchase");
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1.04, useNativeDriver: true, friction: 6 }),
    ]).start();
    Animated.timing(flipAnim, {
      toValue: revealed ? 0 : 1,
      duration: 600,
      useNativeDriver: true,
    }).start(() => {
      setRevealed(!revealed);
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, friction: 6 }).start();
    });
  };

  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });
  const backInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["180deg", "360deg"],
  });

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: topPad + 16, paddingBottom: insets.bottom + 100 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={[styles.greeting, { color: colors.mutedForeground }]}>
          {getGreeting()}
        </Text>
        <Text style={[styles.title, { color: colors.foreground }]}>Your Daily Card</Text>
        <Text style={[styles.date, { color: colors.mutedForeground }]}>
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </Text>
      </View>

      <View style={styles.cardContainer}>
        <Animated.View style={[styles.glowRing, { opacity: glowOpacity, borderColor: colors.gold }]} />

        <Pressable onPress={flipCard}>
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <Animated.View
              style={[styles.card, { transform: [{ rotateY: frontInterpolate }] }, !revealed ? {} : styles.hidden]}
            >
              <LinearGradient
                colors={isDark ? ["#3d1c3e", "#2d1b2e"] : ["#f5e6ea", "#fdf0f4"]}
                style={styles.cardFront}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Image
                  source={require("@/assets/images/hero-card.png")}
                  style={styles.cardBackImage}
                  contentFit="cover"
                />
                <LinearGradient
                  colors={["transparent", isDark ? "rgba(30,15,31,0.85)" : "rgba(253,246,240,0.85)"]}
                  style={styles.cardOverlay}
                >
                  <Text style={[styles.tapHint, { color: colors.mutedForeground }]}>Tap to reveal</Text>
                </LinearGradient>
              </LinearGradient>
            </Animated.View>

            <Animated.View
              style={[styles.card, { transform: [{ rotateY: backInterpolate }] }, revealed ? {} : styles.hidden]}
            >
              <LinearGradient
                colors={isDark ? ["#2d1b2e", "#1e0f1f"] : ["#fff5f0", "#fdf6f0"]}
                style={styles.cardBack}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={[styles.cardAccentLine, { backgroundColor: colors.gold }]} />
                {todayCard && (
                  <>
                    <Text style={[styles.cardNumber, { color: colors.mutedForeground }]}>
                      {String(cardIndex + 1).padStart(2, "0")} / {CARDS.length}
                    </Text>
                    <Text style={[styles.cardTitle, { color: colors.foreground }]}>{todayCard.title}</Text>
                    <View style={[styles.cardDivider, { backgroundColor: colors.gold }]} />
                    <Text style={[styles.cardMessage, { color: colors.foreground }]}>{todayCard.message}</Text>
                    <Text style={[styles.cardPrompt, { color: colors.mutedForeground }]}>{todayCard.prompt}</Text>
                  </>
                )}
                <View style={[styles.cardAccentLine, { backgroundColor: colors.gold }]} />
              </LinearGradient>
            </Animated.View>
          </Animated.View>
        </Pressable>
      </View>

      {revealed && todayCard && (
        <View style={[styles.reflectionBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.reflectionLabel, { color: colors.mutedForeground }]}>Reflection prompt</Text>
          <Text style={[styles.reflectionText, { color: colors.foreground }]}>{todayCard.reflection}</Text>
        </View>
      )}

      {!hasPurchased && (
        <Pressable
          style={({ pressed }) => [styles.purchasePrompt, { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 }]}
          onPress={() => router.push("/purchase")}
        >
          <Text style={[styles.purchasePromptText, { color: colors.primaryForeground }]}>
            Unlock All 44 Cards
          </Text>
          <Text style={[styles.purchasePromptSub, { color: "rgba(255,255,255,0.75)" }]}>
            3 preview cards available free
          </Text>
        </Pressable>
      )}
    </ScrollView>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { alignItems: "center", paddingHorizontal: 20 },
  header: { alignItems: "center", marginBottom: 32 },
  greeting: { fontSize: 14, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 },
  title: { fontSize: 28, fontFamily: "PlayfairDisplay_700Bold", letterSpacing: 0.5, marginBottom: 4 },
  date: { fontSize: 14 },
  cardContainer: { alignItems: "center", marginBottom: 28 },
  glowRing: {
    position: "absolute",
    width: CARD_WIDTH + 24,
    height: CARD_HEIGHT + 24,
    borderRadius: 24,
    borderWidth: 1.5,
    zIndex: 0,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backfaceVisibility: "hidden",
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  hidden: { position: "absolute", top: 0, left: 0 },
  cardFront: { flex: 1, justifyContent: "flex-end" },
  cardBack: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 28,
    gap: 12,
  },
  cardBackImage: { ...StyleSheet.absoluteFillObject },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 24,
  },
  tapHint: { fontSize: 13, letterSpacing: 1.5, textTransform: "uppercase" },
  cardAccentLine: { width: 40, height: 2, borderRadius: 2, marginVertical: 4 },
  cardNumber: { fontSize: 11, letterSpacing: 2, textTransform: "uppercase" },
  cardTitle: {
    fontSize: 22,
    fontFamily: "PlayfairDisplay_700Bold",
    textAlign: "center",
    letterSpacing: 0.3,
  },
  cardDivider: { width: 32, height: 1, marginVertical: 4 },
  cardMessage: {
    fontSize: 15,
    lineHeight: 24,
    textAlign: "center",
    fontStyle: "italic",
  },
  cardPrompt: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
    letterSpacing: 0.2,
    marginTop: 4,
  },
  reflectionBox: {
    width: "100%",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    marginBottom: 20,
  },
  reflectionLabel: { fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8 },
  reflectionText: { fontSize: 15, lineHeight: 24, fontStyle: "italic" },
  purchasePrompt: {
    width: "100%",
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 24,
    alignItems: "center",
    gap: 4,
  },
  purchasePromptText: { fontSize: 16, fontFamily: "PlayfairDisplay_700Bold", letterSpacing: 0.3 },
  purchasePromptSub: { fontSize: 13 },
});
