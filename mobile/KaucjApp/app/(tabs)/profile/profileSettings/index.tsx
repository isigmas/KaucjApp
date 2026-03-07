import React, { useState} from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, Platform } from "react-native";
import { useRouter } from "expo-router";
import { colors } from "@/src/theme";
import { Stack } from "expo-router";

export default function ProfileSettings() {
    const router = useRouter();
    const [name, setName] = useState("Jan Kowalski");
    const [phone, setPhone] = useState("+48 123 456 789");
    const [address, setAddress] = useState("ul. Wawelska 1, Kraków");

    return (
        <SafeAreaView style={styles.safeArea}>
            <Stack.Screen options={{ headerShown: true, headerBackButtonDisplayMode: "minimal", headerTitle: "Edytuj profil", headerTransparent: true }}/>


            <View style={styles.container}>
                {/*<View style={styles.header}>*/}
                {/*    <Text style={styles.title}>Edytuj profil</Text>*/}
                {/*</View>*/}

                <View style={styles.form}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Imię i nazwisko</Text>
                        <TextInput style={styles.input} value={name} onChangeText={setName} returnKeyType={"done"} keyboardType={"name-phone-pad"} placeholderTextColor={colors.text.muted} />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Numer telefonu</Text>
                        <TextInput style={styles.input} value={phone} onChangeText={setPhone} returnKeyType={"done"} keyboardType={"numeric"} placeholderTextColor={colors.text.muted} />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Adres zamieszkania</Text>
                        <TextInput style={styles.input} value={address} onChangeText={setAddress} returnKeyType={"done"} keyboardType={"email-address"} placeholderTextColor={colors.text.muted} />
                    </View>
                </View>

                <View style={styles.actionContainer}>
                    <TouchableOpacity style={styles.saveButton} activeOpacity={0.8} onPress={() => router.back()}>
                        <Text style={styles.saveText}>Zapisz zmiany</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.cancelButton} activeOpacity={0.8} onPress={() => router.back()}>
                        <Text style={styles.cancelText}>Anuluj</Text>
                    </TouchableOpacity>
                </View>
                </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background.main },
    container: { flex: 1, paddingHorizontal: 24, justifyContent: "space-between", paddingBottom: 30 },
    header: { marginTop: 20, marginBottom: 30, fontStyle: "normal" , fontFamily: "sans-serif-condensed" },
    title: { fontSize: 28, fontWeight: "800", color: colors.text.primary, letterSpacing: -0.5 },
    form: { marginTop: 50, flex: 1, gap: 20 },
    inputGroup: { gap: 8 },
    label: { fontSize: 14, fontWeight: "600", color: colors.text.primary, marginLeft: 4 },
    input: { backgroundColor: colors.background.subtle, borderWidth: 1, borderColor: colors.primary.dark, borderRadius: 16, padding: 16, fontSize: 16, color: colors.text.primary},
    actionContainer: { gap: 12, marginBottom: 20 },
    saveButton: { borderColor: colors.primary.dark, borderWidth: 1, backgroundColor: colors.primary.base, paddingVertical: 16, borderRadius: 16, alignItems: "center", ...Platform.select({ ios: { shadowColor: colors.primary.base, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.2, shadowRadius: 8 }, android: { elevation: 6 } }) },
    saveText: { color: colors.text.white, fontSize: 16, fontWeight: "700" },
    cancelButton: { backgroundColor: colors.background.subtle, paddingVertical: 16, borderRadius: 16, alignItems: "center", borderWidth: 1, borderColor: colors.status.border },
    cancelText: { color: colors.text.secondary, fontSize: 16, fontWeight: "700" },
});