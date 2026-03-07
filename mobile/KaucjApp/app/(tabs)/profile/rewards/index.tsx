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
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView } from "react-native";
import { colors } from "@/src/theme";
import { Stack, useRouter } from "expo-router"; // 1. Dodaj useRouter

const REWARDS = [
    { id: "1", title: "Kubek Miasta Krakowa", price: 500 },
    { id: "2", title: "Spotify Premium na \n3 miesiące", price: 300 },
    { id: "3", title: "1 darmowa dostawa \nOrlen Paczka", price: 300 },
    { id: "4", title: "Posadzenie drzewka z \ntabliczą imienną", price: 200 },
];

export default function Rewards() {
    const router = useRouter(); // 2. Zainicjuj router

    return (
        <SafeAreaView style={styles.safeArea}>
            <Stack.Screen options={{ headerShown: true, headerBackButtonDisplayMode: "minimal", headerTitle: "Nagrody", headerTitleStyle: { color: colors.text.white}, headerStyle: { backgroundColor: colors.primary.base }}} />

            <View style={styles.header}>
                <Text style={styles.pointsLabel}>Twoje punkty</Text>
                <Text style={styles.pointsValue}>500</Text>
            </View>

            <FlatList
                data={REWARDS}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContainer}
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.rewardCard} activeOpacity={0.7}>
                        <View>
                            <Text style={styles.rewardTitle}>{item.title}</Text>
                        </View>
                        <View style={styles.priceBadge}>
                            <Text style={styles.priceText}>{item.price} pkt</Text>
                        </View>
                    </TouchableOpacity>
                )}
            />

            {/* 3. Dodaj przycisk na samym dole */}
            <TouchableOpacity
                style={styles.faqButton}
                onPress={() => router.push("/(tabs)/profile/rewards/rewardsHowWork" as any)} // Upewnij się, że nazwa pliku to faq.tsx
            >
                <Text style={styles.faqButtonText}>FAQ</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background.main },
    header: {
        backgroundColor: colors.primary.base,
        paddingTop: 10,
        paddingBottom: 10,
        alignItems: "center",
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
    },
    pointsLabel: { color: colors.text.secondary, opacity: 0.9, fontSize: 14, fontWeight: "600", textTransform: "uppercase" },
    pointsValue: { color: colors.text.white, fontSize: 48, fontWeight: "900", marginTop: -8 },
    listContainer: { padding: 20 },
    rewardCard: {
        backgroundColor: colors.background.card,
        padding: 20,
        borderRadius: 24,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
        borderWidth: 1,
        borderColor: colors.background.subtle
    },
    rewardTitle: { fontSize: 17, fontWeight: "700", color: colors.text.primary },
    priceBadge: { backgroundColor: colors.text.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 14 },
    priceText: { color: colors.status.warning, fontWeight: "800", fontSize: 14 },
    // 4. Style dla przycisku FAQ
    faqButton: {
        margin: 20,
        paddingVertical: 16,
        backgroundColor: colors.background.subtle,
        borderRadius: 16,
        alignItems: "center",
        borderWidth: 1,
        borderColor: colors.status.border,
    },
    faqButtonText: {
        color: colors.primary.base,
        fontSize: 16,
        fontWeight: "700",
    }
});