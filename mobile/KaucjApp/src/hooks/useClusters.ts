import { useMemo } from "react";
import { Dimensions } from "react-native";
import Supercluster from "supercluster";
import type { Region } from "react-native-maps";
import type { Offer } from "@/src/lib/mockData";

const SCREEN_WIDTH = Dimensions.get("window").width;

// ── Tuning ────────────────────────────────────────────────────────────────────
const CLUSTER_RADIUS = 55;
const MAX_ZOOM = 18;

// ── Types ─────────────────────────────────────────────────────────────────────
export type AdPoint = Supercluster.PointFeature<Offer>;

export interface ClusterProps {
  totalBottles: number;
}

export type ClusterPoint = Supercluster.ClusterFeature<ClusterProps>;
export type ClusterOrPoint = AdPoint | ClusterPoint;

// ── Helpers ───────────────────────────────────────────────────────────────────
function regionToZoom(region: Region): number {
  const zoom = Math.log2((360 * (SCREEN_WIDTH / 256)) / region.longitudeDelta);
  return Math.max(0, Math.min(MAX_ZOOM, Math.round(zoom)));
}

function regionToBBox(region: Region): [number, number, number, number] {
  if (region.longitudeDelta > 60) return [-180, -90, 180, 90];

  const padLat = region.latitudeDelta;
  const padLng = region.longitudeDelta;

  const minLng = Math.max(-180, region.longitude - region.longitudeDelta / 2 - padLng);
  const minLat = Math.max(-90, region.latitude - region.latitudeDelta / 2 - padLat);
  const maxLng = Math.min(180, region.longitude + region.longitudeDelta / 2 + padLng);
  const maxLat = Math.min(90, region.latitude + region.latitudeDelta / 2 + padLat);

  return [minLng, minLat, maxLng, maxLat];
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useClusters(ads: Offer[], region: Region): ClusterOrPoint[] {
  const index = useMemo(() => {
    const sc = new Supercluster<Offer, ClusterProps>({
      radius: CLUSTER_RADIUS,
      maxZoom: MAX_ZOOM,
      minZoom: 0,
      map: (props) => ({
        totalBottles: props.items.reduce((sum, i) => sum + i.quantity, 0),
      }),
      reduce: (acc, props) => {
        acc.totalBottles += props.totalBottles;
      },
    });

    sc.load(
      ads.map((ad) => ({
        type: "Feature" as const,
        geometry: {
          type: "Point" as const,
          coordinates: [ad.longitude, ad.latitude],
        },
        properties: ad,
      })),
    );

    return sc;
  }, [ads]);

  return useMemo(() => {
    if (!region?.longitudeDelta) return [];
    return index.getClusters(regionToBBox(region), regionToZoom(region)) as ClusterOrPoint[];
  }, [index, region]);
}

// ── Type guard ────────────────────────────────────────────────────────────────
export function isCluster(item: ClusterOrPoint): item is ClusterPoint {
  return "cluster" in item.properties && item.properties.cluster === true;
}