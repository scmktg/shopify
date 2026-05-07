import { renderProductMarkdown } from '@/lib/products/markdown';
import type { ProductCompliance } from '@/lib/products/schema';

interface ComplianceSectionProps {
  compliance?: ProductCompliance;
}

/**
 * "Compliance & certification" page section. Renders only when a
 * `compliance.note` is set — the badge in the buy box covers the
 * status itself. Note is markdown (same renderer as `description`)
 * so a merchant can drop a link to the ABCB database, AS/NZS
 * standard reference, etc.
 */
export async function ComplianceSection({ compliance }: ComplianceSectionProps) {
  const note = compliance?.note;
  if (!note?.trim()) return null;
  let html = '';
  try {
    html = await renderProductMarkdown(note);
  } catch (error) {
    console.error('[ComplianceSection] markdown render failed', error);
    if (process.env.NODE_ENV !== 'production') throw error;
    return null;
  }
  if (!html) return null;
  return (
    <section className="mt-12 border-t border-gray-100 pt-8">
      <h2 className="text-2xl font-semibold text-black tracking-tight">
        Compliance &amp; certification
      </h2>
      <div
        className="mt-4 prose max-w-none"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </section>
  );
}
