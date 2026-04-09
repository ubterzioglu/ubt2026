import "server-only";

import { createClient } from "@supabase/supabase-js";

import type {
  CvReviewMutationResult,
  CvReviewQueueEntry,
  CvReviewQueueResult,
  CvReviewRequest,
  CvReviewRequestInput,
  CvReviewRequestResult,
  CvReviewRequestsResult,
  CvReviewStatus
} from "@/types/cv-review";

interface CvReviewRow {
  id: string;
  full_name: string;
  whatsapp_number: string;
  linkedin_url: string;
  status: CvReviewStatus;
  created_at: string;
  updated_at: string;
}

const whatsappPattern = /^[+\d][\d\s().-]{7,20}$/;

function createEmptyRequestsResult(
  source: CvReviewRequestsResult["source"]
): CvReviewRequestsResult {
  return {
    source,
    requests: []
  };
}

function createEmptyRequestResult(
  source: CvReviewRequestResult["source"]
): CvReviewRequestResult {
  return {
    source,
    request: null
  };
}

function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    return null;
  }

  return {
    url,
    serviceRoleKey
  };
}

function createServiceSupabaseClient() {
  const env = getSupabaseEnv();

  if (!env) {
    return null;
  }

  return createClient(env.url, env.serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}

function normalizeLinkedinUrl(value: string): string | null {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    const url = new URL(withProtocol);

    if (!url.hostname.toLowerCase().includes("linkedin.com")) {
      return null;
    }

    return url.toString();
  } catch {
    return null;
  }
}

function normalizeWhatsappNumber(value: string): string | null {
  const trimmed = value.trim();

  if (!trimmed || !whatsappPattern.test(trimmed)) {
    return null;
  }

  const digits = trimmed.replace(/[^\d+]/g, "");
  const digitCount = digits.replace(/\D/g, "").length;

  if (digitCount < 8 || digitCount > 15) {
    return null;
  }

  return digits;
}

function toCvReviewRequest(row: CvReviewRow): CvReviewRequest {
  return {
    id: row.id,
    fullName: row.full_name,
    whatsappNumber: row.whatsapp_number,
    linkedinUrl: row.linkedin_url,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function validateCvReviewInput(
  input: CvReviewRequestInput
): CvReviewMutationResult<CvReviewRequestInput> {
  const fullName = input.fullName.trim();
  const whatsappNumber = normalizeWhatsappNumber(input.whatsappNumber);
  const linkedinUrl = normalizeLinkedinUrl(input.linkedinUrl);

  if (fullName.length < 2) {
    return {
      ok: false,
      errorMessage: "Please provide your full name."
    };
  }

  if (!whatsappNumber) {
    return {
      ok: false,
      errorMessage: "Please provide a valid WhatsApp number."
    };
  }

  if (!linkedinUrl) {
    return {
      ok: false,
      errorMessage: "Please provide a valid LinkedIn profile URL."
    };
  }

  return {
    ok: true,
    data: {
      fullName,
      whatsappNumber,
      linkedinUrl
    }
  };
}

export async function createCvReviewRequest(
  input: CvReviewRequestInput
): Promise<CvReviewMutationResult<CvReviewRequest>> {
  const validation = validateCvReviewInput(input);

  if (!validation.ok || !validation.data) {
    return {
      ok: false,
      errorMessage: validation.errorMessage
    };
  }

  const supabase = createServiceSupabaseClient();

  if (!supabase) {
    return {
      ok: false,
      errorMessage: "Supabase service role credentials are missing."
    };
  }

  try {
    const { data, error } = await supabase
      .from("cv_review_requests")
      .insert({
        full_name: validation.data.fullName,
        whatsapp_number: validation.data.whatsappNumber,
        linkedin_url: validation.data.linkedinUrl
      })
      .select(
        "id, full_name, whatsapp_number, linkedin_url, status, created_at, updated_at"
      )
      .single();

    if (error) {
      throw error;
    }

    return {
      ok: true,
      data: toCvReviewRequest(data as CvReviewRow)
    };
  } catch (error) {
    return {
      ok: false,
      errorMessage:
        error instanceof Error ? error.message : "Unable to submit the CV review request."
    };
  }
}

export async function getAllCvReviewRequests(): Promise<CvReviewRequestsResult> {
  const supabase = createServiceSupabaseClient();

  if (!supabase) {
    return createEmptyRequestsResult("env-missing");
  }

  try {
    const { data, error } = await supabase
      .from("cv_review_requests")
      .select(
        "id, full_name, whatsapp_number, linkedin_url, status, created_at, updated_at"
      )
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    const requests = ((data ?? []) as CvReviewRow[]).map(toCvReviewRequest);

    return {
      source: requests.length > 0 ? "remote" : "empty",
      requests
    };
  } catch (error) {
    return {
      source: "error",
      errorMessage:
        error instanceof Error ? error.message : "Unknown CV review request error",
      requests: []
    };
  }
}

export async function getCvReviewRequestById(
  requestId: string
): Promise<CvReviewRequestResult> {
  const supabase = createServiceSupabaseClient();

  if (!supabase) {
    return createEmptyRequestResult("env-missing");
  }

  try {
    const { data, error } = await supabase
      .from("cv_review_requests")
      .select(
        "id, full_name, whatsapp_number, linkedin_url, status, created_at, updated_at"
      )
      .eq("id", requestId)
      .single();

    if (error) {
      throw error;
    }

    return {
      source: "remote",
      request: toCvReviewRequest(data as CvReviewRow)
    };
  } catch (error) {
    return {
      source: "error",
      errorMessage:
        error instanceof Error ? error.message : "Unknown CV review request error",
      request: null
    };
  }
}

function toInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 0) return "?";
  const first = parts[0];
  const last = parts.length > 1 ? parts[parts.length - 1] : "";
  return last ? `${first[0].toUpperCase()}.${last[0].toUpperCase()}.` : `${first[0].toUpperCase()}.`;
}

function formatQueueDate(isoString: string): string {
  const date = new Date(isoString);
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const year = date.getUTCFullYear();
  return `${day}.${month}.${year}`;
}

interface CvReviewQueueRow {
  id: string;
  full_name: string;
  linkedin_url: string;
  status: CvReviewStatus;
  created_at: string;
}

export async function getPublicCvReviewQueue(): Promise<CvReviewQueueResult> {
  const supabase = createServiceSupabaseClient();

  if (!supabase) {
    return {
      source: "env-missing",
      entries: [],
      total: 0,
      pending: 0,
      approved: 0
    };
  }

  try {
    const { data, error } = await supabase
      .from("cv_review_requests")
      .select("id, full_name, linkedin_url, status, created_at")
      .order("created_at", { ascending: true });

    if (error) {
      throw error;
    }

    const rows = (data ?? []) as CvReviewQueueRow[];
    const entries: CvReviewQueueEntry[] = rows.map((row) => ({
      id: row.id,
      initials: toInitials(row.full_name),
      createdDate: formatQueueDate(row.created_at),
      status: row.status,
      linkedinUrl: row.linkedin_url
    }));

    const approved = entries.filter((e) => e.status === "approved").length;
    const pending = entries.filter((e) => e.status === "new").length;

    return {
      source: entries.length > 0 ? "remote" : "empty",
      entries,
      total: entries.length,
      pending,
      approved
    };
  } catch (error) {
    return {
      source: "error",
      errorMessage:
        error instanceof Error ? error.message : "Unknown CV review queue error",
      entries: [],
      total: 0,
      pending: 0,
      approved: 0
    };
  }
}
