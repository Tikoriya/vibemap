import { NewTag, Tag } from "@/types";
import { supabase } from "@/utils/supabase";


export const tagsApi = {
    fetchTags: async (userId: string): Promise<Tag[]> => {
        const { data, error } = await supabase
            .from("tags")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false });

        if (error) throw error;
        return data || [];
    },

    createTags: async (tags: NewTag[], userId: string): Promise<Tag[]> => {
        const { data, error } = await supabase
            .from("tags")
            .upsert(tags.map((t) => ({ ...t, user_id: userId })), { onConflict: "label,user_id" })
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
    },

    updateTag: async (
        tagId: number,
        updates: { label?: string; icon?: string | null },
    ): Promise<Tag> => {
        const { data, error } = await supabase
            .from("tags")
            .update(updates)
            .eq("id", tagId)
            .select()
            .single();

        if (error) throw error;
        return data as Tag;
    },

    deleteTag: async (tagId: number): Promise<void> => {
        // spot_tags references tags without ON DELETE CASCADE, so the join rows
        // must be removed before the tag itself can be deleted.
        const { error: linkError } = await supabase
            .from("spot_tags")
            .delete()
            .eq("tag_id", tagId);
        if (linkError) throw linkError;

        const { error } = await supabase
            .from("tags")
            .delete()
            .eq("id", tagId);
        if (error) throw error;
    },
};