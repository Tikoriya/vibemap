import googleApi from "@/lib/services/google";
import { useQuery } from "@tanstack/react-query";

export const useAutoComplete = (query: string) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['autocomplete', query],
    queryFn: () => googleApi.getAutocomplete(query),
  });
  return { data, isLoading, error };
}
