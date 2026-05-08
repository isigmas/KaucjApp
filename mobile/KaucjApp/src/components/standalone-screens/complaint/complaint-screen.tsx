import React, { useState } from "react";
import {
  StyleSheet,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { colors, spacing } from "@/src/theme";
import { ComplaintFormValues, complaintSchema } from "@/src/types";
import ComplaintSection from "./components/complaint-section";
import ComplaintReasonDropdown from "./components/dropdown";
import ComplainMessageField from "./components/message-field";
import ComplaintFooter from "./components/complaint-footer";
import ComplaintSuccessView from "./components/succeess-view";

interface ComplaintScreenProps {
  offerId: string;
}

export default function ComplaintScreen({ offerId }: ComplaintScreenProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const { control, handleSubmit } = useForm<ComplaintFormValues>({
    resolver: zodResolver(complaintSchema),
    defaultValues: { complaintReason: undefined, message: "" },
  });

  const onSubmit = async (data: ComplaintFormValues) => {
    setIsLoading(true);
    const body = {
      complaintReason: data.complaintReason,
      message: data.message || null,
    };
    //  API
    console.log(`[ComplaintDTO] POST /api/offers/${offerId}/complaints`, body);
    await new Promise((r) => setTimeout(r, 1200));
    setIsLoading(false);
    setSubmitted(true);
  };

  if (submitted) {
    return <ComplaintSuccessView onClose={() => router.back()} />;
  }

  return (
    <ComplaintScreenWrapper>
      <ComplaintSection
        title="Powód zgłoszenia"
        hint="Wybierz kategorię, która najlepiej opisuje problem"
      >
        <ComplaintReasonDropdown control={control} />
      </ComplaintSection>

      <ComplaintSection
        title="Wiadomość"
        hint="Opisz szczegółowo napotkany problem"
      >
        <ComplainMessageField control={control} />
      </ComplaintSection>

      <ComplaintFooter
        onSubmit={handleSubmit(onSubmit)}
        isLoading={isLoading}
      />
    </ComplaintScreenWrapper>
  );
}

function ComplaintScreenWrapper({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();

  return (
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
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.background.card,
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: colors.background.card,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.md,
  },
});
