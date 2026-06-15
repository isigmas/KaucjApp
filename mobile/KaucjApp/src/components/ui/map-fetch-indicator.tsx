import { colors } from "@/src/theme";
import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

interface MapFetchIndicatorProps {
  isFetching: boolean;
}

function MapFetchIndicator({ isFetching }: MapFetchIndicatorProps) {
  if (!isFetching) return null;

  return (
    <View style={styles.spinnerContainer}>
      <ActivityIndicator size="small" color={colors.primary.base} />
    </View>
  );
}

export default React.memo(MapFetchIndicator);

const styles = StyleSheet.create({
  spinnerContainer: {
    position: "absolute",
    bottom: 30,
    left: 10,
    backgroundColor: "white",
    opacity: 0.8,
    padding: 10,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
  },
});
