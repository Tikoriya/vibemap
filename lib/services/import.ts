import { supabase } from "@/utils/supabase";
import { FunctionsHttpError } from "@supabase/supabase-js";

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

// supabase-js reports any non-2xx as a generic "non-2xx status code" error and
// puts the real response body on error.context. Pull our { error } message out.
async function readFunctionErrorMessage(
  error: FunctionsHttpError,
): Promise<string | null> {
  try {
    const body = await error.context.json();
    return typeof body?.error === "string" ? body.error : null;
  } catch {
    return null;
  }
}

export async function importFromLink(url: string): Promise<ImportedSpot> {
  const { data, error } = await supabase.functions.invoke("parse-link", {
    body: { url },
  });

  if (error) {
    if (error instanceof FunctionsHttpError) {
      const message = await readFunctionErrorMessage(error);
      if (message) throw new Error(message);
    }
    throw new Error(error.message ?? "Failed to import from link");
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  return data as ImportedSpot;
}
