export const CV_REVIEW_STATUSES = ["new", "approved"] as const;

export type CvReviewStatus = (typeof CV_REVIEW_STATUSES)[number];

export type CvReviewSourceState = "remote" | "env-missing" | "empty" | "error";

export interface CvReviewRequest {
  id: string;
  fullName: string;
  whatsappNumber: string;
  linkedinUrl: string;
  status: CvReviewStatus;
  cvReviewed: boolean;
  linkedinReviewed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CvReviewRequestInput {
  fullName: string;
  whatsappNumber: string;
  linkedinUrl: string;
}

export interface CvReviewUpdateInput {
  status?: CvReviewStatus;
  cvReviewed?: boolean;
  linkedinReviewed?: boolean;
}

export interface CvReviewRequestsResult {
  source: CvReviewSourceState;
  errorMessage?: string;
  requests: CvReviewRequest[];
}

export interface CvReviewRequestResult {
  source: CvReviewSourceState;
  errorMessage?: string;
  request: CvReviewRequest | null;
}

export interface CvReviewMutationResult<T> {
  ok: boolean;
  errorMessage?: string;
  data?: T;
}

export interface CvReviewQueueEntry {
  id: string;
  initials: string;
  createdDate: string;
  status: CvReviewStatus;
  cvReviewed: boolean;
  linkedinReviewed: boolean;
}

export interface CvReviewQueueResult {
  source: CvReviewSourceState;
  errorMessage?: string;
  entries: CvReviewQueueEntry[];
  total: number;
  pending: number;
  approved: number;
}
