import { SPOTS_PAGE_SIZE, SpotsCursor, spotsApi } from '@/lib/supabase/spots';
import { SpotWithTags } from '@/types';
import {
    InfiniteData,
    keepPreviousData,
    QueryKey,
    useInfiniteQuery,
} from '@tanstack/react-query';

type UseSpotsParams = {
    cityId: string;
    selectedTagIds: number[];
    matchAll?: boolean;
};

export const useSpots = (params: UseSpotsParams) => {
    const { cityId, selectedTagIds, matchAll = false } = params;
    const cityIdInt = parseInt(cityId);

    const query = useInfiniteQuery<
        SpotWithTags[],
        Error,
        InfiniteData<SpotWithTags[], SpotsCursor | undefined>,
        QueryKey,
        SpotsCursor | undefined
    >({
        queryKey: ['spots', cityId, selectedTagIds, matchAll],
        initialPageParam: undefined,
        queryFn: ({ pageParam }) =>
            spotsApi.filterCitySpots(
                cityIdInt,
                selectedTagIds,
                matchAll,
                SPOTS_PAGE_SIZE,
                pageParam,
            ),
        getNextPageParam: (lastPage) => {
            if (lastPage.length < SPOTS_PAGE_SIZE) return undefined;
            const lastSpot = lastPage[lastPage.length - 1];
            return { createdAt: lastSpot.created_at, id: lastSpot.id };
        },
        enabled: !!cityId,
        retry: 1,
        placeholderData: keepPreviousData,
    });

    return {
        spots: query.data?.pages.flat() ?? [],
        isLoading: query.isLoading,
        isRefetching: query.isPlaceholderData,
        error: query.error,
        refetch: query.refetch,
        fetchNextPage: query.fetchNextPage,
        hasNextPage: query.hasNextPage,
        isFetchingNextPage: query.isFetchingNextPage,
    };
};
