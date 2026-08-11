import { DocumentPage } from '@/pages/document-page';

export default function PrivacyPage() {
  return (
    <DocumentPage title="Privacy policy" path="/privacy" updated="Last updated March 2026">
      <p>
        Axiom Research is built around one principle: your research stays yours. This policy is a
        working draft and will be expanded as the product matures.
      </p>
      <h2 className="pt-2 font-serif text-[18px] tracking-[-.02em] text-[var(--ink)]">What we collect</h2>
      <p>
        We collect the account details you provide — an email address and password — along with the
        research questions you run, the sources we read on your behalf, and the reports we generate.
      </p>
      <h2 className="pt-2 font-serif text-[18px] tracking-[-.02em] text-[var(--ink)]">What we do not do</h2>
      <p>
        Your sources and reports are never used to train AI models. They are scoped to your private
        workspace and are never shared with other users.
      </p>
      <h2 className="pt-2 font-serif text-[18px] tracking-[-.02em] text-[var(--ink)]">Your controls</h2>
      <p>
        You can delete any research trail at any time, and you can purge inactive cached source data
        from your workspace settings. Questions about this policy can be sent via the{' '}
        <a href="/contact" className="text-[var(--accent-mid)] underline underline-offset-4">contact page</a>.
      </p>
    </DocumentPage>
  );
}
