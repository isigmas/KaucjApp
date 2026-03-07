/*import { View, Text } from "react-native";
import React from "react";
import { StyleSheet } from "react-native";

export default function Profile() {
  return (
    <View style={styles.container}>
      <Text>Profile</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});*/

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, BackHandler, SafeAreaView, Platform } from "react-native";
import { useRouter } from "expo-router";
import { colors } from "@/src/theme";
import { Stack } from "expo-router";

export default function Profile() {
  const router = useRouter();
  const handleExitApp = () => BackHandler.exitApp();

  return (
      <SafeAreaView style={styles.safeArea}>
        <Stack.Screen options={{ headerShown: true, headerBackButtonDisplayMode: "minimal", headerTitle: "Profil", headerTransparent: true }}/>
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatarPlaceholder} />
              <View style={styles.badge} />
            </View>
            <Text style={styles.fullName}>Jan Kowalski</Text>
            <View style={styles.tag}>
              <Text style={styles.username}>@janekkowalski</Text>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Telefon</Text>
              <Text style={styles.value}>+48 123 456 789</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.label}>Adres</Text>
              <Text style={styles.value}>ul. Wawelska 1, Kraków</Text>
            </View>
          </View>

          <View style={styles.actionContainer}>
            <TouchableOpacity style={styles.settingsButton} activeOpacity={0.8} onPress={() => router.push("/(tabs)/profile/profileSettings")}>
              <Text style={styles.settingsText}>Ustawienia profilu</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.rewardsButton} activeOpacity={0.8} onPress={() => router.push("/(tabs)/profile/rewards")}>
              <Text style={styles.rewardsText}>Nagrody za punkty</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.logoutButton} activeOpacity={0.8}>
              <Text style={styles.logoutText}>Wyloguj się</Text>
            </TouchableOpacity>

          </View>
        </View>
      </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background.main },
  container: { flex: 1, paddingHorizontal: 24, justifyContent: "space-between", paddingBottom: 30 },
  header: { alignItems: "center", marginTop: 40 },
  avatarContainer: { position: "relative", marginBottom: 16 },
  avatarPlaceholder: { width: 110, height: 110, borderRadius: 55, backgroundColor: colors.primary.light, borderWidth: 3, borderColor: colors.background.card, ...Platform.select({ ios: { shadowColor: colors.primary.dark, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 10 }, android: { elevation: 8 } }) },
  badge: { position: "absolute", bottom: 4, right: 4, width: 20, height: 20, borderRadius: 10, backgroundColor: colors.status.success, borderWidth: 2, borderColor: colors.background.card },
  fullName: { fontSize: 24, fontWeight: "800", color: colors.text.primary, letterSpacing: -0.5 },
  tag: { backgroundColor: colors.primary.light, paddingVertical: 4, paddingHorizontal: 12, borderRadius: 20, marginTop: 8 },
  username: { fontSize: 14, fontWeight: "600", color: colors.primary.dark },
  card: { backgroundColor: colors.background.card, borderRadius: 24, padding: 24, marginVertical: 32, ...Platform.select({ ios: { shadowColor: colors.text.primary, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.05, shadowRadius: 16 }, android: { elevation: 4 } }) },
  infoRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 8 },
  label: { fontSize: 15, color: colors.text.secondary, fontWeight: "500" },
  value: { fontSize: 15, color: colors.text.primary, fontWeight: "700" },
  divider: { height: 1, backgroundColor: colors.background.subtle, marginVertical: 12 },
  actionContainer: { gap: 12 },
  settingsButton: { backgroundColor: colors.primary.light, paddingVertical: 16, borderRadius: 16, alignItems: "center", borderWidth: 1, borderColor: colors.primary.dark },
  settingsText: { color: colors.primary.dark, fontSize: 16, fontWeight: "700" },
  logoutButton: { backgroundColor: colors.status.error, paddingVertical: 16, borderRadius: 16, alignItems: "center", ...Platform.select({ ios: { shadowColor: colors.primary.base, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.2, shadowRadius: 8 }, android: { elevation: 6 } }) },
  logoutText: { color: colors.text.white, fontSize: 16, fontWeight: "700" },
  rewardsButton: { backgroundColor: colors.primary.light, paddingVertical: 16, borderRadius: 16, alignItems: "center", borderWidth: 1, borderColor: colors.status.warning },
  rewardsText: { color: colors.status.warning, fontSize: 16, fontWeight: "700"},
  exitButton: { backgroundColor: colors.background.subtle, paddingVertical: 16, borderRadius: 16, alignItems: "center", borderWidth: 1, borderColor: colors.status.border },
  exitText: { color: colors.status.error, fontSize: 16, fontWeight: "700" },
});