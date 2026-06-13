import { useAuthStore } from '@/lib/store';
import { tagsApi } from '@/lib/supabase/tags';
import { Tag } from '@/types';
import { useQuery } from '@tanstack/react-query';

export const useTags = () => {
    const user = useAuthStore((state) => state.user);

    const {data, isLoading, error} = useQuery<Tag[], Error>({
        queryKey: ['tags', user?.id],
        queryFn: async () => {
            if (!user?.id) return [];
            return await tagsApi.fetchTags(user.id);
        },
        enabled: !!user?.id,
        retry: 1,
    });

    return {
        tags: data,
        isLoading,
        error,
    }
}
