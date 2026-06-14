import type {
  WardrobeCategory,
  WardrobeUploadAsset,
  WardrobeUploadIssue,
  WardrobeUploadProgress,
  WardrobeUploadResult,
  WardrobeUploadStatus,
} from "@/features/wardrobe/types";

export type WardrobeUploadState = {
  category: WardrobeCategory | null;
  issue: WardrobeUploadIssue | null;
  progress: WardrobeUploadProgress;
  result: WardrobeUploadResult | null;
  selectedAssets: WardrobeUploadAsset[];
  status: WardrobeUploadStatus;
};

type WardrobeUploadAction =
  | { type: "assetsAdded"; assets: WardrobeUploadAsset[]; issue?: WardrobeUploadIssue }
  | { type: "assetsCleared" }
  | { type: "assetRemoved"; assetId: string }
  | { type: "categorySelected"; category: WardrobeCategory }
  | { type: "feedbackCleared" }
  | { type: "pickingCanceled" }
  | { type: "pickingStarted" }
  | { type: "saveFailed"; issue: WardrobeUploadIssue }
  | { type: "saveStarted" }
  | {
      type: "uploadPartiallySucceeded";
      issue: WardrobeUploadIssue;
      remainingAssets: WardrobeUploadAsset[];
      result: WardrobeUploadResult;
    }
  | { type: "uploadBlocked"; issue: WardrobeUploadIssue }
  | { type: "uploadFailed"; issue: WardrobeUploadIssue }
  | { type: "uploadProgressed"; completed: number }
  | { type: "uploadStarted"; total: number }
  | { type: "uploadSucceeded"; result: WardrobeUploadResult };

export const initialWardrobeUploadState: WardrobeUploadState = {
  category: null,
  issue: null,
  progress: { completed: 0, total: 0 },
  result: null,
  selectedAssets: [],
  status: "idle",
};

export function wardrobeUploadReducer(
  state: WardrobeUploadState,
  action: WardrobeUploadAction,
): WardrobeUploadState {
  switch (action.type) {
    case "assetsAdded":
      return {
        ...state,
        issue: action.issue ?? null,
        result: null,
        selectedAssets: [...state.selectedAssets, ...action.assets],
        status: action.issue ? "error" : "idle",
      };
    case "assetsCleared":
      return {
        ...state,
        issue: null,
        progress: { completed: 0, total: 0 },
        result: null,
        selectedAssets: [],
        status: "idle",
      };
    case "assetRemoved":
      return {
        ...state,
        issue: null,
        selectedAssets: state.selectedAssets.filter(
          (asset) => asset.id !== action.assetId,
        ),
        status: state.status === "error" ? "idle" : state.status,
      };
    case "categorySelected":
      return {
        ...state,
        category: action.category,
        issue:
          state.issue?.action === "reviewSelection" ? null : state.issue,
        result: null,
        status: state.status === "error" ? "idle" : state.status,
      };
    case "feedbackCleared":
      return {
        ...state,
        issue: null,
        progress: { completed: 0, total: 0 },
        result: null,
        status: isResolvedStatus(state.status) ? "idle" : state.status,
      };
    case "pickingCanceled":
      return {
        ...state,
        status: "idle",
      };
    case "pickingStarted":
      return {
        ...state,
        issue: null,
        result: null,
        status: "picking",
      };
    case "saveFailed":
    case "uploadBlocked":
    case "uploadFailed":
      return {
        ...state,
        issue: action.issue,
        status: "error",
      };
    case "saveStarted":
      return {
        ...state,
        status: "saving",
      };
    case "uploadPartiallySucceeded":
      return {
        ...state,
        issue: action.issue,
        result: action.result,
        selectedAssets: action.remainingAssets,
        status: "partial",
      };
    case "uploadProgressed":
      return {
        ...state,
        progress: {
          completed: action.completed,
          total: state.progress.total,
        },
      };
    case "uploadStarted":
      return {
        ...state,
        issue: null,
        progress: { completed: 0, total: action.total },
        result: null,
        status: "uploading",
      };
    case "uploadSucceeded":
      return {
        ...state,
        issue: null,
        result: action.result,
        selectedAssets: [],
        status: "success",
      };
  }
}

export function getCanUpload(state: WardrobeUploadState) {
  return (
    state.selectedAssets.length > 0 &&
    state.category !== null &&
    !isWardrobeUploadBusy(state.status)
  );
}

export function isWardrobeUploadBusy(status: WardrobeUploadStatus) {
  return status === "picking" || status === "uploading" || status === "saving";
}

function isResolvedStatus(status: WardrobeUploadStatus) {
  return status === "success" || status === "partial" || status === "error";
}
