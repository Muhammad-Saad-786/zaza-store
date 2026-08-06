import { supabase } from "./supabase";

/**
 * Upload file to private bucket and get signed URL
 */
export async function uploadPaymentProof(userId, file) {
  const fileExt = file.name.split(".").pop();
  const filePath = `${userId}/${Date.now()}.${fileExt}`;

  // Upload to private bucket
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from("payment-proofs")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    throw new Error("Upload failed: " + uploadError.message);
  }

  // Return the file path (not URL)
  return uploadData.path;
}

/**
 * Get signed URL for viewing payment proof (expires in 5 minutes)
 */
export async function getPaymentProofUrl(filePath) {
  // If it's already a full URL (old system), return as is
  if (filePath.startsWith("http")) {
    return filePath;
  }

  // Generate signed URL for private bucket
  const { data, error } = await supabase.storage
    .from("payment-proofs")
    .createSignedUrl(filePath, 300); // 5 minutes

  if (error) {
    console.error("Signed URL error:", error);
    return null;
  }

  return data.signedUrl;
}
