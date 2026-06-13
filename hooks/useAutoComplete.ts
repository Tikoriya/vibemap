import googleApi from "@/lib/services/google";
import { useQuery } from "@tanstack/react-query";

export const useAutoComplete = (query: string) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['autocomplete', query],
    queryFn: () => googleApi.getAutocomplete(query),
    enabled: query.length >= 2,
  });
  return { data, isLoading, error };
}
