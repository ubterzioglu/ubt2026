import type { Metadata } from "next";

import { isNewdragomanAuthenticated } from "@/lib/admin-auth";
import { newdragomanSignInAction, newdragomanSignOutAction } from "@/app/newdragoman/_actions";
import { NewdragomanLogin } from "@/app/newdragoman/_components/newdragoman-login";
import { DRAGOMAN_BUOY, DRAGOMAN_DEEP } from "@/app/newdragoman/_components/theme";

export const metadata: Metadata = {
  title: "dragoman-turkey.com yenileme önerisi",
  robots: { index: false, follow: false }
};

/**
 * Password-gated host for the Dragoman redesign proposal.
 *
 * The proposal is a complete standalone HTML document (own fonts, styles and
 * tab/scroll scripts), so it is framed verbatim from the gated
 * /newdragoman/content route instead of being ported to JSX — the iframe keeps
 * its stylesheet and scripts from colliding with the site's own.
 */
export default async function NewdragomanPage() {
  if (!(await isNewdragomanAuthenticated())) {
    return <NewdragomanLogin signIn={newdragomanSignInAction} />;
  }

  return (
    <main className="relative h-screen w-full" style={{ background: DRAGOMAN_DEEP }}>
      <iframe
        src="/newdragoman/content"
        title="dragoman-turkey.com yenileme önerisi"
        className="h-full w-full border-0"
      />
      <form
        action={newdragomanSignOutAction}
        className="fixed bottom-4 right-4 z-10"
      >
        <button
          type="submit"
          className="rounded-full px-4 py-2 text-xs font-bold tracking-tight shadow-[0_12px_30px_-10px_rgba(0,0,0,0.7)] ring-1 ring-inset ring-black/10 transition hover:brightness-110"
          style={{ background: DRAGOMAN_BUOY, color: DRAGOMAN_DEEP }}
        >
          Çıkış
        </button>
      </form>
    </main>
  );
}
