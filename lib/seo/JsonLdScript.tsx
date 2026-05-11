import type { JsonLd } from './jsonld';

interface JsonLdScriptProps {
  data: JsonLd | ReadonlyArray<JsonLd>;
}

// JSON-LD is dropped into raw HTML as the body of a <script> tag, so
// `JSON.stringify` alone isn't safe: a `</script>` substring inside any
// string value would close the tag early. Escaping `<`, `>`, and `&`
// to their \u sequences keeps the output well-formed inside HTML.
function safeStringify(data: JsonLd | ReadonlyArray<JsonLd>): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');
}

export function JsonLdScript({ data }: JsonLdScriptProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeStringify(data) }}
    />
  );
}
