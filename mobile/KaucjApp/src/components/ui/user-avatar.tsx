import { colors } from "@/src/theme";
import { Ionicons } from "@expo/vector-icons";
import { Image, StyleSheet, View } from "react-native";

export default function BottleCapAvatar({ imageUrl }: { imageUrl?: string }) {
  return (
    <View style={styles.capOuter}>
      <View style={styles.capInner}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.avatarImage} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="person" size={40} color={colors.primary.base} />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  capOuter: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 6,
    borderColor: colors.primary.base,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.primary.light,
    marginBottom: 16,
    shadowColor: colors.primary.dark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  capInner: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: colors.background.card,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: colors.background.card,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarPlaceholder: {
    flex: 1,
    backgroundColor: colors.primary.light,
    justifyContent: "center",
    alignItems: "center",
  },
});
