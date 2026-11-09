import type { Route } from "next";
import Link from "next/link";

import { getAllAppointments, getAllAppointmentSlots } from "@/lib/appointments";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getAllNewsUpdatesAdmin } from "@/lib/news-updates";
import { getAllBlogPostsAdmin } from "@/lib/blog-posts";
import { getAllBookmarksAdmin } from "@/lib/featured-items";
import { formatSlotTime } from "@/lib/slot-time";
import { AdminGate } from "@/app/admin/_components/admin-gate";
import { AdminIcon } from "@/app/admin/_components/admin-icon";
import type { AdminIconName } from "@/app/admin/_components/admin-icon";
import { AdminPageHeader } from "@/app/admin/_components/admin-page-header";
import { AdminBadge, AdminListPanel } from "@/app/admin/_components/admin-panels";
import { APPOINTMENT_STATUS_TONE } from "@/app/admin/_components/appointment-status";
import {
  adminPrimaryButtonClass,
  adminSecondaryButtonClass,
  adminSmallButtonClass
} from "@/app/admin/_components/form-classes";
import { APPOINTMENT_STATUSES } from "@/types/appointment";

interface StatTile {
  label: string;
  value: number;
  hint: string;
  href: Route;
  icon: AdminIconName;
  highlight?: boolean;
}

interface Publishable {
  isPublished: boolean;
}

function countDrafts(items: readonly Publishable[]): number {
  return items.filter((item) => !item.isPublished).length;
}

function draftHint(items: readonly Publishable[]): string {
  const drafts = countDrafts(items);
  return drafts > 0 ? `${drafts} draft${drafts === 1 ? "" : "s"}` : "All published";
}

export default async function AdminPage() {
  const hasAccess = await isAdminAuthenticated();

  if (!hasAccess) {
    return <AdminGate redirectTo="/admin" submitLabel="Open admin panel" />;
  }

  const [slotsResult, appointmentsResult, newsResult, blogResult, bookmarksResult] =
    await Promise.all([
      getAllAppointmentSlots(),
      getAllAppointments(),
      getAllNewsUpdatesAdmin(),
      getAllBlogPostsAdmin(),
      getAllBookmarksAdmin()
    ]);

  const now = new Date();
  const appointments = appointmentsResult.appointments;
  const futureSlots = slotsResult.slots.filter((slot) => new Date(slot.startsAt) > now);
  const openSlots = futureSlots.filter((slot) => slot.isPublic && !slot.isBooked);
  const statusCounts = APPOINTMENT_STATUSES.map((status) => ({
    status,
    count: appointments.filter((appointment) => appointment.status === status).length
  }));
  const pendingCount = statusCounts.find((entry) => entry.status === "pending")?.count ?? 0;
  const recentAppointments = appointments.slice(0, 6);
  const nextSlots = futureSlots.slice(0, 6);

  const tiles: StatTile[] = [
    {
      label: "Pending review",
      value: pendingCount,
      hint: "Waiting for a decision",
      href: "/admin/appointments?filter=pending" as Route,
      icon: "inbox",
      highlight: pendingCount > 0
    },
    {
      label: "Open slots",
      value: openSlots.length,
      hint: `${futureSlots.length} upcoming in total`,
      href: "/admin/slots",
      icon: "calendar"
    },
    {
      label: "News",
      value: newsResult.items.length,
      hint: draftHint(newsResult.items),
      href: "/admin/news",
      icon: "news"
    },
    {
      label: "Blog posts",
      value: blogResult.items.length,
      hint: draftHint(blogResult.items),
      href: "/admin/blog",
      icon: "pen"
    },
    {
      label: "Bookmarks",
      value: bookmarksResult.items.length,
      hint: draftHint(bookmarksResult.items),
      href: "/admin/bookmarks",
      icon: "bookmark"
    }
  ];

  return (
    <>
      <AdminPageHeader
        eyebrow="Overview"
        title="Dashboard"
        description={`${appointments.length} requests in total, ${pendingCount} waiting for review.`}
      >
        <Link href="/admin/appointments" className={adminSecondaryButtonClass}>
          Review requests
        </Link>
        <Link href={"/admin/slots#new-slot" as Route} className={adminPrimaryButtonClass}>
          <AdminIcon name="plus" size={16} />
          New slot
        </Link>
      </AdminPageHeader>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        {tiles.map((tile) => (
          <Link
            key={tile.label}
            href={tile.href}
            className={`group rounded-xl border bg-white px-4 py-4 shadow-sm transition hover:border-accent/40 ${
              tile.highlight ? "border-amber-300" : "border-line/80"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-ink/55">{tile.label}</span>
              <AdminIcon
                name={tile.icon}
                size={16}
                className="text-ink/35 transition group-hover:text-accent"
              />
            </div>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-ink">{tile.value}</p>
            <p className="mt-1 truncate text-xs text-ink/50">{tile.hint}</p>
          </Link>
        ))}
      </section>

      <section className="rounded-xl border border-line/80 bg-white px-5 py-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-ink">Request pipeline</h2>
          <span className="text-xs text-ink/50">{appointments.length} total</span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {statusCounts.map((entry) => (
            <Link
              key={entry.status}
              href={`/admin/appointments?filter=${entry.status}` as Route}
              className="flex items-center justify-between gap-2 rounded-lg border border-line/70 px-3 py-2.5 transition hover:border-accent/40"
            >
              <AdminBadge tone={APPOINTMENT_STATUS_TONE[entry.status]}>{entry.status}</AdminBadge>
              <span className="text-lg font-semibold text-ink">{entry.count}</span>
            </Link>
          ))}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <AdminListPanel
          title="Latest requests"
          count={recentAppointments.length}
          emptyMessage="No appointment requests have been submitted yet."
          actions={
            <Link href="/admin/appointments" className={adminSmallButtonClass}>
              View all
            </Link>
          }
        >
          {recentAppointments.map((appointment) => (
            <li key={appointment.id} className="flex items-center justify-between gap-4 px-5 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink">{appointment.fullName}</p>
                <p className="truncate text-xs text-ink/55">
                  {appointment.email}
                  {appointment.company ? ` · ${appointment.company}` : ""}
                </p>
                {appointment.slot ? (
                  <p className="mt-0.5 truncate text-xs text-ink/45">
                    {formatSlotTime(
                      appointment.slot.startsAt,
                      appointment.slot.endsAt,
                      appointment.slot.timezone
                    )}
                  </p>
                ) : null}
              </div>
              <AdminBadge tone={APPOINTMENT_STATUS_TONE[appointment.status]}>
                {appointment.status}
              </AdminBadge>
            </li>
          ))}
        </AdminListPanel>

        <AdminListPanel
          title="Upcoming slots"
          count={nextSlots.length}
          emptyMessage="No future slots are available yet."
          actions={
            <Link href="/admin/slots" className={adminSmallButtonClass}>
              Manage
            </Link>
          }
        >
          {nextSlots.map((slot) => (
            <li key={slot.id} className="flex items-center justify-between gap-4 px-5 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink">{slot.title}</p>
                <p className="truncate text-xs text-ink/55">
                  {formatSlotTime(slot.startsAt, slot.endsAt, slot.timezone)}
                </p>
              </div>
              <AdminBadge tone={slot.isBooked ? "info" : slot.isPublic ? "success" : "neutral"}>
                {slot.isBooked ? "Booked" : slot.isPublic ? "Open" : "Hidden"}
              </AdminBadge>
            </li>
          ))}
        </AdminListPanel>
      </div>
    </>
  );
}
