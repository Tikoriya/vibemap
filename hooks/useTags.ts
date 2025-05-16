import { tagsApi } from '@/lib/supabase/tags';
import { Tag } from '@/types';
import { useQuery } from '@tanstack/react-query';

export const useTags = () => {
  
    const {data, isLoading, error} = useQuery<Tag[], Error>({
        queryKey: ['tags'],
        queryFn: async () => {
            const tags = await tagsApi.fetchTags();
            return tags;
        },
        retry: 1,
    })
    

    return {
        tags: data,
        isLoading,
        error,
    }
}
