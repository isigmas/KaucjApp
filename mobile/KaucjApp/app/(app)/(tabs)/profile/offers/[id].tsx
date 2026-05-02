import OfferDetailScreen from "@/src/components/profile/my-offers/offer-detail-screen";
import ErrorState from "@/src/components/states/error-state";
import { useLocalSearchParams } from "expo-router";

export default function OfferDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const offerId = Number(id);

  if (!Number.isFinite(offerId)) {
    return (
      <ErrorState
        title="Wystąpił błąd"
        onRetry={() => {}}
        message="Nieprawidłowy ID oferty"
      />
    );
  }

  return <OfferDetailScreen offerId={offerId} />;
}
