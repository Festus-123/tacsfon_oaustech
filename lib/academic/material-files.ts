import { createServiceClient } from "@/lib/supabase/admin";

const ACADEMIC_BUCKET = "academic-materials";
// Long enough to read a document; the page issues fresh links on every visit
const SIGNED_URL_SECONDS = 15 * 60;

export interface MaterialFile {
  url: string;
  name: string;
  kind: "image" | "pdf" | "other";
}

const kindOf = (name: string): MaterialFile["kind"] => {
  const ext = name.split(".").pop()?.toLowerCase() || "";
  if (["jpg", "jpeg", "png", "webp"].includes(ext)) return "image";
  if (ext === "pdf") return "pdf";
  return "other";
};

/**
 * Short-lived signed links for a material's file and its extra parts
 * (approval stores multi-page groups as name.ext, name-part2.ext, ...).
 * Only call this after the visitor's access has been checked.
 */
export async function getMaterialFiles(storagePath: string): Promise<MaterialFile[]> {
  const supabase = createServiceClient();
  if (!supabase || !storagePath) return [];

  const slash = storagePath.lastIndexOf("/");
  const folder = slash >= 0 ? storagePath.slice(0, slash) : "";
  const fileName = storagePath.slice(slash + 1);
  const dot = fileName.lastIndexOf(".");
  const base = dot > 0 ? fileName.slice(0, dot) : fileName;

  const { data: listed } = await supabase.storage.from(ACADEMIC_BUCKET).list(folder, { search: base, limit: 100 });

  const partNumber = (name: string) => {
    if (name === fileName) return 1;
    const match = name.match(new RegExp(`^${base.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}-part(\\d+)\\.[a-z0-9]+$`, "i"));
    return match ? Number(match[1]) : null;
  };

  const names = (listed || [])
    .map((f) => f.name)
    .filter((name) => partNumber(name) !== null)
    .sort((a, b) => (partNumber(a) || 0) - (partNumber(b) || 0));
  if (!names.includes(fileName)) names.unshift(fileName);

  const paths = names.map((name) => (folder ? `${folder}/${name}` : name));
  const { data: signed, error } = await supabase.storage
    .from(ACADEMIC_BUCKET)
    .createSignedUrls(paths, SIGNED_URL_SECONDS);

  if (error || !signed) {
    console.error("Could not sign academic material URLs:", error);
    return [];
  }

  return signed.flatMap((entry, i) =>
    entry.signedUrl ? [{ url: entry.signedUrl, name: names[i], kind: kindOf(names[i]) }] : []
  );
}
