import { useAuthStore } from "@/lib/store";
import { tagsApi } from "@/lib/supabase/tags";
import { NewTag } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useCreateTag = () => {
    const queryClient = useQueryClient();
    const user = useAuthStore((state) => state.user);

    return useMutation({
        mutationFn: (tags: NewTag[]) => {
            if (!user?.id) throw new Error("Not authenticated");
            return tagsApi.createTags(tags, user.id);
        },
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ['tags', user?.id] });
        },
        onError: (error) => {
            console.error("Error creating tag:", error);
        },
    });
}