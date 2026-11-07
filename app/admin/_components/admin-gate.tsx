import { adminSignInAction } from "@/app/admin/_actions";
import { adminInputClass } from "@/app/admin/_components/form-classes";

interface AdminGateProps {
  /** Admin path to reload after a successful sign-in (e.g. "/admin/slots"). */
  redirectTo: string;
  /** Heading shown above the access-key field. */
  title?: string;
  /** Submit button label. */
  submitLabel?: string;
  /** Small label above the title (kicker). */
  eyebrow?: string;
  /** Supporting copy under the title. */
  description?: string;
}

const DEFAULT_DESCRIPTION =
  "This lightweight gate protects the appointment admin pages until a fuller authentication flow is added.";

/**
 * Lightweight admin access gate. Posts the access key to a server action that
 * stores it in an HttpOnly cookie — the key never appears in the URL.
 */
export function AdminGate({
  redirectTo,
  title = "Enter the admin key",
  submitLabel = "Open admin panel",
  eyebrow = "Admin access",
  description = DEFAULT_DESCRIPTION
}: AdminGateProps) {
  const signIn = adminSignInAction.bind(null, redirectTo);

  return (
    <main className="page-shell min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <section className="section-panel px-6 py-8 sm:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">
            {eyebrow}
          </p>
          <h1 className="mt-3 font-body text-[clamp(2rem,5vw,2.6rem)] font-semibold tracking-[-0.03em] text-ink">
            {title}
          </h1>
          <p className="mt-3 text-sm leading-7 text-ink/72 sm:text-base">
            {description}
          </p>
          <form action={signIn} className="mt-8 space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-ink">Access key</span>
              <input
                type="password"
                name="access"
                autoComplete="current-password"
                className={adminInputClass}
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
