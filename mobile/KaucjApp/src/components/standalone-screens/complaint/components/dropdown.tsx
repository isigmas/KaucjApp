import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  Platform,
  Keyboard,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { colors, rounded, spacing } from "@/src/theme";
import {
  COMPLAINT_REASONS,
  ComplaintFormValues,
  ComplaintReason,
  REASON_LABELS,
} from "@/src/types";
import { Control, useController } from "react-hook-form";

interface TriggerLayout {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ComplainReasonDropdownProps {
  control: Control<ComplaintFormValues>;
}

export default function ComplainReasonDropdown({
  control,
}: ComplainReasonDropdownProps) {
  const { field, fieldState } = useController({
    name: "complaintReason",
    control,
  });

  const [open, setOpen] = useState(false);
  const [layout, setLayout] = useState<TriggerLayout | null>(null);
  const triggerRef = useRef<View>(null);

  const openDropdown = () => {
    Keyboard.dismiss();
    triggerRef.current?.measureInWindow((x, y, width, height) => {
      setLayout({ x, y, width, height });
      setOpen(true);
      Haptics.selectionAsync();
    });
  };

  const closeDropdown = () => {
    setOpen(false);
    Haptics.selectionAsync();
  };

  const selectReason = (reason: ComplaintReason) => {
    Haptics.selectionAsync();
    field.onChange(reason);
    setOpen(false);
  };

  return (
    <View>
      <Pressable
        ref={triggerRef}
        onPress={openDropdown}
        style={[
          styles.trigger,
          open && styles.triggerActive,
          !!fieldState.error?.message && styles.triggerError,
        ]}
      >
        <Feather
          name="flag"
          size={18}
          color={
            fieldState.error?.message ? colors.status.error : colors.text.muted
          }
          style={styles.triggerLeadIcon}
        />
        <Text
          style={[
            styles.triggerText,
            !field.value && styles.triggerPlaceholder,
          ]}
          numberOfLines={1}
        >
          {field.value
            ? REASON_LABELS[field.value]
            : "Wybierz powód zgłoszenia"}
        </Text>
        <Feather
          name={open ? "chevron-up" : "chevron-down"}
          size={18}
          color={colors.text.muted}
        />
      </Pressable>

      <Modal
        transparent
        visible={open}
        animationType="none"
        statusBarTranslucent
        onRequestClose={closeDropdown}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={closeDropdown} />

        {layout && (
          <View
            style={[
              styles.optionsList,
              {
                top: layout.y + layout.height - 1,
                left: layout.x,
                width: layout.width,
              },
            ]}
          >
            {COMPLAINT_REASONS.map((reason, i) => {
              const isSelected = field.value === reason;
              const isLast = i === COMPLAINT_REASONS.length - 1;
              return (
                <Pressable
                  key={reason}
                  onPress={() => selectReason(reason)}
                  style={({ pressed }) => [
                    styles.optionItem,
                    !isLast && styles.optionDivider,
                    pressed && styles.optionItemPressed,
                  ]}
                >
                  <Text
                    style={[
                      styles.optionText,
                      isSelected && styles.optionTextSelected,
                    ]}
                  >
                    {REASON_LABELS[reason]}
                  </Text>
                  {isSelected && (
                    <Feather
                      name="check"
                      size={16}
                      color={colors.primary.base}
                    />
                  )}
                </Pressable>
              );
            })}
          </View>
        )}
      </Modal>

      <Text
        style={[
          styles.fieldError,
          { opacity: fieldState.error?.message ? 1 : 0 },
        ]}
      >
        {fieldState.error?.message ?? " "}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    height: 54,
    borderRadius: rounded.xl,
    borderWidth: 1.5,
    borderColor: colors.status.border,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  triggerActive: {
    borderColor: colors.primary.base,
  },
  triggerError: {
    borderColor: colors.status.error,
  },
  triggerLeadIcon: { width: 20, textAlign: "center" },
  triggerText: {
    flex: 1,
    fontSize: 15,
    color: colors.text.primary,
  },
  triggerPlaceholder: {
    color: colors.text.muted,
  },
  optionsList: {
    position: "absolute",
    borderWidth: 1.5,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: colors.primary.base,
    borderTopColor: colors.status.border,
    borderBottomLeftRadius: rounded.xl,
    borderBottomRightRadius: rounded.xl,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
      },
      android: { elevation: 8 },
    }),
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: 15,
  },
  optionDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.status.border,
  },
  optionItemPressed: {
    backgroundColor: colors.primary.light,
  },
  optionText: {
    fontSize: 15,
    color: colors.text.primary,
    flex: 1,
  },
  optionTextSelected: {
    color: colors.primary.dark,
    fontWeight: "600",
  },
  fieldError: {
    fontSize: 12,
    color: colors.status.error,
    minHeight: 16,
  },
});
