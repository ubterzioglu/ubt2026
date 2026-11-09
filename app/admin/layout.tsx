import type { ReactNode } from "react";

import { isAdminAuthenticated } from "@/lib/admin-auth";
import { AdminShell } from "@/app/admin/_components/admin-shell";

export default async function AdminLayout({ children }: Readonly<{ children: ReactNode }>) {
  if (!(await isAdminAuthenticated())) {
    return children;
  }

  return <AdminShell>{children}</AdminShell>;
}
