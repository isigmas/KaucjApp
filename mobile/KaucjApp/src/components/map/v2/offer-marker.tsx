import { Offer } from "@/src/types";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Marker } from "react-native-maps";
import { colors } from "@/src/theme";

interface OfferMarkerProps {
  offer: Offer;
  onPress: (offer: Offer) => void;
}

export const OfferMarker = React.memo(
  ({ offer, onPress }: OfferMarkerProps) => {
    return (
      <Marker
        coordinate={{ latitude: offer.latitude, longitude: offer.longitude }}
        onPress={() => onPress(offer)}
        tracksViewChanges={false}
      >
        <View style={styles.markerContainer}>
          <View style={styles.markerCore} />
        </View>
      </Marker>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.offer.status === nextProps.offer.status &&
      prevProps.offer.latitude === nextProps.offer.latitude &&
      prevProps.offer.longitude === nextProps.offer.longitude
    );
  },
);

const styles = StyleSheet.create({
  markerContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: 30,
    height: 30,
  },
  markerCore: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary.base,
  },
});
