import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ScrollView,
} from "react-native";
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps";
import Animated, { Layout, FadeIn, FadeOut } from "react-native-reanimated";
import * as Location from "expo-location";
import { BlurView } from "expo-blur";
import { colors } from "@/src/theme";
import { OfferData } from "./create-offer";
import { Link } from "expo-router";
import { useLocationStore } from "@/src/state/location";

interface Step2LocationProps {
  data: OfferData;
  updateData: (newData: Partial<OfferData>) => void;
}

export default function Step2Location({
  data,
  updateData,
}: Step2LocationProps) {
  const [isNotesExpanded, setIsNotesExpanded] = useState(!!data.notes);
  const pickedLocation = useLocationStore((state) => state.pickedLocation);

  const [previewRegion, setPreviewRegion] = useState({
    latitude: data.latitude || 50.0647,
    longitude: data.longitude || 19.945,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  useEffect(() => {
    if (pickedLocation) {
      updateData({
        latitude: pickedLocation.latitude,
        longitude: pickedLocation.longitude,
      });

      setPreviewRegion({
        latitude: pickedLocation.latitude,
        longitude: pickedLocation.longitude,
        latitudeDelta: 0.003,
        longitudeDelta: 0.003,
      });
      return;
    }

    if (data.latitude && data.longitude) {
      setPreviewRegion({
        latitude: data.latitude,
        longitude: data.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
      return;
    }

    (async () => {
      try {
        const { status } = await Location.getForegroundPermissionsAsync();

        if (status === "granted") {
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });

          setPreviewRegion({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });
        }
      } catch (error) {
        console.warn("Could not fetch location for thumbnail preview", error);
      }
    })();
  }, [data.latitude, data.longitude, pickedLocation]);

  const hasSelectedLocation = !!data.latitude;

  return (
    <ScrollView
      style={styles.stepContainer}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Gdzie odbiór?</Text>
        <Text style={styles.headerSubtitle}>
          Wskaż miejsce na mapie i podaj adres.
        </Text>
      </View>

      {/* BLURRED MAP THUMBNAIL  */}
      <Link href="/(tabs)/create/map-sheet" asChild>
        <Pressable style={styles.mapThumbnailContainer}>
          <View pointerEvents="none" style={styles.mapThumbnailWrapper}>
            <MapView
              provider={PROVIDER_DEFAULT}
              style={styles.mapThumbnail}
              region={previewRegion}
              pitchEnabled={false}
              rotateEnabled={false}
              scrollEnabled={false}
              zoomEnabled={false}
            >
              {hasSelectedLocation && (
                <Marker
                  coordinate={{
                    latitude: data.latitude!,
                    longitude: data.longitude!,
                  }}
                  pinColor={colors.primary.base}
                />
              )}
            </MapView>

            {!hasSelectedLocation && (
              <BlurView
                intensity={5}
                tint="dark"
                style={StyleSheet.absoluteFill}
              />
            )}
          </View>

          {/* floating button */}
          <View
            style={
              hasSelectedLocation
                ? styles.thumbnailOverlaySelected
                : styles.thumbnailOverlay
            }
          >
            <View
              style={[
                styles.thumbnailPill,
                hasSelectedLocation && { opacity: 0.75 },
              ]}
            >
              <Text style={styles.thumbnailPillIcon}>📍</Text>
              <Text style={styles.thumbnailPillText}>
                {hasSelectedLocation ? "Zmień lokalizację" : "Wybierz na mapie"}
              </Text>
            </View>
          </View>
        </Pressable>
      </Link>

      {/* Address Input  */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Adres odbioru (ulica i numer)</Text>
        <TextInput
          style={styles.textInput}
          placeholder="ul. Studencka 4"
          placeholderTextColor={colors.text.muted}
          value={data.address || ""}
          onChangeText={(text) => updateData({ address: text })}
        />
      </View>

      {/*  Notes Section */}
      <Animated.View
        layout={Layout.springify().damping(50).stiffness(500).mass(2.5)}
        style={styles.notesContainer}
      >
        <Pressable
          style={styles.notesHeader}
          onPress={() => setIsNotesExpanded(!isNotesExpanded)}
        >
          <View style={styles.notesHeaderLeft}>
            <Text style={styles.notesTitle}>
              Dodatkowe informacje (Opcjonalne)
            </Text>
          </View>
          <Text style={styles.chevronText}>{isNotesExpanded ? "−" : "+"}</Text>
        </Pressable>

        {isNotesExpanded && (
          <Animated.View
            entering={FadeIn.delay(100)}
            exiting={FadeOut}
            style={styles.notesContent}
          >
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="Jestem w domu od 18:00, ale mogę się dostosować..."
              placeholderTextColor={colors.text.muted}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              value={data.notes || ""}
              onChangeText={(text) => updateData({ notes: text })}
            />
          </Animated.View>
        )}
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  stepContainer: {
    flex: 1,
  },
  header: {
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.text.primary,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  mapThumbnailContainer: {
    height: 180,
    borderRadius: 26,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.status.border,
    marginBottom: 24,
    backgroundColor: colors.background.subtle,
  },
  mapThumbnailWrapper: {
    ...StyleSheet.absoluteFillObject,
  },
  mapThumbnail: {
    ...StyleSheet.absoluteFillObject,
  },
  thumbnailOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  thumbnailOverlaySelected: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  thumbnailPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background.card,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 24,
    shadowColor: colors.text.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
    gap: 6,
    marginBottom: 12,
  },
  thumbnailPillIcon: {
    fontSize: 16,
  },
  thumbnailPillText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text.primary,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: colors.background.card,
    borderWidth: 1,
    borderColor: colors.status.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.text.primary,
  },
  notesContainer: {
    backgroundColor: colors.background.subtle,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.status.border,
    overflow: "hidden",
    marginBottom: 40,
  },
  notesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  notesHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  notesIcon: {
    fontSize: 18,
  },
  notesTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text.secondary,
  },
  chevronText: {
    fontSize: 24,
    color: colors.text.muted,
    fontWeight: "300",
  },
  notesContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  notesHint: {
    fontSize: 13,
    color: colors.text.secondary,
    marginBottom: 12,
    lineHeight: 18,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 14,
  },
});
