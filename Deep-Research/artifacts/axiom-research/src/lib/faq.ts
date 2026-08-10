export type FaqItem = {
  question: string;
  answer: string;
};

export const faqItems: FaqItem[] = [
  {
    question: 'How does Axiom ensure zero AI hallucinations in research reports?',
    answer:
      'Axiom runs every synthesized claim through a dedicated verification pass. After the multi-agent pipeline drafts a report, a natural-language inference (NLI) model scores each claim against the exact source passages it was derived from. Claims that lack direct, independently verified support are flagged, rewritten, or removed before publication — and every surviving claim carries an inline citation linking back to its source.',
  },
  {
    question: "What is the difference between standard search engines and Axiom's AI agent?",
    answer:
      'A search engine returns a ranked list of links and leaves the synthesis to you. Axiom operates as an autonomous multi-agent research system: a planner breaks your question into sub-topics, specialized agents scrape and read full documents across the web in real time, a neural vector index retrieves the most relevant passages, and a verifier fact-checks each claim before a citation-backed report is assembled. The result is a defensible research trail, not a link list.',
  },
  {
    question: 'How does Axiom enforce user data privacy and tenant isolation?',
    answer:
      'Every workspace is isolated at the database level using SQL row-level filtering, so each user only ever queries and retrieves rows belonging to their own tenant. Sources, reports, and research history are scoped to the workspace, encrypted in transit and at rest, and never shared across accounts. This guarantees zero data leakage between user workspaces.',
  },
  {
    question: 'What are the daily research report quotas for the free tier?',
    answer:
      'The free tier includes 5 deep research reports per day. The quota resets automatically every 24 hours at midnight UTC, and your remaining allowance is shown directly in the workspace so you always know where you stand.',
  },
];
