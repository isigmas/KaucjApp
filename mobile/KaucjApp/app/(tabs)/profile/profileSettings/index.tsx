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

import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    FlatList,
    TouchableOpacity,
    SafeAreaView,
    Platform,
    ScrollView
} from "react-native";
import { useRouter } from "expo-router";
import { colors } from "@/src/theme";
import { Stack } from "expo-router";
import {red} from "react-native-reanimated/lib/typescript/Colors";

export default function ProfileSettings() {
    const router = useRouter();
    const [firstName, setFirstName] = useState("Jan");
    const [lastName, setLastName] = useState("Kowalski");
    const [username, setUsername] = useState("@jankowalski");
    const [phone, setPhone] = useState("+48 123 456 789");
    const [email, setEmail] = useState("jkowalski123@spoko.pl");
    const [address, setAddress] = useState("ul. Wawelska 1, Kraków");

    const [latitude, setLatitude] = useState<number | null>(null);
    const [longitude, setLongitude] = useState<number | null>(null);

    const getCoordinates = async (addr: string) => {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(addr)}&format=json&limit=1`,
                { headers: { "User-Agent": "my-react-native-app" } }
            );
            const data = await response.json();
            if (!data || data.length === 0) return null;

            const lat = parseFloat(data[0].lat);
            const lon = parseFloat(data[0].lon);
            setLatitude(lat);
            setLongitude(lon);
            return { lat, lon };
        } catch (error) {
            console.log(error);
            return null;
        }
    };

    const sendProfileData = async () => {
        const coords = await getCoordinates(address);
        if (!coords) return;

        const payload = {
            first_name: firstName,
            last_name: lastName,
            user_name: username,
            phone_number: phone,
            e_mail: email,
            address: address,
            latitude: coords.lat,
            longitude: coords.lon
        };

        try {
            await fetch("https://twoje-api.pl/api/profile", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <Stack.Screen options={{ headerShown: true, headerBackButtonDisplayMode: "minimal", headerTitle: "Edytuj profil", headerTransparent: true }}/>
            <View style={styles.container}>
                <ScrollView>
                    <View style={styles.form}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Imię</Text>
                            <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} returnKeyType="done" keyboardType="name-phone-pad" placeholderTextColor={colors.text.muted} />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Nazwisko</Text>
                            <TextInput style={styles.input} value={lastName} onChangeText={setLastName} returnKeyType="done" keyboardType="name-phone-pad" placeholderTextColor={colors.text.muted} />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Pseudonim</Text>
                            <TextInput style={styles.input} value={username} onChangeText={setUsername} returnKeyType="done" keyboardType="name-phone-pad" placeholderTextColor={colors.text.muted} />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Numer telefonu</Text>
                            <TextInput style={styles.input} value={phone} onChangeText={setPhone} returnKeyType="done" keyboardType="numeric" placeholderTextColor={colors.text.muted} />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Email</Text>
                            <TextInput style={styles.input} value={email} onChangeText={setEmail} returnKeyType="done" keyboardType="numeric" placeholderTextColor={colors.text.muted} />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Adres zamieszkania</Text>
                            <TextInput style={styles.input} value={address} onChangeText={setAddress} returnKeyType="done" keyboardType="email-address" placeholderTextColor={colors.text.muted} />
                        </View>
                    </View>
                </ScrollView>

                <View style={styles.actionContainer}>
                    <TouchableOpacity style={styles.saveButton} activeOpacity={0.8} onPress={async () => { await sendProfileData(); router.back(); }}>
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
    form: { marginTop: 50, flex: 1, gap: 20, marginBottom: 28 },
    inputGroup: { gap: 8 },
    label: { fontSize: 14, fontWeight: "600", color: colors.text.primary, marginLeft: 4 },
    input: { backgroundColor: colors.background.subtle, borderWidth: 1, borderColor: colors.primary.dark, borderRadius: 16, padding: 16, fontSize: 16, color: colors.text.primary },
    actionContainer: { gap: 12, marginBottom: 10, backgroundColor: "transparent" },
    saveButton: { marginBlock: 20,marginBlockEnd: 4,backgroundColor: colors.primary.base, paddingVertical: 16, borderRadius: 16, alignItems: "center", ...Platform.select({ ios: { shadowColor: colors.primary.base, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.2, shadowRadius: 8 }, android: { elevation: 6 } }) },
    saveText: { color: colors.text.white, fontSize: 16, fontWeight: "700" },
    cancelButton: { backgroundColor: "transparent", paddingVertical: 16, borderRadius: 16, alignItems: "center", borderWidth: 1, borderColor: colors.status.border },
    cancelText: { color: colors.text.secondary, fontSize: 16, fontWeight: "700" },
});