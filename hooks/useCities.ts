import { useUiPrefsStore } from "@/lib/store";
import citiiesApi from "@/lib/supabase/citites";
import { CityWithCount, NewCity } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";

export const useCities = () => {
  const queryClient = useQueryClient();
  const cityLastOpened = useUiPrefsStore((state) => state.cityLastOpened);

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

  // Order by most-recently-opened (persisted locally), falling back to creation
  // date for cities the user hasn't opened on this device yet.
  const cities = useMemo(() => {
    if (!data) return data;
    return [...data].sort((a, b) => {
      const aOpened = cityLastOpened[String(a.id)] ?? 0;
      const bOpened = cityLastOpened[String(b.id)] ?? 0;
      if (bOpened !== aOpened) return bOpened - aOpened;
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });
  }, [data, cityLastOpened]);

  const createCityMutation = useMutation({
    mutationFn: async (city: NewCity) => {
      return await citiiesApi.createCity(city);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cities'] });
    },
  });

  return {
    cities,
    error,
    isLoading,
    refetchCity: refetch,
    createCity: createCityMutation.mutateAsync,
  };
};
