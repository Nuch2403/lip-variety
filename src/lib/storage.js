import { supabase } from "@/lib/supabaseClient";

// Single source-of-truth for Storage bucket + URL/path normalization
export const BUCKET = "lip-images";

const PUBLIC_MARKER = "/storage/v1/object/public/";

export function isPublicUrl(v) {
  if (!v || typeof v !== "string") return false;
  if (!/^https?:\/\//i.test(v)) return false;
  return v.includes(PUBLIC_MARKER);
}

// Convert Supabase public URL -> storage path (relative inside bucket)
export function extractPath(publicUrl, bucket = BUCKET) {
  if (!publicUrl || typeof publicUrl !== "string") return "";

  // If it's already "bucket/path"
  const maybe = publicUrl.replace(/^\/+/, "");
  if (maybe.startsWith(bucket + "/")) return maybe.slice(bucket.length + 1);

  if (!isPublicUrl(publicUrl)) return "";

  try {
    const url = new URL(publicUrl);
    const idx = url.pathname.indexOf(PUBLIC_MARKER);
    if (idx < 0) return "";

    // after marker: "<bucket>/<path>"
    let rest = url.pathname.slice(idx + PUBLIC_MARKER.length).replace(/^\/+/, "");
    if (rest.startsWith(bucket + "/")) rest = rest.slice(bucket.length + 1);
    return rest;
  } catch {
    return "";
  }
}

// Normalize input (publicUrl OR "bucket/path" OR "path") -> "path" (inside bucket)
export function toStoragePath(urlOrPath, bucket = BUCKET) {
  if (!urlOrPath || typeof urlOrPath !== "string") return "";

  if (isPublicUrl(urlOrPath)) return extractPath(urlOrPath, bucket);

  let p = urlOrPath.replace(/^\/+/, "");
  if (p.startsWith(bucket + "/")) p = p.slice(bucket.length + 1);
  return p;
}

export function publicUrl(path, bucket = BUCKET) {
  const p = toStoragePath(path, bucket);
  if (!p) return "";
  const { data } = supabase.storage.from(bucket).getPublicUrl(p);
  return data?.publicUrl || "";
}

// Convert public URL or storage path to normalized bucket-relative path
export function normalizePath(pathOrUrl, bucket = BUCKET) {
  if (!pathOrUrl) return "";

  if (isPublicUrl(pathOrUrl)) return extractPath(pathOrUrl, bucket);

  let p = String(pathOrUrl).replace(/^\/+/, "");
  if (p.startsWith(bucket + "/")) p = p.slice(bucket.length + 1);
  return p;
}

// Normalize to a browser-usable URL:
export function toPublicUrl(urlOrPath, bucket = BUCKET) {
  if (!urlOrPath) return "";
  if (/^https?:\/\//i.test(urlOrPath)) return urlOrPath;
  return publicUrl(urlOrPath, bucket);
}

// Resolve any image ref (url or storage path) to a usable URL
export function resolveImage(src, bucket = BUCKET) {
  if (!src) return "";
  if (/^https?:\/\//i.test(src)) return src;
  return publicUrl(src, bucket);
}

export async function removePath(urlOrPath, bucket = BUCKET) {
  const p = toStoragePath(urlOrPath, bucket);
  if (!p) return;
  return supabase.storage.from(bucket).remove([p]);
}
