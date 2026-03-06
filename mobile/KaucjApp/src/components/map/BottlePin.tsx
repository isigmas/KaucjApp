import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "@/src/theme";

interface BottlePinProps {
  /** Number of bottles in this ad */
  count: number;
}

const PIN = 46;
const BOX = Math.ceil(PIN * Math.SQRT2);

export function BottlePin({ count }: BottlePinProps) {
  return (
    <View style={styles.container}>
      <View style={styles.pinBody}>
        <View style={styles.labelWrap}>
          <Text style={styles.count} numberOfLines={1}>
            {count}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: BOX,
    height: BOX,
    alignItems: "center",
    justifyContent: "center",
  },
  pinBody: {
    width: PIN,
    height: PIN,
    borderTopLeftRadius: PIN / 2,
    borderTopRightRadius: PIN / 2,
    borderBottomLeftRadius: PIN / 2,
    borderBottomRightRadius: 3,
    backgroundColor: colors.primary.base,
    transform: [{ rotate: "45deg" }],
    alignItems: "center",
    justifyContent: "center",
  },
  labelWrap: {
    transform: [{ rotate: "-45deg" }],
  },
  count: {
    color: colors.text.white,
    fontSize: 15,
    fontWeight: "700",
  },
});