import { supabase } from "@/lib/supabaseClient";

export const BUCKET = "lip-images";

const PUBLIC_MARKER = "/storage/v1/object/public/";

export function isPublicUrl(v: unknown): boolean {
  if (!v || typeof v !== "string") return false;
  if (!/^https?:\/\//i.test(v)) return false;
  return v.includes(PUBLIC_MARKER);
}

export function extractPath(publicUrl: string, bucket = BUCKET): string {
  if (!publicUrl || typeof publicUrl !== "string") return "";
  const maybe = publicUrl.replace(/^\/+/, "");
  if (maybe.startsWith(bucket + "/")) return maybe.slice(bucket.length + 1);
  if (!isPublicUrl(publicUrl)) return "";
  try {
    const url = new URL(publicUrl);
    const idx = url.pathname.indexOf(PUBLIC_MARKER);
    if (idx < 0) return "";
    let rest = url.pathname.slice(idx + PUBLIC_MARKER.length).replace(/^\/+/, "");
    if (rest.startsWith(bucket + "/")) rest = rest.slice(bucket.length + 1);
    return rest;
  } catch {
    return "";
  }
}

export function toStoragePath(urlOrPath: string, bucket = BUCKET): string {
  if (!urlOrPath || typeof urlOrPath !== "string") return "";
  if (isPublicUrl(urlOrPath)) return extractPath(urlOrPath, bucket);
  let p = urlOrPath.replace(/^\/+/, "");
  if (p.startsWith(bucket + "/")) p = p.slice(bucket.length + 1);
  return p;
}

export function publicUrl(path: string, bucket = BUCKET): string {
  const p = toStoragePath(path, bucket);
  if (!p) return "";
  const { data } = supabase.storage.from(bucket).getPublicUrl(p);
  return data?.publicUrl || "";
}

export function normalizePath(pathOrUrl: string, bucket = BUCKET): string {
  if (!pathOrUrl) return "";
  if (isPublicUrl(pathOrUrl)) return extractPath(pathOrUrl, bucket);
  let p = String(pathOrUrl).replace(/^\/+/, "");
  if (p.startsWith(bucket + "/")) p = p.slice(bucket.length + 1);
  return p;
}

export function toPublicUrl(urlOrPath: string, bucket = BUCKET): string {
  if (!urlOrPath) return "";
  if (/^https?:\/\//i.test(urlOrPath)) return urlOrPath;
  return publicUrl(urlOrPath, bucket);
}

export function resolveImage(src: string, bucket = BUCKET): string {
  if (!src) return "";
  if (/^https?:\/\//i.test(src)) return src;
  return publicUrl(src, bucket);
}

export async function removePath(urlOrPath: string, bucket = BUCKET): Promise<void> {
  const p = toStoragePath(urlOrPath, bucket);
  if (!p) return;
  await supabase.storage.from(bucket).remove([p]);
}
