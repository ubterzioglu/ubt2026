import type { ReactNode } from "react";

import { AdminBadge } from "@/app/admin/_components/admin-panels";
import {
  adminSmallButtonClass,
  adminSmallDangerButtonClass
} from "@/app/admin/_components/form-classes";

interface PublishableRowProps {
  id: string;
  title: string;
  summary: string;
  isPublished: boolean;
  badges: ReactNode;
  details: ReactNode;
  leadingActions?: ReactNode;
  togglePublishAction: (formData: FormData) => Promise<void>;
  deleteAction: (formData: FormData) => Promise<void>;
}

export function PublishableRow({
  id,
  title,
  summary,
  isPublished,
  badges,
  details,
  leadingActions,
  togglePublishAction,
  deleteAction
}: Readonly<PublishableRowProps>) {
  return (
    <li className="flex flex-col gap-3 px-5 py-4 transition hover:bg-paper/50 md:flex-row md:items-center md:gap-6">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className={`text-sm font-semibold ${isPublished ? "text-ink" : "text-ink/60"}`}>
            {title}
          </h3>
          <AdminBadge tone={isPublished ? "success" : "warning"}>
            {isPublished ? "Published" : "Draft"}
          </AdminBadge>
          {badges}
        </div>
        <p className="mt-1 line-clamp-2 text-sm leading-6 text-ink/60">{summary}</p>
        {details}
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        {leadingActions}
        <form action={togglePublishAction}>
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="isPublished" value={String(isPublished)} />
          <button type="submit" className={adminSmallButtonClass}>
            {isPublished ? "Unpublish" : "Publish"}
          </button>
        </form>
        <form action={deleteAction}>
          <input type="hidden" name="id" value={id} />
          <button type="submit" className={adminSmallDangerButtonClass}>
            Delete
          </button>
        </form>
      </div>
    </li>
  );
}
