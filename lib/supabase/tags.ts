import { Tag } from "@/types";
import { supabase } from "@/utils/supabase";


export const tagsApi = {
  // Create multiple tags, returns the created tag objects
  async createTags(tagNames: string[]): Promise<Tag[]> {
    if (tagNames.length === 0) return [];
    // Remove duplicates
    const uniqueNames = Array.from(new Set(tagNames));

    console.log("Creating tags:", uniqueNames);

    // Insert tags, ignoring duplicates (if your table has unique constraint on name)
    const { data, error } = await supabase
      .from("tags")
      .upsert(
        uniqueNames.map((label) => ({ label})),
        { onConflict: "label" }
      )
      .select();

    if (error) {
      console.error("Error creating tags:", error);
      return [];
    }
    return data as Tag[];
  },

  // Get tags by names
  async getTagsByNames(tagNames: string[]): Promise<Tag[]> {
    if (tagNames.length === 0) return [];
    const { data, error } = await supabase
      .from("tags")
      .select("*")
      .in("label", tagNames);

    if (error) {
      console.error("Error fetching tags:", error);
      return [];
    }
    return data as Tag[];
  },
};