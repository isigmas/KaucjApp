import { View, Text, StyleSheet } from "react-native";
import React from "react";

interface ComplaintScreenProps {
  offerId: string;
}

export default function ComplaintScreen({ offerId }: ComplaintScreenProps) {
  return (
    <View>
      <Text>ComplaintScreen {offerId}</Text>
    </View>
  );
}

const styles = StyleSheet.create({});
