import { City, NewCity } from "@/types";
import { supabase } from "../../utils/supabase";

const citiesApi = {
  fetchCities: async (): Promise<City[]> => {
  console.log("FETCHING CITIES");
  const { data, error } = await supabase
    .from('cities')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];

},
  createCity: async (city: NewCity): Promise<City[]> => {
    const { data, error } = await supabase
      .from('cities')
      .insert([city]);

    if (error) throw error;
    return data || [];
  },

  getCity: async (cityId: number): Promise<City | null>  => {
      const { data, error } = await supabase
        .from("cities")
        .select("*")
        .eq("id", cityId)
        .single();
      if (error) return null;
      return data as City;
    }
}

export default citiesApi;