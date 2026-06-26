import { tagsApi } from '@/lib/supabase/tags';
import { Tag } from '@/types';
import { useQuery } from '@tanstack/react-query';

export const useCityTags = (cityId: string) => {
    const cityIdInt = parseInt(cityId);

    const { data, isLoading, error } = useQuery<Tag[], Error>({
        queryKey: ['city-tags', cityId],
        queryFn: () => tagsApi.fetchCityTags(cityIdInt),
        enabled: !!cityId,
        retry: 1,
    });

    return {
        tags: data ?? [],
        isLoading,
        error,
    };
};
