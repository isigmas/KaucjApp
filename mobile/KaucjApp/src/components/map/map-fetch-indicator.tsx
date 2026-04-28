import { colors } from "@/src/theme";
import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

export default function MapFetchIndicator({
  isFetching,
}: {
  isFetching: boolean;
}) {
  if (isFetching) {
    return (
      <View style={styles.spinnerContainer}>
        <ActivityIndicator size="small" color={colors.primary.base} />
      </View>
    );
  }
  return null;
}

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
