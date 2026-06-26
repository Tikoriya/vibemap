import { useAuthStore } from "@/lib/store";
import { tagsApi } from "@/lib/supabase/tags";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type UpdateTagInput = {
    tagId: number;
    updates: { label?: string; icon?: string | null };
};

export const useUpdateTag = () => {
    const queryClient = useQueryClient();
    const user = useAuthStore((state) => state.user);

    return useMutation({
        mutationFn: ({ tagId, updates }: UpdateTagInput) =>
            tagsApi.updateTag(tagId, updates),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ["tags", user?.id] });
        },
        onError: (error) => {
            console.error("Error updating tag:", error);
        },
    });
};
