import { supabase } from "@/utils/supabase";

export type ImportedSpot = {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  notes: string | null;
  sourceUrl: string;
  websiteUri: string | null;
  phoneNumber: string | null;
  photos: string[];
};

export async function importFromLink(url: string): Promise<ImportedSpot> {
  const { data, error } = await supabase.functions.invoke("parse-link", {
    body: { url },
  });

  if (error) {
    throw new Error(error.message ?? "Failed to import from link");
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  return data as ImportedSpot;
}
