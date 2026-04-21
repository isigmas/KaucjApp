import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useRouter, Stack } from "expo-router";
import { colors } from "@/src/theme";

const API_BASE = process.env.EXPO_PUBLIC_API_BASE!;
const USER_ID = process.env.EXPO_PUBLIC_USER_ID!;

export default function ProfileSettingsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/user/${USER_ID}`);
        if (!res.ok) return;
        const text = await res.text();
        if (!text) return;
        const data = JSON.parse(text);
        setFirstName(data.name ?? "");
        setLastName(data.surname ?? "");
        setUsername(data.username ?? "");
        setEmail(data.email ?? "");
        setPhone(data.phone_number ?? "");
        setAddress(data.default_address ?? "");
      } catch (e) {
        console.log("[ProfileSettings] fetch error:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  const getCoordinates = async (addr: string) => {
    const STREET_PREFIX_RE =
      /^(?:ul\.?|ul|alej[ae]|alejka|al\.?|al|plac|pl\.?|pl|osiedl[ae]|os\.?|os|skwer|skw\.?|bulwar|bul\.?|pasaż|pas\.?|droga|szosa|trakt|rondo|park|promenada|prom\.?)\s+/i;
    const FLAT_SUFFIX_RE =
      /\s+(?:m\.?|lok\.?|mieszkanie|lokal|apt\.?)\s*\d+[a-zA-Z]?\s*$/i;
    const POSTAL_RE = /\b\d{2}-\d{3}\b\s*/g;

    const commaIdx = addr.lastIndexOf(",");
    const rawStreet = (commaIdx !== -1 ? addr.slice(0, commaIdx) : addr).trim();
    const rawCity = (commaIdx !== -1 ? addr.slice(commaIdx + 1) : "").trim();

    const street = rawStreet
      .replace(STREET_PREFIX_RE, "")
      .replace(FLAT_SUFFIX_RE, "")
      .trim();
    const city = rawCity.replace(POSTAL_RE, "").trim();

    const buildUrl = (params: Record<string, string>) => {
      const base =
        "https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=pl&email=kaucjapp%40example.com";
      return (
        base +
        "&" +
        Object.entries(params)
          .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
          .join("&")
      );
    };

    const urls = [
      buildUrl({ street, ...(city ? { city } : {}) }),
      buildUrl({ q: addr }),
    ];

    try {
      for (const url of urls) {
        const response = await fetch(url);
        if (!response.ok) {
          continue;
        }
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lon = parseFloat(data[0].lon);
          setLatitude(lat);
          setLongitude(lon);
          return { lat, lon };
        }
      }
      return null;
    } catch (error) {
      console.log("[getCoordinates] error:", error);
      return null;
    }
  };

  const sendProfileData = async () => {
    console.log("[sendProfileData] called, address:", address);
    const coords = await getCoordinates(address);
    if (!coords) {
      console.log("[sendProfileData] could not resolve coordinates, aborting");
      return;
    }

    const payload = {
      name: firstName,
      surname: lastName,
      username: username,
      email: email,
      phone_number: phone,
      default_address: address,
      default_latitude: coords.lat,
      default_longitude: coords.lon,
    };

    try {
      const url = `${API_BASE}/user/${USER_ID}`;

      const putRes = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (putRes.status === 404) {
        await fetch(`${API_BASE}/user`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
    } catch (error) {
      console.log("[sendProfileData] error:", error);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Stack.Screen
          options={{
            headerShown: true,
            headerBackButtonDisplayMode: "minimal",
            headerTitle: "Edytuj profil",
            headerTransparent: true,
          }}
        />
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color={colors.primary.base} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerBackButtonDisplayMode: "minimal",
          headerTitle: "Edytuj profil",
          headerTransparent: true,
        }}
      />
      <View style={styles.container}>
        <ScrollView>
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Imię</Text>
              <TextInput
                style={styles.input}
                value={firstName}
                onChangeText={setFirstName}
                returnKeyType="done"
                keyboardType="name-phone-pad"
                placeholderTextColor={colors.text.muted}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nazwisko</Text>
              <TextInput
                style={styles.input}
                value={lastName}
                onChangeText={setLastName}
                returnKeyType="done"
                keyboardType="name-phone-pad"
                placeholderTextColor={colors.text.muted}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Pseudonim</Text>
              <TextInput
                style={styles.input}
                value={username}
                onChangeText={setUsername}
                returnKeyType="done"
                keyboardType="name-phone-pad"
                placeholderTextColor={colors.text.muted}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Numer telefonu</Text>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                returnKeyType="done"
                keyboardType="numeric"
                placeholderTextColor={colors.text.muted}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                returnKeyType="done"
                keyboardType="numeric"
                placeholderTextColor={colors.text.muted}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Adres zamieszkania</Text>
              <TextInput
                style={styles.input}
                value={address}
                onChangeText={setAddress}
                returnKeyType="done"
                keyboardType="email-address"
                placeholderTextColor={colors.text.muted}
              />
            </View>
          </View>
        </ScrollView>

        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.saveButton}
            activeOpacity={0.8}
            onPress={async () => {
              await sendProfileData();
              router.back();
            }}
          >
            <Text style={styles.saveText}>Zapisz zmiany</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            activeOpacity={0.8}
            onPress={() => router.back()}
          >
            <Text style={styles.cancelText}>Anuluj</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background.main },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "space-between",
    paddingBottom: 30,
  },
  form: { marginTop: 50, flex: 1, gap: 20, marginBottom: 28 },
  inputGroup: { gap: 8 },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.primary,
    marginLeft: 4,
  },
  input: {
    backgroundColor: colors.background.subtle,
    borderWidth: 1,
    borderColor: colors.primary.dark,
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: colors.text.primary,
  },
  actionContainer: {
    gap: 12,
    marginBottom: 10,
    backgroundColor: "transparent",
  },
  saveButton: {
    marginBlock: 20,
    marginBlockEnd: 4,
    backgroundColor: colors.primary.base,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: colors.primary.base,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: { elevation: 6 },
    }),
  },
  saveText: { color: colors.text.white, fontSize: 16, fontWeight: "700" },
  cancelButton: {
    backgroundColor: "transparent",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.status.border,
  },
  cancelText: { color: colors.text.secondary, fontSize: 16, fontWeight: "700" },
});
