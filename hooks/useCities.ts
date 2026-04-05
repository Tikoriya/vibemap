import citiiesApi from "@/lib/supabase/citites";
import { CityWithCount, NewCity } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useCities = () => {
  const queryClient = useQueryClient();

  const { data, error, isLoading, refetch } = useQuery<CityWithCount[], Error>({
    queryKey: ['cities'],
    queryFn: async () => {
      const cities = await citiiesApi.fetchCities();
      return cities.map((city) => ({
        ...city,
        spotCount: city.spots?.length ?? 0,
      }));
    },
  });

  const createCityMutation = useMutation({
    mutationFn: async (city: NewCity) => {
      return await citiiesApi.createCity(city);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cities'] });
    },
  });

  return {
    cities: data,
    error,
    isLoading,
    refetchCity: refetch,
    createCity: createCityMutation.mutateAsync,
  };
};
