import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  Modal,
  Platform,
  Keyboard,
  KeyboardAvoidingView,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Reanimated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { colors, rounded, spacing } from "@/src/theme";
import {
  COMPLAINT_REASONS,
  ComplaintFormValues,
  ComplaintReason,
  complaintSchema,
  REASON_LABELS,
} from "@/src/types";

const AnimatedPressable = Reanimated.createAnimatedComponent(Pressable);

interface TriggerLayout {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface DropdownProps {
  value: ComplaintReason | undefined;
  onChange: (val: ComplaintReason) => void;
  error?: string;
}

function ReasonDropdown({ value, onChange, error }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const [layout, setLayout] = useState<TriggerLayout | null>(null);
  const triggerRef = useRef<View>(null);

  const open_ = () => {
    Keyboard.dismiss();
    triggerRef.current?.measureInWindow((x, y, width, height) => {
      setLayout({ x, y, width, height });
      setOpen(true);
      Haptics.selectionAsync();
    });
  };

  const close = () => {
    setOpen(false);
    Haptics.selectionAsync();
  };

  const select = (reason: ComplaintReason) => {
    Haptics.selectionAsync();
    onChange(reason);
    setOpen(false);
  };

  return (
    <View style={styles.dropdownWrapper}>
      {/* Trigger */}
      <Pressable
        ref={triggerRef}
        onPress={open_}
        style={[
          styles.trigger,
          open && styles.triggerActive,
          !!error && styles.triggerError,
        ]}
      >
        <Feather
          name="flag"
          size={18}
          color={error ? colors.status.error : colors.text.muted}
          style={styles.triggerLeadIcon}
        />
        <Text
          style={[styles.triggerText, !value && styles.triggerPlaceholder]}
          numberOfLines={1}
        >
          {value ? REASON_LABELS[value] : "Wybierz powód zgłoszenia"}
        </Text>
        <Feather
          name={open ? "chevron-up" : "chevron-down"}
          size={18}
          color={colors.text.muted}
        />
      </Pressable>

      {/* Floating options overlay */}
      <Modal
        transparent
        visible={open}
        animationType="none"
        statusBarTranslucent
        onRequestClose={close}
      >
        {/* Backdrop — dismiss on tap outside */}
        <Pressable style={StyleSheet.absoluteFill} onPress={close} />

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
              const isSelected = value === reason;
              const isLast = i === COMPLAINT_REASONS.length - 1;
              return (
                <Pressable
                  key={reason}
                  onPress={() => select(reason)}
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

      <Text style={[styles.fieldError, { opacity: error ? 1 : 0 }]}>
        {error ?? " "}
      </Text>
    </View>
  );
}

// ── Submit button ─────────────────────────────────────────────────────────────

function SubmitButton({
  onPress,
  isLoading,
}: {
  onPress: () => void;
  isLoading: boolean;
}) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      style={[styles.submitButton, animStyle]}
      onPressIn={() => {
        scale.value = withSpring(0.97, { damping: 15 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 15 });
      }}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        if (!isLoading) onPress();
      }}
      disabled={isLoading}
    >
      <Feather name="send" size={17} color={colors.text.white} />
      <Text style={styles.submitText}>Wyślij zgłoszenie</Text>
    </AnimatedPressable>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────

interface ComplaintScreenProps {
  offerId: string;
}

