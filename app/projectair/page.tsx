import type { Metadata } from "next";

import { isProjectairAuthenticated } from "@/lib/admin-auth";
import { projectairSignInAction, projectairSignOutAction } from "@/app/projectair/_actions";
import { ProjectairLogin } from "@/app/projectair/_components/projectair-login";
import { PROJECTAIR_NIGHT, PROJECTAIR_SKY } from "@/app/projectair/_components/theme";

export const metadata: Metadata = {
  title: "Project Air",
  robots: { index: false, follow: false }
};

export default async function ProjectairPage() {
  if (!(await isProjectairAuthenticated())) {
    return <ProjectairLogin signIn={projectairSignInAction} />;
  }

  return (
    <main className="relative h-screen w-full" style={{ background: PROJECTAIR_NIGHT }}>
      <iframe src="/projectair/content" title="Project Air" className="h-full w-full border-0" />
      <form action={projectairSignOutAction} className="fixed bottom-4 right-4 z-10">
        <button
          type="submit"
          className="rounded-full px-4 py-2 text-xs font-bold tracking-tight shadow-[0_12px_30px_-10px_rgba(0,0,0,0.7)] ring-1 ring-inset ring-black/10 transition hover:brightness-110"
          style={{ background: PROJECTAIR_SKY, color: PROJECTAIR_NIGHT }}
        >
          Çıkış
        </button>
      </form>
    </main>
  );
}
