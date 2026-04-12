import { trpc } from "@/lib/trpc";

/**
 * Hook to check if a feature flag is enabled
 * @param flagName - The name of the feature flag to check
 * @returns Object with isEnabled status and loading state
 */
export function useFeatureFlag(flagName: string) {
  const { data: isEnabled, isLoading } = trpc.featureFlags.isEnabled.useQuery(
    { flagName },
    {
      staleTime: 5 * 60 * 1000, // Cache for 5 minutes
      gcTime: 10 * 60 * 1000, // Garbage collect after 10 minutes
    }
  );

  return {
    isEnabled: isEnabled ?? false,
    isLoading,
  };
}

/**
 * Hook to get all feature flags
 * @returns Object with all feature flags and loading state
 */
export function useAllFeatureFlags() {
  const { data: flags, isLoading } = trpc.featureFlags.getAll.useQuery(undefined, {
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000, // Garbage collect after 10 minutes
  });

  return {
    flags: flags ?? {},
    isLoading,
  };
}