export default function ComplaintScreen({ offerId }: ComplaintScreenProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [messageCount, setMessageCount] = useState(0);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ComplaintFormValues>({
    resolver: zodResolver(complaintSchema),
    defaultValues: { complaintReason: undefined, message: "" },
  });

  const onSubmit = async (data: ComplaintFormValues) => {
    setIsLoading(true);
    const body = {
      complaintReason: data.complaintReason,
      message: data.message || null,
    };
    // Mock API — logs expected ComplaintDTO payload
    console.log(`[ComplaintDTO] POST /api/offers/${offerId}/complaints`, body);
    await new Promise((r) => setTimeout(r, 1200));
    setIsLoading(false);
    setSubmitted(true);
  };

  // ── Success state ──────────────────────────────────────────────────────────

  if (submitted) {
    return (
      <View
        style={[
          styles.successContainer,
          { paddingBottom: insets.bottom + spacing.xl },
        ]}
      >
        <View style={styles.successIconWrap}>
          <Feather name="check-circle" size={52} color={colors.primary.base} />
        </View>
        <Text style={styles.successTitle}>Zgłoszenie wysłane</Text>
        <Text style={styles.successSubtitle}>
          Dziękujemy za zgłoszenie. Nasz zespół sprawdzi je w ciągu 24 godzin.
        </Text>
        <Pressable
          onPress={() => {
            Haptics.selectionAsync();
            router.back();
          }}
          style={styles.successClose}
        >
          <Text style={styles.successCloseText}>Zamknij</Text>
        </Pressable>
      </View>
    );
  }

  // ── Form ───────────────────────────────────────────────────────────────────

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={styles.flex}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + spacing.xl },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
      >
        {/* Reason */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Powód zgłoszenia</Text>
          <Text style={styles.sectionHint}>
            Wybierz kategorię, która najlepiej opisuje problem
          </Text>

          <Controller
            control={control}
            name="complaintReason"
            render={({ field: { value, onChange } }) => (
              <ReasonDropdown
                value={value}
                onChange={onChange}
                error={errors.complaintReason?.message}
              />
            )}
          />
        </View>

        {/* Message */}
        <View style={styles.section}>
          <View style={styles.labelRow}>
            <Text style={styles.sectionTitle}>Wiadomość</Text>
          </View>
          <Text style={styles.sectionHint}>
            Opisz szczegółowo napotkany problem
          </Text>

          <Controller
            control={control}
            name="message"
            render={({ field: { value, onChange, onBlur } }) => (
              <View style={styles.textAreaWrapper}>
                <View
                  style={[
                    styles.textAreaContainer,
                    !!errors.message && styles.textAreaContainerError,
                  ]}
                >
                  <TextInput
                    style={styles.textArea}
                    placeholder="Np. oferta zawierała wprowadzające w błąd zdjęcia…"
                    placeholderTextColor={colors.text.muted}
                    value={value}
                    onChangeText={(t) => {
                      onChange(t);
                      setMessageCount(t.length);
                    }}
                    onBlur={onBlur}
                    multiline
                    maxLength={500}
                    textAlignVertical="top"
                  />
                </View>
                <View style={styles.textAreaMeta}>
                  <Text
                    style={[
                      styles.fieldError,
                      { opacity: errors.message ? 1 : 0 },
                    ]}
                  >
                    {errors.message?.message ?? " "}
                  </Text>
                  <Text
                    style={[
                      styles.charCount,
                      messageCount > 450 && styles.charCountNear,
                    ]}
                  >
                    {messageCount}/500
                  </Text>
                </View>
              </View>
            )}
          />
        </View>

        <View style={styles.sectionDivider} />

        {/* Info + Submit */}
        <View style={[styles.section, styles.footerSection]}>
          <View style={styles.infoNote}>
            <Feather
              name="info"
              size={13}
              color={colors.accent.base}
              style={styles.infoIcon}
            />
            <Text style={styles.infoText}>
              Fałszywe zgłoszenia mogą skutkować ograniczeniem dostępu do konta.
            </Text>
          </View>

          <SubmitButton
            onPress={handleSubmit(onSubmit)}
            isLoading={isLoading}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background.card },

  scrollContent: {
    flexGrow: 1,
    backgroundColor: colors.background.card,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.md,
  },
  // Sections
  section: {
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  footerSection: {
    gap: spacing.md,
  },
  sectionDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.status.border,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text.primary,
    letterSpacing: 0.1,
  },
  sectionHint: {
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 18,
    marginBottom: spacing.xs,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  optionalBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: colors.background.main,
    borderRadius: rounded.pill,
    borderWidth: 1,
    borderColor: colors.status.border,
  },
  optionalText: {
    fontSize: 11,
    color: colors.text.muted,
    fontWeight: "500",
  },

  // Field error
  fieldError: {
    fontSize: 12,
    color: colors.status.error,
    minHeight: 16,
  },

  // Dropdown
  dropdownWrapper: { gap: 0 },
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

  // Floating options list (positioned absolutely in Modal)
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

  // Textarea
  textAreaWrapper: { gap: 0 },
  textAreaContainer: {
    borderRadius: rounded.xl,
    borderWidth: 1.5,
    borderColor: colors.status.border,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    minHeight: 130,
  },
  textAreaContainerError: {
    borderColor: colors.status.error,
  },
  textArea: {
    fontSize: 15,
    color: colors.text.primary,
    lineHeight: 22,
    minHeight: 100,
  },
  textAreaMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginTop: 4,
    paddingHorizontal: 2,
  },
  charCount: {
    fontSize: 12,
    color: colors.text.muted,
  },
  charCountNear: {
    color: colors.status.warning,
    fontWeight: "600",
  },

  // Info note
  infoNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: colors.accent.light,
    borderRadius: rounded.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    gap: spacing.xs + 2,
  },
  infoIcon: { marginTop: 2 },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: colors.accent.dark,
    lineHeight: 17,
  },

  // Submit
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 56,
    backgroundColor: colors.primary.dark,
    borderRadius: rounded.apple,
    gap: spacing.sm,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary.dark,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.28,
        shadowRadius: 12,
      },
      android: { elevation: 5 },
    }),
  },
  submitText: {
    color: colors.text.white,
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.3,
  },

  // Success
  successContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    backgroundColor: colors.background.card,
    gap: spacing.md,
  },
  successIconWrap: {
    width: 88,
    height: 88,
    borderRadius: rounded.apple,
    backgroundColor: colors.primary.light,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xs,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.text.primary,
    letterSpacing: -0.3,
  },
  successSubtitle: {
    fontSize: 15,
    color: colors.text.secondary,
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 280,
  },
  successClose: {
    marginTop: spacing.sm,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.xl,
    borderRadius: rounded.apple,
    backgroundColor: colors.primary.light,
  },
  successCloseText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.primary.dark,
  },
});
