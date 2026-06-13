import { supabase } from "@/utils/supabase";

const BUCKET = "spot-photos";

export async function uploadPhotoFromUrl(
  spotId: number,
  url: string,
  position: number,
): Promise<string> {
  // FileSystem.downloadAsync uses iOS background URL sessions which cannot
  // parse lh3.googleusercontent.com responses. fetch + arrayBuffer uses the
  // foreground network stack and works correctly with these URLs.
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch photo: HTTP ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);

  const storagePath = `${spotId}/${position}-${Date.now()}.jpg`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, uint8Array, { contentType: "image/jpeg", upsert: false });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
  return data.publicUrl;
}
