interface JsonLdProps {
  schema: Record<string, unknown> | Array<Record<string, unknown>>;
  id?: string;
}

export function JsonLd({ schema, id = "json-ld" }: Readonly<JsonLdProps>) {
  const payload = Array.isArray(schema) ? schema : [schema];

  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
    />
  );
}
