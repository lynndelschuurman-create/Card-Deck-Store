import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
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
  const hasPurchased = true;

  const [revealed, setRevealed] = useState(false);
  const [currentCard, setCurrentCard] = useState<(typeof CARDS)[0]>(CARDS[0]);
  const [cardIndex, setCardIndex] = useState(0);

  const flipAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    drawNewCard();
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const drawNewCard = () => {
    const randomIdx = Math.floor(Math.random() * CARDS.length);
    setCardIndex(randomIdx);
    setCurrentCard(CARDS[randomIdx]);
  };

  const resetCard = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.timing(flipAnim, {
      toValue: 0,
      duration: 400,
      useNativeDriver: true,
    }).start(() => {
      setRevealed(false);
      drawNewCard();
    });
  };

  const flipCard = () => {
    if (!hasPurchased && cardIndex > 2) {
      router.push("/purchase");
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.spring(scaleAnim, { toValue: 1.04, useNativeDriver: true, friction: 6 }).start();
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
        <Text style={[styles.title, { color: colors.foreground }]}>Reclaim & Return</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          When you feel ready, tap the card
        </Text>
      </View>

      <View style={styles.cardContainer}>
        <Animated.View style={[styles.glowRing, { opacity: glowOpacity, borderColor: colors.gold }]} />

        <Pressable onPress={flipCard}>
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <Animated.View
              style={[styles.card, { transform: [{ rotateY: frontInterpolate }] }, !revealed ? {} : styles.hidden]}
            >
              <View style={styles.cardFront}>
                <Image
                  source={require("@/assets/images/hero-card.png")}
                  style={styles.cardBackImage}
                  contentFit="cover"
                />
                <View style={styles.cardOverlay}>
                  <Text style={[styles.tapHint, { color: "#fff" }]}>Tap to draw</Text>
                </View>
              </View>
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
                <Text style={[styles.cardNumber, { color: colors.mutedForeground }]}>
                  {String(cardIndex + 1).padStart(2, "0")} / {CARDS.length}
                </Text>
                <Text style={[styles.cardTitle, { color: colors.foreground }]}>{currentCard.title}</Text>
                <View style={[styles.cardDivider, { backgroundColor: colors.gold }]} />
                <Text style={[styles.cardMessage, { color: colors.foreground }]}>{currentCard.message}</Text>
                <Text style={[styles.cardPrompt, { color: colors.mutedForeground }]}>{currentCard.prompt}</Text>
                <View style={[styles.cardAccentLine, { backgroundColor: colors.gold }]} />
              </LinearGradient>
            </Animated.View>
          </Animated.View>
        </Pressable>
      </View>

      {revealed && (
        <>
          <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Reflection prompt</Text>
            <Text style={[styles.sectionText, { color: colors.foreground }]}>{currentCard.reflection}</Text>
          </View>

          <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Today's practice</Text>
            <Text style={[styles.sectionText, { color: colors.foreground }]}>{currentCard.practice}</Text>
          </View>

          <View style={[styles.affirmationBox, { borderLeftColor: colors.gold }]}>
            <Text style={[styles.affirmationText, { color: colors.foreground }]}>{currentCard.affirmation}</Text>
          </View>

          <Pressable
            style={({ pressed }) => [styles.drawAgain, { borderColor: colors.primary, opacity: pressed ? 0.7 : 1 }]}
            onPress={resetCard}
          >
            <Text style={[styles.drawAgainText, { color: colors.primary }]}>Draw another card</Text>
          </Pressable>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { alignItems: "center", paddingHorizontal: 20 },
  header: { alignItems: "center", marginBottom: 32 },
  title: { fontSize: 28, fontFamily: "PlayfairDisplay_700Bold", letterSpacing: 0.5, marginBottom: 6, textAlign: "center" },
  subtitle: { fontSize: 14, textAlign: "center", lineHeight: 20 },
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
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
    backgroundColor: "rgba(0,0,0,0.28)",
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
  section: {
    width: "100%",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    marginBottom: 16,
    gap: 8,
  },
  sectionLabel: { fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase" },
  sectionText: { fontSize: 15, lineHeight: 24, fontStyle: "italic" },
  affirmationBox: {
    width: "100%",
    paddingLeft: 16,
    borderLeftWidth: 3,
    marginBottom: 24,
  },
  affirmationText: { fontSize: 16, lineHeight: 26, fontStyle: "italic" },
  drawAgain: {
    borderWidth: 1.5,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 32,
    marginBottom: 8,
  },
  drawAgainText: { fontSize: 15, fontFamily: "PlayfairDisplay_700Bold", letterSpacing: 0.3 },
});
