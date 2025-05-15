import { NewSpotTag } from "@/types";
import { supabase } from "@/utils/supabase";

export const tagsSpotsApi = {
    fetchTagsSpots: async (spotId: number): Promise<any[]> => {
        const { data, error } = await supabase
            .from("spot_tags")
            .select("*, tags:tags(*)")
            .eq("spot_id", spotId)
            .order("created_at", { ascending: false });

        if (error) throw error;
        return data || [];
    },

    createTagsSpots: async (spotTagLinks: NewSpotTag[]): Promise<NewSpotTag[]> => {
        const { data, error } = await supabase
            .from("spot_tags")
            .upsert(spotTagLinks, {onConflict: 'spot_id, tag_id' })
            .select();

        if (error) throw error;
        return data || [];
    },
}