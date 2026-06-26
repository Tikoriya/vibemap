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
        const normalized = tags
            .map((t) => ({ ...t, label: t.label.trim() }))
            .filter((t) => t.label.length > 0);
        if (normalized.length === 0) return [];

        // Reuse a user's existing tag whenever the label matches case-insensitively
        // so a freeform "brunch" resolves to the seeded "Brunch" instead of
        // creating a second row. Uniqueness is enforced on (user_id, lower(label)).
        const { data: existing, error: fetchError } = await supabase
            .from("tags")
            .select("*")
            .eq("user_id", userId);
        if (fetchError) throw fetchError;

        const existingByLabel = new Map(
            (existing ?? []).map((t) => [t.label.toLowerCase(), t]),
        );

        const result: Tag[] = [];
        const toInsert: NewTag[] = [];
        const seen = new Set<string>();

        for (const tag of normalized) {
            const key = tag.label.toLowerCase();
            if (seen.has(key)) continue;
            seen.add(key);

            const match = existingByLabel.get(key);
            if (match) {
                result.push(match);
            } else {
                toInsert.push({ ...tag, user_id: userId });
            }
        }

        if (toInsert.length > 0) {
            const { data: inserted, error } = await supabase
                .from("tags")
                .insert(toInsert)
                .select();
            if (error) throw error;
            result.push(...(inserted ?? []));
        }

        return result;
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