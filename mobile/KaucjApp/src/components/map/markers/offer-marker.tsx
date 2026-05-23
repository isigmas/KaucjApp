import { Offer } from "@/src/types";
import React, { useState, useCallback } from "react";
import { StyleSheet, View, Text } from "react-native";
import { Marker } from "react-native-maps";
import { colors } from "@/src/theme";
import { formatPrice } from "@/src/lib";

interface OfferMarkerProps {
  offer: Offer;
  onPress: (offer: Offer) => void;
}

export const OfferMarker = React.memo(
  ({ offer, onPress }: OfferMarkerProps) => {
    const [isTracking, setIsTracking] = useState(true);

    const handleLayout = useCallback(() => {
      if (isTracking) {
        setIsTracking(false);
      }
    }, [isTracking]);

    return (
      <Marker
        identifier={`offer-${offer.offerId}`}
        coordinate={{ latitude: offer.latitude, longitude: offer.longitude }}
        onPress={() => onPress(offer)}
        tracksViewChanges={isTracking}
        icon={undefined}
      >
        <View style={styles.markerContainer} onLayout={handleLayout}>
          <View style={styles.bubble}>
            <Text style={styles.bubbleText} numberOfLines={1}>
              {offer.totalQuantity} sztuk +{formatPrice(offer.totalIncome)}
            </Text>
          </View>
          <View style={styles.triangle} />
          <View style={styles.markerCore} />
        </View>
      </Marker>
    );
  },
  (prevProps, nextProps) =>
    prevProps.offer.updatedAt === nextProps.offer.updatedAt &&
    prevProps.offer.offerId === nextProps.offer.offerId &&
    prevProps.offer.status === nextProps.offer.status &&
    prevProps.offer.totalQuantity === nextProps.offer.totalQuantity &&
    prevProps.offer.totalPrize === nextProps.offer.totalPrize,
);

const styles = StyleSheet.create({
  markerContainer: {
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1, // Ensure the marker is above the map layer
  },
  bubble: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary.base,
    // Shadows for iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    // Elevation for Android
    elevation: 4,
  },
  bubbleText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#333333",
  },
  triangle: {
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderBottomWidth: 6,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: colors.primary.base,
    transform: [{ rotate: "180deg" }],
    marginBottom: 2, // Tiny gap before the core dot
  },
  markerCore: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary.base,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
});
