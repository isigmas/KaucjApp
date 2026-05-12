import React, { useState } from "react";
import { StyleSheet, ScrollView, View } from "react-native";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { colors, spacing } from "@/src/theme";
import { Complainant, ComplaintPayload } from "@/src/types";
import ComplaintSection from "./components/complaint-section";
import ComplaintReasonDropdown from "./components/dropdown";
import ComplainMessageField from "./components/message-field";
import ComplaintFooter from "./components/complaint-footer";
import { useComplaintOffer } from "@/src/api/hooks/use-offer";
import { ComplaintFormValues, complaintSchema } from "@/src/validation";
import ComplaintSuccessView from "./components/succeess-view";

interface ComplaintScreenProps {
  offerId: string;
  complainiant: Complainant;
}

export default function ComplaintScreen({
  offerId,
  complainiant,
}: ComplaintScreenProps) {
  const router = useRouter();
  const [isSuccess, setIsSuccess] = useState(false);
  const { mutate: createComplaint, isPending } = useComplaintOffer(
    Number(offerId),
  );

  const { control, handleSubmit } = useForm<ComplaintFormValues>({
    resolver: zodResolver(complaintSchema),
    defaultValues: { complaintReason: undefined, message: "" },
  });

  const onSubmit = async (data: ComplaintFormValues) => {
    const body = {
      complaintReason: data.complaintReason,
      message: data.message,
    } as ComplaintPayload;
    createComplaint(body, {
      onSuccess: () => {
        setIsSuccess(true);
      },
    });
  };

  if (isSuccess) {
    return (
      <ComplaintSuccessView
        onClose={() => {
          setIsSuccess(false);
          router.back();
        }}
      />
    );
  }

  return (
    <ComplaintScreenWrapper>
      <ComplaintSection
        title="Powód zgłoszenia"
        hint="Wybierz kategorię, która najlepiej opisuje problem"
      >
        <ComplaintReasonDropdown
          control={control}
          complainiant={complainiant}
        />
      </ComplaintSection>

      <ComplaintSection
        title="Wiadomość"
        hint="Opisz szczegółowo napotkany problem"
      >
        <ComplainMessageField control={control} />
      </ComplaintSection>

      <ComplaintFooter
        onSubmit={handleSubmit(onSubmit)}
        isLoading={isPending}
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
