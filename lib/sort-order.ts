import { readFormString } from "@/lib/form-data";

export function readSortOrder(formData: FormData): number {
  const sortOrder = parseInt(readFormString(formData, "sortOrder", "0"), 10);
  return isNaN(sortOrder) ? 0 : sortOrder;
}
