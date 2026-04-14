"use client";

import { useAllOffers } from "@/hooks/use-offer";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { OffersHeader } from "@/components/dashboard/offers/offers-header";
import { OffersTable } from "@/components/dashboard/offers/offers-table";

export default function OffersPage() {
  const { data: offers, isLoading, error } = useAllOffers();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
        <p className="text-gray-500 font-medium">Ładowanie ofert...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="max-w-2xl mx-auto mt-8">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Failed to load offers</AlertTitle>
        <AlertDescription>
          {error.message ||
            "An unexpected error occurred while fetching the data."}
        </AlertDescription>
      </Alert>
    );
  }

  const validOffers = offers || [];

  return (
    <div className="space-y-6">
      <OffersHeader totalCount={validOffers.length} />
      <OffersTable offers={validOffers} />
    </div>
  );
}
