import React, { useMemo, useState } from "react";
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
import { BlurView } from "expo-blur";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { colors } from "@/src/theme";
import type { PickedLocation } from "./location-bottom-sheet";
import { OfferFormValues } from "@/src/validation";

interface Step2LocationProps {
  selectedLocation: PickedLocation | null;
  defaultLocation: PickedLocation | null;
  onOpenLocationPicker: () => void;
}

export default function Step2Location({
  selectedLocation,
  defaultLocation,
  onOpenLocationPicker,
}: Step2LocationProps) {
  const { control } = useFormContext<OfferFormValues>();
  const initialNotes = useWatch({ control, name: "pickupInstructions" });

  const [isNotesExpanded, setIsNotesExpanded] = useState(() => !!initialNotes);

  return (
    <>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Gdzie odbiór?</Text>
        <Text style={styles.headerSubtitle}>
          Wskaż miejsce na mapie i podaj adres.
        </Text>
      </View>

      <MapThumbnail
        selectedLocation={selectedLocation}
        defaultLocation={defaultLocation}
        onPress={onOpenLocationPicker}
      />

      <Controller
        control={control}
        name="pickupAddress"
        render={({
          field: { value, onChange, onBlur },
          fieldState: { error },
        }) => (
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Adres odbioru (ulica i numer)</Text>
            <TextInput
              style={[
                styles.textInput,
                {
                  borderColor: error
                    ? colors.status.error
                    : colors.status.border,
                },
              ]}
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
    </>
  );
}

interface MapThumbnailProps {
  selectedLocation: PickedLocation | null;
  defaultLocation: PickedLocation | null;
  onPress: () => void;
}

/**
 * Read-only mini-map that previews the pickup pin. Uses
 * `selectedLocation ?? defaultLocation` so the preview is always meaningful,
 * and reflects the same single source of truth as the picker.
 *
 * While `defaultLocation` is still resolving and there is no selection yet,
 * we render the thumbnail without an inner map — the blurred placeholder
 * matches the "no selection" UX without showing a misleading region.
 */
function MapThumbnail({
  selectedLocation,
  defaultLocation,
  onPress,
}: MapThumbnailProps) {
  const hasSelected = selectedLocation !== null;
  const pin = selectedLocation ?? defaultLocation;

  const region = useMemo(
    () =>
      pin
        ? {
            latitude: pin.latitude,
            longitude: pin.longitude,
            latitudeDelta: hasSelected ? 0.003 : 0.01,
            longitudeDelta: hasSelected ? 0.003 : 0.01,
          }
        : null,
    [pin, hasSelected],
  );

  return (
    <Pressable style={styles.mapThumbnailContainer} onPress={onPress}>
      <View pointerEvents="none" style={styles.mapThumbnailWrapper}>
        {region && (
          <MapView
            provider={PROVIDER_DEFAULT}
            style={styles.mapThumbnail}
            region={region}
            pitchEnabled={false}
            rotateEnabled={false}
            scrollEnabled={false}
            zoomEnabled={false}
          >
            {hasSelected && pin && (
              <Marker coordinate={pin} pinColor={colors.primary.base} />
            )}
          </MapView>
        )}

        {!hasSelected && (
          <BlurView intensity={5} tint="dark" style={StyleSheet.absoluteFill} />
        )}
      </View>

      <View
        style={
          hasSelected
            ? styles.thumbnailOverlaySelected
            : styles.thumbnailOverlay
        }
      >
        <View
          style={[
            styles.thumbnailPill,
            hasSelected && styles.thumbnailPillFaded,
          ]}
        >
          <Text style={styles.thumbnailPillIcon}>📍</Text>
          <Text style={styles.thumbnailPillText}>
            {hasSelected ? "Zmień lokalizację" : "Wybierz na mapie"}
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
