import { DocumentPage } from '@/pages/document-page';

export default function TermsPage() {
  return (
    <DocumentPage title="Terms of service" path="/terms" updated="Last updated March 2026">
      <p>
        These terms describe how Axiom Research is made available and what you can expect when you
        use it. This is a working draft and will be expanded as the product matures.
      </p>
      <h2 className="pt-2 font-serif text-[18px] tracking-[-.02em] text-[var(--ink)]">Use of the service</h2>
      <p>
        Axiom provides autonomous deep research: you ask a question and it returns a citation-backed
        report. You are responsible for the questions you run and how you use the results, which are
        provided for research purposes only.
      </p>
      <h2 className="pt-2 font-serif text-[18px] tracking-[-.02em] text-[var(--ink)]">Limits</h2>
      <p>
        Free accounts receive a limited number of research runs per day. We may change or retire
        features over time as the product evolves.
      </p>
      <h2 className="pt-2 font-serif text-[18px] tracking-[-.02em] text-[var(--ink)]">Contact</h2>
      <p>
        Questions about these terms can be sent via the{' '}
        <a href="/contact" className="text-[var(--accent-mid)] underline underline-offset-4">contact page</a>.
      </p>
    </DocumentPage>
  );
}
