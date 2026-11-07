interface ContentFields {
  title?: string;
  summary?: string;
  content?: string;
}

export function validateContentFields(input: ContentFields): string | null {
  if (input.title !== undefined && input.title.trim().length < 2) {
    return "Title must be at least 2 characters.";
  }
  if (input.summary !== undefined && input.summary.trim().length < 5) {
    return "Summary must be at least 5 characters.";
  }
  if (input.content !== undefined && input.content.trim().length < 1) {
    return "Content must not be empty.";
  }
  return null;
}
