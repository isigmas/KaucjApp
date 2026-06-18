import {
  View,
  Text,
  StyleSheet,
  Pressable,
  GestureResponderEvent,
} from "react-native";
import { Control, Controller, FieldValues, Path } from "react-hook-form";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as WebBrowser from "expo-web-browser";

import { colors, rounded, spacing } from "@/src/theme";

type AuthCheckboxProps<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
};

export function AuthCheckbox<T extends FieldValues>({
  control,
  name,
}: AuthCheckboxProps<T>) {
  const openTerms = async (event: GestureResponderEvent) => {
    event.stopPropagation();
    Haptics.selectionAsync();
    await WebBrowser.openBrowserAsync("https://kaucjapp.pl/terms");
  };

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value }, fieldState: { error } }) => {
        const isChecked = Boolean(value);

        return (
          <View style={styles.wrapper}>
            <Pressable
              onPress={() => {
                Haptics.selectionAsync();
                onChange(!isChecked);
              }}
              style={styles.row}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: isChecked }}
              hitSlop={8}
            >
              <View
                style={[
                  styles.box,
                  isChecked && styles.boxChecked,
                  error && !isChecked && styles.boxError,
                ]}
              >
                {isChecked && (
                  <Feather name="check" size={14} color={colors.text.white} />
                )}
              </View>

              <Text style={styles.label}>
                Akceptuję{" "}
                <Text
                  style={styles.link}
                  onPress={openTerms}
                  accessibilityRole="link"
                  accessibilityHint="Otwiera regulamin i politykę prywatności w przeglądarce"
                >
                  regulamin i politykę prywatności
                </Text>
              </Text>
            </Pressable>

            <Text style={[styles.errorText, { opacity: error ? 1 : 0 }]}>
              {error?.message || " "}
            </Text>
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: spacing.xs,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    justifyContent: "center",
  },
  box: {
    width: 22,
    height: 22,
    borderRadius: rounded.sm,
    borderWidth: 1.5,
    borderColor: colors.status.border,
    backgroundColor: colors.background.card,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  boxChecked: {
    borderColor: colors.primary.dark,
    backgroundColor: colors.primary.dark,
  },
  boxError: {
    borderColor: colors.status.error,
  },
  label: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: colors.text.secondary,
  },
  link: {
    color: colors.primary.dark,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  errorText: {
    marginBottom: spacing.xs,
    fontSize: 13,
    color: colors.status.error,
    marginLeft: 30,
    minHeight: 18,
  },
});
