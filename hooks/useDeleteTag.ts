import { useAuthStore } from "@/lib/store";
import { tagsApi } from "@/lib/supabase/tags";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useDeleteTag = () => {
    const queryClient = useQueryClient();
    const user = useAuthStore((state) => state.user);

    return useMutation({
        mutationFn: (tagId: number) => tagsApi.deleteTag(tagId),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ["tags", user?.id] });
            // A deleted tag is also unlinked from spots, so refresh spot views.
            void queryClient.invalidateQueries({ queryKey: ["spot"] });
            void queryClient.invalidateQueries({ queryKey: ["spots"] });
        },
        onError: (error) => {
            console.error("Error deleting tag:", error);
        },
    });
};
