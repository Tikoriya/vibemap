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

async function invokeParseLink(
  body: { url: string } | { image: string; mimeType?: string },
  fallbackMessage: string,
): Promise<ImportedSpot> {
  const { data, error } = await supabase.functions.invoke("parse-link", {
    body,
  });

  if (error) {
    if (error instanceof FunctionsHttpError) {
      const message = await readFunctionErrorMessage(error);
      if (message) throw new Error(message);
    }
    throw new Error(error.message ?? fallbackMessage);
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  return data as ImportedSpot;
}

export async function importFromLink(url: string): Promise<ImportedSpot> {
  return invokeParseLink({ url }, "Failed to import from link");
}

// Reads a place out of a screenshot (e.g. an Instagram post) via Gemini Vision.
// `image` is base64 — either a bare string or a data URL (data:image/...;base64,...).
export async function importFromImage(
  image: string,
  mimeType?: string,
): Promise<ImportedSpot> {
  return invokeParseLink({ image, mimeType }, "Failed to import from screenshot");
}
