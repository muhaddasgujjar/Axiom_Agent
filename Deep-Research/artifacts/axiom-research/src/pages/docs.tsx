import { DocumentPage } from '@/pages/document-page';

export default function DocsPage() {
  return (
    <DocumentPage title="Documentation" path="/docs" updated="Getting started">
      <p>
        Axiom is an autonomous deep research agent. Full documentation is on its way; here is how to
        get started today.
      </p>
      <h2 className="pt-2 font-serif text-[18px] tracking-[-.02em] text-[var(--ink)]">Running your first research</h2>
      <p>
        From the workspace, ask a specific question in the research bar — for example,{' '}
        <em className="text-[var(--ink)]">&ldquo;What is the supply chain impact of TSMC&rsquo;s 2nm
        delay?&rdquo;</em> — and Axiom will map the evidence, test claims, and assemble a source-backed
        answer.
      </p>
      <h2 className="pt-2 font-serif text-[18px] tracking-[-.02em] text-[var(--ink)]">Reading a report</h2>
      <p>
        Every claim in a completed report carries a source trail. Citations link back to the documents
        Axiom read, so you can verify the evidence yourself.
      </p>
      <h2 className="pt-2 font-serif text-[18px] tracking-[-.02em] text-[var(--ink)]">Need a hand?</h2>
      <p>
        Reach out through the{' '}
        <a href="/contact" className="text-[var(--accent-mid)] underline underline-offset-4">contact page</a>{' '}
        and we&rsquo;ll point you in the right direction.
      </p>
    </DocumentPage>
  );
}
