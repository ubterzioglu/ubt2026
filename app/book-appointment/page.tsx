import type { Route } from "next";
import { redirect } from "next/navigation";

import {
  buildAppointmentSectionUrl,
  type SearchParamsRecord
} from "@/lib/appointment-url";

interface BookAppointmentPageProps {
  searchParams?: Promise<SearchParamsRecord>;
}

export default async function BookAppointmentPage({
  searchParams
}: BookAppointmentPageProps) {
  const params = searchParams ? await searchParams : {};
  redirect(buildAppointmentSectionUrl({ params }) as Route);
}
