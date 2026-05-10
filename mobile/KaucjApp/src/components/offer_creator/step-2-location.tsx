import React, { useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps";
import Animated, { FadeIn, FadeOut, Layout } from "react-native-reanimated";
import * as Location from "expo-location";
import { BlurView } from "expo-blur";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { colors } from "@/src/theme";
import type { OfferFormValues } from "./offer-form-schema";

interface Step2LocationProps {
  onOpenLocationPicker: () => void;
}

export default function Step2Location({
  onOpenLocationPicker,
}: Step2LocationProps) {
  const { control } = useFormContext<OfferFormValues>();
  const initialNotes = useWatch({ control, name: "pickupInstructions" });
  const latitude = useWatch({ control, name: "latitude" });
  const longitude = useWatch({ control, name: "longitude" });

  const [isNotesExpanded, setIsNotesExpanded] = useState(!!initialNotes);
  const hasSelectedLocation = latitude !== null && longitude !== null;

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

      <MapThumbnail
        latitude={latitude}
        longitude={longitude}
        hasSelectedLocation={hasSelectedLocation}
        onPress={onOpenLocationPicker}
      />

      <Controller
        control={control}
        name="pickupAddress"
        render={({ field: { value, onChange, onBlur } }) => (
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Adres odbioru (ulica i numer)
            </Text>
            <TextInput
              style={styles.textInput}
              placeholder="ul. Studencka 4"
              placeholderTextColor={colors.text.muted}
              value={value ?? ""}
              onChangeText={onChange}
              onBlur={onBlur}
            />
          </View>
        )}
      />

      <Animated.View
        layout={Layout.springify().damping(50).stiffness(500).mass(2.5)}
        style={styles.notesContainer}
      >
        <Pressable
          style={styles.notesHeader}
          onPress={() => setIsNotesExpanded((prev) => !prev)}
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
            <Controller
              control={control}
              name="pickupInstructions"
              render={({ field: { value, onChange, onBlur } }) => (
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  placeholder="Jestem w domu od 18:00, ale mogę się dostosować..."
                  placeholderTextColor={colors.text.muted}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  value={value ?? ""}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
              )}
            />
          </Animated.View>
        )}
      </Animated.View>
    </ScrollView>
  );
}

interface MapThumbnailProps {
  latitude: number | null;
  longitude: number | null;
  hasSelectedLocation: boolean;
  onPress: () => void;
}

const FALLBACK_THUMBNAIL_REGION = {
  latitude: 50.0647,
  longitude: 19.945,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

function MapThumbnail({
  latitude,
  longitude,
  hasSelectedLocation,
  onPress,
}: MapThumbnailProps) {
  const [previewRegion, setPreviewRegion] = useState(() => ({
    latitude: latitude ?? FALLBACK_THUMBNAIL_REGION.latitude,
    longitude: longitude ?? FALLBACK_THUMBNAIL_REGION.longitude,
    latitudeDelta: hasSelectedLocation ? 0.003 : 0.01,
    longitudeDelta: hasSelectedLocation ? 0.003 : 0.01,
  }));

  // Keep the thumbnail region in sync with the latest picked coordinates and,
  // when nothing is picked yet, opportunistically center on the user's
  // location (no permission prompt — read-only).
  useEffect(() => {
    if (latitude !== null && longitude !== null) {
      setPreviewRegion({
        latitude,
        longitude,
        latitudeDelta: 0.003,
        longitudeDelta: 0.003,
      });
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const { status } = await Location.getForegroundPermissionsAsync();
        if (status !== "granted" || cancelled) return;

        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        if (cancelled) return;

        setPreviewRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      } catch (error) {
        console.warn("Could not fetch location for thumbnail preview", error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [latitude, longitude]);

  return (
    <Pressable style={styles.mapThumbnailContainer} onPress={onPress}>
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
          {hasSelectedLocation && latitude !== null && longitude !== null && (
            <Marker
              coordinate={{ latitude, longitude }}
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
            hasSelectedLocation && styles.thumbnailPillFaded,
          ]}
        >
          <Text style={styles.thumbnailPillIcon}>📍</Text>
          <Text style={styles.thumbnailPillText}>
            {hasSelectedLocation ? "Zmień lokalizację" : "Wybierz na mapie"}
          </Text>
        </View>
      </View>
    </Pressable>
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
  thumbnailPillFaded: {
    opacity: 0.75,
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
  textArea: {
    minHeight: 100,
    paddingTop: 14,
  },
});
