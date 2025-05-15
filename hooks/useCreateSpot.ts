import { spotsApi } from "@/lib/supabase/spots";
import { useMutation, useQueryClient } from "@tanstack/react-query";

// hooks/useCreateSpot.ts
export const useCreateSpot = (cityId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: spotsApi.createSpot,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spots', cityId] });
    },
    onError: (error) => {
      console.error("Error creating spot:", error);
    },
  });
};
