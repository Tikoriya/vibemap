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

    // Dedupe is enforced by the DB: the upsert_tags RPC inserts only the missing
    // labels (on conflict (user_id, lower(label)) do nothing) and returns the
    // canonical row for each requested label. A freeform "brunch" therefore
    // resolves to the seeded "Brunch" without a client-side read-modify-write.
    createTags: async (tags: NewTag[], userId: string): Promise<Tag[]> => {
        const normalized = tags
            .map((tag) => ({ label: tag.label.trim(), icon: tag.icon ?? null }))
            .filter((tag) => tag.label.length > 0);
        if (normalized.length === 0) return [];

        const { data, error } = await supabase.rpc("upsert_tags", {
            p_user_id: userId,
            p_tags: normalized,
        });
        if (error) throw error;
        return data ?? [];
    },

    // Distinct tags attached to spots in a city, computed in Postgres (city_tags)
    // rather than fetching every spot and flatMapping its tags on the client.
    fetchCityTags: async (cityId: number): Promise<Tag[]> => {
        const { data, error } = await supabase.rpc("city_tags", {
            p_city_id: cityId,
        });
        if (error) throw error;
        return data ?? [];
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