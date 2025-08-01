import { useQuery } from "@tanstack/react-query";

export interface DashboardReviewsData {
  totalReviews: number;
  positiveReviews: number;
  neutralReviews: number;
  negativeReviews: number;
  positivePercentage: number;
}

export function useDashboardReviews(userkey: string | undefined) {
  return useQuery({
    queryKey: ['/api/dashboard-reviews', userkey],
    enabled: !!userkey,
    staleTime: 30 * 1000, // 30 seconds for faster loading
    gcTime: 60 * 1000, // 1 minute
    retry: 0,
    networkMode: 'online',
  });
}