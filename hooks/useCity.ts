import citiesApi from "@/lib/supabase/citites";
import { spotsApi } from "@/lib/supabase/spots";
import { City, Spot } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useCity(cityId: string) {
  const cityIdInt = parseInt(cityId);
  const queryClient = useQueryClient();
  // Load city and its spots
  
  const {data, error, isLoading, refetch} = useQuery<City | null, Error>({
    queryKey: ["city", cityId],
    queryFn: async () => { 
      const city = await citiesApi.getCity(cityIdInt);
      return city;
    },
    enabled: !!cityId,
   })

   const {data: citySpots, isLoading: isLoadingSpots, error: spotsError } = useQuery<Spot[], Error>({
    queryKey: ["spots", cityId],
    queryFn: async () => {
        console.log("calling spots");
      const spots = await spotsApi.fetchSpots(cityIdInt);
      return spots;
    },
    enabled: !!cityId,
    retry: 1,
   })

   const {mutateAsync: mutateDeleteCity, isPending: isPendingDeleteCity} = useMutation({
    mutationFn: async (deleteId: number) => {
      return await citiesApi.deleteCity(deleteId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cities"] });
    },
  });
    
    return {
        city: data,
        error,
        isLoading,
        refetchCity: refetch,
        spots: citySpots,
        isLoadingSpots,
        spotsError,
        deleteCity: mutateDeleteCity,
    };
}