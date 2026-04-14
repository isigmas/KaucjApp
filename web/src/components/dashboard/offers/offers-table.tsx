import { MapPin } from "lucide-react";
import { Offer } from "@/types";
import { formatDate, formatCurrency, formatNumber } from "@/lib/formatters";
import OfferStatusBadge from "./status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface OffersTableProps {
  offers: Offer[];
}

export function OffersTable({ offers }: OffersTableProps) {
  return (
    <div className="p-2 rounded-4xl border bg-white shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-semibold">ID i data</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="font-semibold">Lokalizacja</TableHead>
            <TableHead className="font-semibold text-right">
              Ilość opakowań
            </TableHead>
            <TableHead className="font-semibold text-right">
              Piniondze
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {offers.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="h-24 text-center text-muted-foreground"
              >
                Brak ofert w bazie.
              </TableCell>
            </TableRow>
          ) : (
            offers.map((offer) => (
              <TableRow key={offer.offer_id} className="transition-colors">
                <TableCell>
                  <div className="font-medium text-gray-900">
                    #{offer.offer_id.toString().slice(-6)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {formatDate(offer.created_at)}
                  </div>
                </TableCell>

                <TableCell>
                  <OfferStatusBadge status={offer.status} />
                </TableCell>

                <TableCell>
                  <div className="flex items-start gap-2 max-w-75">
                    <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="truncate">
                      <p
                        className="text-sm text-gray-900 truncate"
                        title={offer.pickup_address}
                      >
                        {offer.pickup_address || "Brak adresu"}
                      </p>
                      <p
                        className="text-xs text-muted-foreground truncate"
                        title={offer.pickup_instructions}
                      >
                        {offer.pickup_instructions || "Brak instrukcji"}
                      </p>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {formatNumber(offer.total_quantity)} sztuk
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 flex justify-end gap-2">
                    <span>plastiki x {offer.plastic_quantity}</span> |
                    <span>puszki x {offer.can_quantity}</span>
                  </div>
                </TableCell>

                <TableCell className="text-right">
                  <div className="text-sm font-medium text-green-600">
                    + {formatCurrency(offer.total_income)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    cena sprzedaży: {formatCurrency(offer.total_prize)}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
