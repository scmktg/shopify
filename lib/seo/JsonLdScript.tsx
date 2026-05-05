import type { JsonLd } from './jsonld';

interface JsonLdScriptProps {
  data: JsonLd | ReadonlyArray<JsonLd>;
}

export function JsonLdScript({ data }: JsonLdScriptProps) {
  const json = JSON.stringify(data);
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
