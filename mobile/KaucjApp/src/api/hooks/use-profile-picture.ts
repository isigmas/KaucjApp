import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../api-client";
import { ApiError, parseApiError } from "../api-error";
import { userKeys } from "./use-user";
import { useAuthStore } from "@/src/auth/auth-store";

/** Mirrors the limits enforced by users-service (storage.s3.max-file-size-bytes, JPEG/PNG/WebP). */
export const PROFILE_PICTURE_MAX_BYTES = 5 * 1024 * 1024;

const CONTENT_TYPES: Record<string, string> = {
  "image/jpeg": "image/jpeg",
  "image/jpg": "image/jpeg",
  "image/png": "image/png",
  "image/webp": "image/webp",
};

const EXTENSION_TO_CONTENT_TYPE: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

export interface PickedImage {
  uri: string;
  mimeType?: string | null;
  fileName?: string | null;
}

interface UploadSlot {
  uploadUrl: string;
  blobName: string;
}

/** Returns the content type accepted by the backend, or null when the format is unsupported. */
export function resolveImageContentType(image: PickedImage): string | null {
  const fromMime = image.mimeType
    ? CONTENT_TYPES[image.mimeType.toLowerCase()]
    : undefined;
  if (fromMime) return fromMime;

  const name = (image.fileName ?? image.uri).split("?")[0];
  const extension = name.split(".").pop()?.toLowerCase();
  return extension ? (EXTENSION_TO_CONTENT_TYPE[extension] ?? null) : null;
}

/**
 * Direct-to-storage upload flow:
 *  1. ask users-service for a presigned PUT URL,
 *  2. PUT the raw bytes straight to object storage (no auth header: the URL is the credential),
 *  3. confirm, so the backend validates the object and stores the public URL.
 */
export const useUploadProfilePicture = () => {
  const queryClient = useQueryClient();

  return useMutation<string | null, ApiError, PickedImage>({
    mutationFn: async (image) => {
      const contentType = resolveImageContentType(image);
      if (!contentType) {
        throw new ApiError({
          userMessage: "Obsługiwane formaty zdjęć to JPEG, PNG i WebP.",
        });
      }

      try {
        const { data: slot } = await apiClient.get<UploadSlot>(
          "/user/me/profile-picture/upload-url",
          { params: { content_type: contentType } },
        );

        const file = await (await fetch(image.uri)).blob();
        if (file.size > PROFILE_PICTURE_MAX_BYTES) {
          throw new ApiError({
            userMessage: "Zdjęcie jest za duże. Maksymalny rozmiar to 5 MB.",
          });
        }

        const upload = await fetch(slot.uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": contentType },
          body: file,
        });
        if (!upload.ok) {
          console.warn(`[Profile picture] Storage upload failed: ${upload.status}`);
          throw new ApiError({
            userMessage: "Nie udało się wysłać zdjęcia. Spróbuj ponownie.",
          });
        }

        const { data } = await apiClient.post<{
          profilePictureUrl?: string | null;
        }>("/user/me/profile-picture/confirm", { blobName: slot.blobName });
        return data.profilePictureUrl ?? null;
      } catch (error) {
        throw parseApiError(error);
      }
    },
    onSuccess: async (profilePictureUrl) => {
      await useAuthStore.getState().patchUser({ profilePictureUrl });
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
};

export const useDeleteProfilePicture = () => {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, void>({
    mutationFn: async () => {
      try {
        await apiClient.delete("/user/me/profile-picture");
      } catch (error) {
        throw parseApiError(error);
      }
    },
    onSuccess: async () => {
      await useAuthStore.getState().patchUser({ profilePictureUrl: null });
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
};
