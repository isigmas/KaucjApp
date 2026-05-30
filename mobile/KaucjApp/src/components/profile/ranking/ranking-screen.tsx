import { useInfiniteRanking } from "@/src/api/hooks/use-ranking";

export default function RankingScreen() {
  const { data } = useInfiniteRanking();

  return null;
}
