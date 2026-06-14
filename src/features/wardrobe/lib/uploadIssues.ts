import type {
  WardrobeUploadIssue,
} from "@/features/wardrobe/types";
import { MAX_PHOTOS_PER_UPLOAD } from "@/features/wardrobe/types";
import { getErrorMessage } from "@/features/wardrobe/lib/errors";

type PermissionIssueArgs = {
  canAskAgain: boolean;
};

export function categoryRequiredIssue(): WardrobeUploadIssue {
  return {
    title: "Choose a category first",
    message:
      "Pick the wardrobe category these photos belong to. All photos in this upload will be saved under that category.",
    action: "reviewSelection",
  };
}

export function missingPhotosIssue(): WardrobeUploadIssue {
  return {
    title: "Add at least one photo",
    message:
      "Choose one or more clothing photos before uploading. If the picker cannot see them, check Photos permission in Settings.",
    action: "reviewSelection",
  };
}

export function selectionFullIssue(): WardrobeUploadIssue {
  return {
    title: "Selection is full",
    message: `Upload ${MAX_PHOTOS_PER_UPLOAD} photos or fewer at once. Remove a photo before adding another.`,
    action: "reviewSelection",
  };
}

export function selectionLimitedIssue(): WardrobeUploadIssue {
  return {
    title: "Some photos were not added",
    message: `Only ${MAX_PHOTOS_PER_UPLOAD} photos can upload at once. Upload this batch first, then add the rest.`,
    action: "reviewSelection",
  };
}

export function photoAccessIssue({
  canAskAgain,
}: PermissionIssueArgs): WardrobeUploadIssue {
  return {
    title: "Photo access is off",
    message: canAskAgain
      ? "Allow photo access when prompted, or choose photos again after enabling Photos for Wardrobe."
      : "Open Settings and enable Photos for Wardrobe, then come back and choose your images.",
    action: canAskAgain ? "reviewSelection" : "openSettings",
  };
}

export function pickerFailedIssue(error: unknown): WardrobeUploadIssue {
  return {
    title: "The photo picker could not open",
    message:
      "Check photo permissions and try choosing fewer images. If the images are in cloud storage, open them once in Photos so they download locally.",
    detail: getErrorMessage(error),
    action: "reviewSelection",
  };
}

export function noFilesUploadedIssue(errorMessage?: string): WardrobeUploadIssue {
  return {
    title: "No photos reached Convex",
    message:
      "Check your connection, confirm the photos are stored locally on the device, and try a smaller selection if the images are large.",
    detail: errorMessage,
    action: "uploadRemaining",
  };
}

export function partialUploadIssue(errorMessage?: string): WardrobeUploadIssue {
  return {
    title: "Some photos still need uploading",
    message:
      "The saved photos are already in your wardrobe. The remaining photos are still selected; check your connection or local photo availability before uploading them again.",
    detail: errorMessage,
    action: "uploadRemaining",
  };
}

export function saveFailedIssue(error: unknown): WardrobeUploadIssue {
  return {
    title: "Wardrobe save failed",
    message:
      "The photos reached Convex storage, but the wardrobe records were not saved. The server cleaned up that upload. Check your connection and try fewer photos if they are large.",
    detail: getErrorMessage(error),
    action: "uploadRemaining",
  };
}
