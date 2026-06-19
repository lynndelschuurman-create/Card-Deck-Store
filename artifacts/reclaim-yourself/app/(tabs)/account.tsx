import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { usePurchase } from "@/context/PurchaseContext";

const STRIPE_URL = "https://buy.stripe.com/7sYdR97dpeBl8Nh4QO7AI00";

export default function AccountScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { hasPurchased, userEmail, logout } = usePurchase();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const handleLogout = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    await logout();
  };

  return (
    <LinearGradient
      colors={[colors.background, colors.secondary]}
      style={styles.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingTop: topPad + 24, paddingBottom: bottomPad + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.heading, { color: colors.foreground }]}>Account</Text>

        {hasPurchased ? (
          <>
            {/* Premium badge */}
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.gold }]}>
              <View style={[styles.premiumBadge, { backgroundColor: colors.gold }]}>
                <Text style={styles.premiumBadgeText}>✦ Premium</Text>
              </View>
              <Text style={[styles.cardTitle, { color: colors.foreground }]}>
                Full access unlocked
              </Text>
              <Text style={[styles.cardBody, { color: colors.mutedForeground }]}>
                All 44 cards, daily draws, journaling, and practices — yours forever.
              </Text>
            </View>

            {/* Email row */}
            {userEmail ? (
              <View style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.rowLeft}>
                  <Text style={[styles.rowLabel, { color: colors.mutedForeground }]}>Signed in as</Text>
                  <Text style={[styles.rowValue, { color: colors.foreground }]} numberOfLines={1}>
                    {userEmail}
                  </Text>
                </View>
              </View>
            ) : null}

            {/* Log out */}
            <Pressable
              style={({ pressed }) => [
                styles.logoutBtn,
                { borderColor: colors.border, opacity: pressed ? 0.7 : 1 },
              ]}
              onPress={handleLogout}
            >
              <Text style={[styles.logoutText, { color: colors.mutedForeground }]}>Log out</Text>
            </Pressable>

            <Text style={[styles.hint, { color: colors.mutedForeground }]}>
              Logging out won't cancel your purchase. You can restore access anytime with your email.
            </Text>
          </>
        ) : (
          <>
            {/* Free tier state */}
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.cardTitle, { color: colors.foreground }]}>Free access</Text>
              <Text style={[styles.cardBody, { color: colors.mutedForeground }]}>
                You're exploring the first 3 cards. Upgrade to unlock all 44, journaling, and more.
              </Text>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.upgradeBtn,
                { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                Linking.openURL(STRIPE_URL);
              }}
            >
              <Text style={styles.upgradeBtnText}>Unlock Premium Access — $22</Text>
              <Text style={styles.upgradeBtnSub}>One-time · lifetime access</Text>
            </Pressable>

            <Pressable
              style={styles.loginLink}
              onPress={() => router.push("/login")}
            >
              <Text style={[styles.loginLinkText, { color: colors.mutedForeground }]}>
                Already purchased?{" "}
                <Text style={{ color: colors.primary }}>Log in to restore access</Text>
              </Text>
            </Pressable>
          </>
        )}

        {/* Divider */}
        <View style={[styles.divider, { borderColor: colors.border }]} />

        {/* App info */}
        <View style={styles.appInfo}>
          <Text style={[styles.appName, { color: colors.foreground }]}>Reclaim & Return</Text>
          <Text style={[styles.appSub, { color: colors.mutedForeground }]}>
            A 44-card self-discovery deck
          </Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { paddingHorizontal: 24 },
  heading: {
    fontSize: 30,
    fontFamily: "PlayfairDisplay_700Bold",
    marginBottom: 28,
  },
  card: {
    borderRadius: 20,
    padding: 24,
    borderWidth: 1.5,
    gap: 10,
    marginBottom: 16,
  },
  premiumBadge: {
    alignSelf: "flex-start",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 4,
  },
  premiumBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: "PlayfairDisplay_700Bold",
  },
  cardBody: {
    fontSize: 14,
    lineHeight: 22,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  rowLeft: { flex: 1, gap: 3 },
  rowLabel: { fontSize: 11, letterSpacing: 1.2, textTransform: "uppercase" },
  rowValue: { fontSize: 15 },
  logoutBtn: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1,
    marginBottom: 12,
  },
  logoutText: { fontSize: 15 },
  hint: {
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    marginBottom: 8,
  },
  upgradeBtn: {
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    gap: 4,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  upgradeBtnText: {
    color: "#fff",
    fontSize: 17,
    fontFamily: "PlayfairDisplay_700Bold",
  },
  upgradeBtnSub: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 12,
  },
  loginLink: { alignItems: "center", paddingVertical: 8 },
  loginLinkText: { fontSize: 14, textAlign: "center" },
  divider: { borderTopWidth: 1, marginVertical: 28 },
  appInfo: { alignItems: "center", gap: 4 },
  appName: {
    fontSize: 16,
    fontFamily: "PlayfairDisplay_700Bold",
    letterSpacing: 0.3,
  },
  appSub: { fontSize: 13 },
});
