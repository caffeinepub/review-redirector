import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";

export function useGoogleMapsUrl() {
  const { actor, isFetching } = useActor();
  return useQuery<string>({
    queryKey: ["googleMapsUrl"],
    queryFn: async () => {
      if (!actor) return "";
      return actor.getGoogleMapsUrl();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

export function useReviews() {
  const { actor, isFetching } = useActor();
  return useQuery<string[]>({
    queryKey: ["reviews"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getReviews();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateGoogleMapsUrl() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newUrl: string) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateGoogleMapsUrl(newUrl);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["googleMapsUrl"] });
    },
  });
}

export function useUpdateReviews() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newReviews: string[]) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateReviews(newReviews);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
  });
}
