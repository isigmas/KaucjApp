import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, LayoutAnimation, Platform, UIManager } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/src/theme";
import {Stack} from "expo-router";

// Włączenie animacji dla Androida
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const FAQ_DATA = [
    { id: 1, q: "Czym są punkty?", a: "To wirtualna waluta, którą nagradzamy Cię za każdą proekologiczną aktywność w naszej aplikacji." },
    { id: 2, q: "Jak zdobyć punkty?", a: "Punkty zbierasz za skanowanie kodów, udział w wyzwaniach oraz regularne segregowanie odpadów." },
    { id: 3, q: "Jak wymienić na nagrody?", a: "Przejdź do zakładki 'Nagrody', wybierz interesujący Cię bonus i kliknij 'Odbierz' – punkty zostaną pobrane automatycznie." },
    { id: 4, q: "Jak długo punkty są ważne?", a: "Twoje punkty są ważne przez 12 miesięcy od momentu ich zdobycia, więc nie zwlekaj z ich wymianą!" },
];

export default function FAQ() {
    const [expandedId, setExpandedId] = useState<number | null>(null);

    const toggleExpand = (id: number) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpandedId(expandedId === id ? null : id);
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <Stack.Screen options={{ headerShown: true, headerBackButtonDisplayMode: "minimal", headerTitle: "FAQ", headerTransparent: true }}/>


            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.title}>Pytania i odpowiedzi</Text>

                {FAQ_DATA.map((item) => (
                    <View key={item.id} style={styles.itemContainer}>
                        <TouchableOpacity
                            style={styles.questionButton}
                            onPress={() => toggleExpand(item.id)}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.questionText}>{item.q}</Text>
                            <Ionicons
                                name={expandedId === item.id ? "chevron-up" : "chevron-down"}
                                size={20}
                                color={colors.primary.base}
                            />
                        </TouchableOpacity>

                        {expandedId === item.id && (
                            <View style={styles.answerContainer}>
                                <Text style={styles.answerText}>{item.a}</Text>
                            </View>
                        )}
                    </View>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background.main },
    container: { padding: 24 },
    title: { fontSize: 28, fontWeight: "800", color: colors.primary.dark, marginBottom: 24, letterSpacing: -0.5, textAlign: "center" },
    itemContainer: {
        backgroundColor: colors.background.card,
        borderRadius: 16,
        marginBottom: 12,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: colors.background.subtle
    },
    questionButton: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 20
    },
    questionText: { fontSize: 16, fontWeight: "600", color: colors.primary.base, flex: 1 },
    answerContainer: { paddingHorizontal: 20, paddingBottom: 20 },
    answerText: { fontSize: 15, color: colors.text.secondary, lineHeight: 22 },
});