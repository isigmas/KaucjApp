import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

export default function LoadingState({ title }: { title: string }) {
  return (
    <View style={styles.centered}>
      <ActivityIndicator size="large" color="#4CAF50" />
      <Text style={styles.loadingText}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 60,
  },
  loadingText: {
    marginTop: 10,
    color: "#666",
  },
});
