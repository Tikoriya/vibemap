import { supabase } from "@/utils/supabase";

const BUCKET = "spot-photos";

async function uploadBytes(
  spotId: number,
  position: number,
  bytes: Uint8Array,
): Promise<string> {
  const storagePath = `${spotId}/${position}-${Date.now()}.jpg`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, bytes, { contentType: "image/jpeg", upsert: false });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
  return data.publicUrl;
}

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
  return uploadBytes(spotId, position, new Uint8Array(arrayBuffer));
}

export async function uploadPhotoFromUri(
  spotId: number,
  uri: string,
  position: number,
): Promise<string> {
  const response = await fetch(uri);
  const arrayBuffer = await response.arrayBuffer();
  return uploadBytes(spotId, position, new Uint8Array(arrayBuffer));
}

export async function deletePhotosFromStorage(urls: string[]): Promise<void> {
  const paths = urls
    .map((url) => url.split(`/${BUCKET}/`)[1])
    .filter((path): path is string => Boolean(path));

  if (paths.length === 0) return;
  await supabase.storage.from(BUCKET).remove(paths);
}
