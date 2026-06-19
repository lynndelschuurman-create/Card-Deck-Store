import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { usePurchase } from "@/context/PurchaseContext";
import { useColors } from "@/hooks/useColors";

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { login } = usePurchase();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const handleLogin = async () => {
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    setError("");
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const result = await login(email);
    setLoading(false);

    if (result === "verified" || result === "offline") {
      setSuccess(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTimeout(() => router.replace("/(tabs)"), 1400);
    } else {
      setError(
        "We couldn't find a purchase linked to this email. Please check the address or purchase below."
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
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
        <View style={[styles.container, { paddingTop: topPad + 16, paddingBottom: bottomPad + 24 }]}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Text style={[styles.backText, { color: colors.mutedForeground }]}>← Back</Text>
          </Pressable>

          <View style={styles.topSection}>
            <Text style={[styles.title, { color: colors.foreground }]}>Welcome back</Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
              Enter the email you used when you purchased the deck to restore your access.
            </Text>
          </View>

          {success ? (
            <View style={[styles.successBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.successText, { color: colors.primary }]}>Unlocked! Welcome home.</Text>
            </View>
          ) : (
            <View style={styles.form}>
              <Text style={[styles.label, { color: colors.mutedForeground }]}>Email address</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.card,
                    borderColor: error ? "#c0392b" : colors.border,
                    color: colors.foreground,
                  },
                ]}
                placeholder="your@email.com"
                placeholderTextColor={colors.mutedForeground}
                value={email}
                onChangeText={(t) => { setEmail(t); setError(""); }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />

              {error ? (
                <Text style={styles.errorText}>{error}</Text>
              ) : null}

              <Pressable
                style={({ pressed }) => [
                  styles.button,
                  { backgroundColor: colors.primary, opacity: pressed || loading ? 0.8 : 1 },
                ]}
                onPress={handleLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Restore access</Text>
                )}
              </Pressable>

              <View style={[styles.divider, { borderColor: colors.border }]} />

              <Text style={[styles.orText, { color: colors.mutedForeground }]}>
                Don't have the deck yet?
              </Text>
              <Pressable onPress={() => router.replace("/purchase")}>
                <Text style={[styles.purchaseLink, { color: colors.primary }]}>
                  Purchase Reclaim & Return →
                </Text>
              </Pressable>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  flex: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 24 },
  backBtn: { alignSelf: "flex-start", marginBottom: 24 },
  backText: { fontSize: 15 },
  topSection: { marginBottom: 36 },
  title: { fontSize: 30, fontFamily: "PlayfairDisplay_700Bold", marginBottom: 10 },
  subtitle: { fontSize: 15, lineHeight: 24 },
  form: { gap: 14 },
  label: { fontSize: 12, letterSpacing: 1.2, textTransform: "uppercase" },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  errorText: { color: "#c0392b", fontSize: 13, lineHeight: 20 },
  button: {
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    marginTop: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonText: { color: "#fff", fontSize: 17, fontFamily: "PlayfairDisplay_700Bold" },
  divider: { borderTopWidth: 1, marginVertical: 8 },
  orText: { fontSize: 14, textAlign: "center" },
  purchaseLink: { fontSize: 15, fontFamily: "PlayfairDisplay_700Bold", textAlign: "center" },
  successBox: { borderRadius: 16, padding: 24, borderWidth: 1, alignItems: "center" },
  successText: { fontSize: 18, fontFamily: "PlayfairDisplay_700Bold" },
});
