import type { CvReviewRequest } from "@/types/cv-review";

interface CvReviewFormProps {
  action: (formData: FormData) => Promise<void>;
  feedbackTone?: "success" | "error" | "info";
  feedbackMessage?: string;
  whatsappHref?: string;
  submittedRequest?: CvReviewRequest | null;
}

const toneClasses: Record<NonNullable<CvReviewFormProps["feedbackTone"]>, string> = {
  success: "border-emerald-200 bg-emerald-50/90 text-emerald-900",
  error: "border-rose-200 bg-rose-50/95 text-rose-900",
  info: "border-line/80 bg-paper/80 text-ink/80"
};

export function CvReviewForm({
  action,
  feedbackTone,
  feedbackMessage,
  whatsappHref,
  submittedRequest
}: CvReviewFormProps) {
  return (
    <form action={action} className="px-1 py-1">
      <div className="space-y-6">
        <div>
          <p className="max-w-3xl text-sm leading-7 text-ink/72 sm:text-base">
            Join the CV review queue by sharing your name, WhatsApp number, and LinkedIn profile.
          </p>
          <p className="max-w-3xl text-sm leading-7 text-ink/72 sm:text-base">
            After submitting, use the WhatsApp button to send your CV file directly.
          </p>
        </div>

        {feedbackMessage ? (
          <div
            className={`rounded-[1.35rem] border px-4 py-3 text-sm leading-6 ${
              toneClasses[feedbackTone ?? "info"]
            }`}
          >
            {feedbackMessage}
          </div>
        ) : null}

        {whatsappHref && submittedRequest ? (
          <div className="rounded-[1.45rem] border border-emerald-200 bg-emerald-50/90 px-5 py-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-emerald-900">
                  Your request is in the queue.
                </p>
                <p className="mt-1 text-sm leading-6 text-emerald-900/85">
                  Reference: {submittedRequest.id}
                </p>
              </div>
              <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:-translate-y-0.5 hover:bg-emerald-500"
              >
                Send your CV
              </a>
            </div>
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="mb-2 block text-sm font-medium text-ink">Full name</span>
            <input
              type="text"
              name="fullName"
              required
              minLength={2}
              className="w-full rounded-[1rem] border border-line/80 bg-white px-4 py-3 text-sm text-ink shadow-sm outline-none transition focus:border-accent/55 focus:ring-2 focus:ring-accent/15"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-ink">WhatsApp number</span>
            <input
              type="tel"
              name="whatsappNumber"
              required
              placeholder="+49 ..."
              className="w-full rounded-[1rem] border border-line/80 bg-white px-4 py-3 text-sm text-ink shadow-sm outline-none transition focus:border-accent/55 focus:ring-2 focus:ring-accent/15"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-ink">LinkedIn profile URL</span>
            <input
              type="url"
              name="linkedinUrl"
              required
              placeholder="https://www.linkedin.com/in/..."
              className="w-full rounded-[1rem] border border-line/80 bg-white px-4 py-3 text-sm text-ink shadow-sm outline-none transition focus:border-accent/55 focus:ring-2 focus:ring-accent/15"
            />
          </label>
        </div>

        <button
          type="submit"
          className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-accent/25 transition hover:-translate-y-0.5 hover:bg-accent/95"
        >
          Join the review queue
        </button>
      </div>
    </form>
  );
}
