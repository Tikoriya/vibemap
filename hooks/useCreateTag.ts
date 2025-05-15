import { tagsApi } from "@/lib/supabase/tags";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useCreateTag = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn:  tagsApi.createTags,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['tags'] });
            console.log("Tags created successfully:", data);
            return data;

        },
        onError: (error) => {
            console.error("Error creating tag:", error);
        },
    });
}