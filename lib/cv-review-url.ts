import type { CvReviewRequest } from "@/types/cv-review";

import { contactItems } from "@/content/profile";

export type CvReviewFeedbackTone = "success" | "error" | "info";

type SearchParamsRecord = Record<string, string | string[] | undefined>;

interface BuildCvReviewSectionUrlOptions {
  params?: SearchParamsRecord;
  status?: CvReviewFeedbackTone;
  message?: string;
  requestId?: string;
}

export function readSearchParam(
  value: string | string[] | undefined,
  fallback = ""
): string {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    return value[0] ?? fallback;
  }

  return fallback;
}

export function readCvReviewFeedbackTone(
  value: string | string[] | undefined
): CvReviewFeedbackTone | undefined {
  const tone = readSearchParam(value);

  if (tone === "success" || tone === "error" || tone === "info") {
    return tone;
  }

  return undefined;
}

export function buildCvReviewSectionUrl({
  params,
  status,
  message,
  requestId
}: BuildCvReviewSectionUrlOptions = {}): string {
  const searchParams = new URLSearchParams();

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (typeof value === "string") {
        searchParams.set(key, value);
        continue;
      }

      if (Array.isArray(value)) {
        for (const item of value) {
          searchParams.append(key, item);
        }
      }
    }
  }

  if (status) {
    searchParams.set("cv_status", status);
  }

  if (message) {
    searchParams.set("cv_message", message);
  }

  if (requestId) {
    searchParams.set("cv_request", requestId);
  }

  const query = searchParams.toString();

  return query ? `/?${query}#cv-review` : "/#cv-review";
}

function getWhatsappDestinationNumber(): string {
  const whatsappHref = contactItems.find((item) => item.label === "WhatsApp")?.href ?? "";
  return whatsappHref.replace(/[^\d]/g, "");
}

export function buildCvReviewWhatsappLink(request: CvReviewRequest): string {
  const destination = getWhatsappDestinationNumber();
  const message = [
    "Hello Umut, I submitted a CV review request.",
    `Reference: ${request.id}`,
    `Name: ${request.fullName}`,
    `LinkedIn: ${request.linkedinUrl}`,
    "I am sending my CV in this message."
  ].join("\n");

  return `https://wa.me/${destination}?text=${encodeURIComponent(message)}`;
}

export function buildPublicCvWhatsappLink(entryId: string): string {
  const destination = getWhatsappDestinationNumber();
  const message = [
    "Hello Umut, I submitted a CV review request.",
    `Reference: ${entryId}`,
    "I am sending my CV in this message."
  ].join("\n");

  return `https://wa.me/${destination}?text=${encodeURIComponent(message)}`;
}
