import { NewTag, Tag } from "@/types";
import { supabase } from "@/utils/supabase";


export const tagsApi = {
    fetchTags: async (): Promise<Tag[]> => {
        const { data, error } = await supabase
            .from("tags")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) throw error;
        return data || [];
    },

    createTags: async (tags: NewTag[]): Promise<Tag[]> => {
      console.log("CREATING TAGS", tags);
        const { data, error } = await supabase
            .from("tags")
            .upsert([...tags], { onConflict: "label" })
            .select()

        if (error) throw error;
        return data || [];
    },

    getTag: async (tagId: number): Promise<Tag | null>  => {
        const { data, error } = await supabase
            .from("tags")
            .select("*")
            .eq("id", tagId)
            .single();
        if (error) return null;
        return data as Tag;
    }
};