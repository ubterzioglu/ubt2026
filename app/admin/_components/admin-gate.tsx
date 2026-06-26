import { adminSignInAction } from "@/app/admin/_actions";

interface AdminGateProps {
  /** Admin path to reload after a successful sign-in (e.g. "/admin/slots"). */
  redirectTo: string;
  /** Heading shown above the access-key field. */
  title?: string;
  /** Submit button label. */
  submitLabel?: string;
  /**
   * Override the sign-in server action. Defaults to the shared appointment-
   * admin gate; pass a self-contained action (e.g. the task board's) to use a
   * different key/cookie. Such an action handles its own redirect.
   */
  signInAction?: (formData: FormData) => void | Promise<void>;
}

/**
 * Lightweight admin access gate. Posts the access key to a server action that
 * stores it in an HttpOnly cookie — the key never appears in the URL.
 */
export function AdminGate({
  redirectTo,
  title = "Enter the admin key",
  submitLabel = "Open admin panel",
  signInAction
}: AdminGateProps) {
  const signIn = signInAction ?? adminSignInAction.bind(null, redirectTo);

  return (
    <main className="page-shell min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <section className="section-panel px-6 py-8 sm:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">
            Admin access
          </p>
          <h1 className="mt-3 font-body text-[clamp(2rem,5vw,2.6rem)] font-semibold tracking-[-0.03em] text-ink">
            {title}
          </h1>
          <p className="mt-3 text-sm leading-7 text-ink/72 sm:text-base">
            This lightweight gate protects the appointment and CV review admin pages until a
            fuller authentication flow is added.
          </p>
          <form action={signIn} className="mt-8 space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-ink">Access key</span>
              <input
                type="password"
                name="access"
                autoComplete="current-password"
                className="w-full rounded-[1rem] border border-line/80 bg-white px-4 py-3 text-sm text-ink shadow-sm outline-none transition focus:border-accent/55 focus:ring-2 focus:ring-accent/15"
              />
            </label>
            <button
              type="submit"
              className="inline-flex min-h-[46px] items-center justify-center rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-accent/95"
            >
              {submitLabel}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
