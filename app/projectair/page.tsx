import type { Metadata } from "next";

import { isProjectairAuthenticated } from "@/lib/admin-auth";
import { projectairSignInAction, projectairSignOutAction } from "@/app/projectair/_actions";
import { ProjectairDocument } from "@/app/projectair/_components/projectair-document";
import { ProjectairLogin } from "@/app/projectair/_components/projectair-login";

export const metadata: Metadata = {
  title: "Project Air · Havacılık Bakım Eğitim Platformu",
  robots: { index: false, follow: false }
};

export default async function ProjectairPage() {
  if (!(await isProjectairAuthenticated())) {
    return <ProjectairLogin signIn={projectairSignInAction} />;
  }

  return <ProjectairDocument signOut={projectairSignOutAction} />;
}
