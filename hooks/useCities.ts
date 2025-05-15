import citiiesApi from "@/lib/supabase/citites";
import { City, NewCity } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useCities = () => {
    const queryClient = useQueryClient();
    const { data, error, isLoading, refetch } = useQuery<City[], Error>({
        queryKey: ['cities'],
        queryFn: async () => {
            const cities = await citiiesApi.fetchCities();
            return cities;
        }
    }
    );
    
    const createCityMutation = useMutation({
        mutationFn: async (city: NewCity) => {
            const newCity = await citiiesApi.createCity(city);
            return newCity;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['cities']});
        },
    });
    
    return {
        cities: data,
        error,
        isLoading,
        refetchCity: refetch,
        createCity: createCityMutation.mutate,
    };
}