import { View, Text } from "react-native";
import React from "react";
import { StyleSheet } from "react-native";

export default function Tab2() {
  return (
    <View style={styles.container}>
      <Text>Tab2</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
