import React from "react";
import { Image, StyleSheet } from "react-native";
import { rounded, spacing } from "@/src/theme";

export default function MachineImage() {
  return (
    <Image
      source={require("@/assets/images/kaucjomat.jpg")}
      style={styles.image}
      resizeMode="cover"
    />
  );
}

const styles = StyleSheet.create({
  image: {
    width: "100%",
    height: 200,
    borderRadius: rounded.xl,
  },
});
