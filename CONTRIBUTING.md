# Contributing to Axiom

Welcome to the Axiom Multi-Agent research project. Axiom is an enterprise-grade autonomous
deep research system built around a multi-agent orchestration architecture — LangGraph-driven
agent topologies, PyTorch vector embeddings, and a deterministic verification pipeline that
produces citation-grounded reports.

Thank you for considering a contribution. Whether you are fixing a bug, hardening a security
boundary, or tuning LPU latency, your work matters — and it will be held to a high bar.

> **Our standard:** Axiom's core philosophy is **deterministic, hallucination-free AI**.
> Every contribution must uphold strict performance, accuracy, and verification standards.
> Contributions that cannot demonstrate correctness, or that regress latency or hallucination
> rates, will not be merged.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Repository Layout](#repository-layout)
- [Development Setup](#development-setup)
- [Branching Strategy](#branching-strategy)
- [Commit Conventions](#commit-conventions)
- [Pull Request Quality Gate](#pull-request-quality-gate)
- [Benchmark Requirements](#benchmark-requirements)
- [Code Review Expectations](#code-review-expectations)
- [Security & Vulnerability Reporting](#security--vulnerability-reporting)
- [Questions & Contact](#questions--contact)

---

## Code of Conduct

Contributions must be professional, constructive, and respectful. Harassment,
discrimination, or hostility of any kind is not tolerated. All interactions — code,
reviews, and issue discussions — are expected to uphold the standards of a serious
engineering organization. Maintainers reserve the right to block or ban contributors
who do not.

---

## Repository Layout

| Path | Responsibility |
| --- | --- |
| `Deep-Research/artifacts/axiom-research/` | Web application (React + Vite) and workspace client |
| `Deep-Research/` | Deep research orchestration, agents, and shared infrastructure |
| `venv/` | Local Python environment for LangGraph / PyTorch components |

Package-manager commands in this guide use the workspace filter pattern shown below.
Always run commands from the repository root.

---

## Development Setup

1. **Clone and branch.** Create your working branch from `develop` (see
   [Branching Strategy](#branching-strategy)).

   ```bash
   git checkout develop
   git checkout -b feat/your-feature
   ```

2. **Install dependencies.**

   ```bash
   pnpm install
   ```

3. **Run the verification loop before submitting.** At a minimum:

   ```bash
   pnpm --filter @workspace/axiom-research run typecheck
   ```

   Then run the project's standard lint and production build checks for any package
   you touched:

   ```bash
   pnpm --filter @workspace/axiom-research run build
   ```

4. **Write tests.** New behavior must ship with corresponding tests. Changes to
   agent orchestration or embedding behavior must additionally include benchmark
   notes (see [Benchmark Requirements](#benchmark-requirements)).

---

## Branching Strategy

Axiom uses a strict, trunk-based-like integration model with a protected release line.

- `main` is the **production release branch**. It is protected. No direct commits,
  no direct pushes. Only maintainers merge into it, and only from a vetted `develop`.
- `develop` is the **integration branch**. **All pull requests must target `develop`.**
  This is non-negotiable. PRs opened against `main` will be closed without review.
- Feature work **never** touches `main` or `develop` directly.

### Branch Naming Conventions

Every branch must use one of the following prefixes, followed by a short,
lowercase, hyphen-delimited description:

| Prefix | Purpose | Example |
| --- | --- | --- |
| `feat/` | New features and functional additions | `feat/agent/regulatory-verification-tool` |
| `fix/` | Bug fixes | `fix/embeddings/typo-token-mismatch` |
| `docs/` | Documentation only | `docs/api/reference-typo` |
| `perf/` | Performance work (e.g., LPU optimizations) | `perf/lpu/ttft-latency-reduction` |

Do not include issue numbers in branch names. Keep descriptions specific; a branch
named `feat/fixes` will be rejected.

---

## Commit Conventions

Axiom mandates **Conventional Commits**. Every commit message must be structured as:

```
<type>(<scope>): <subject>
```

| Type | Description |
| --- | --- |
| `feat` | New feature |
| `fix` | Bug fix |
| `perf` | Performance improvement (no functional change) |
| `docs` | Documentation only |
| `refactor` | Code change with no behavioral change |
| `test` | Tests only |
| `build` / `ci` | Build system or CI changes |
| `chore` | Maintenance, dependencies, tooling |

Examples:

```text
feat(agent): add new regulatory verification tool
fix(embeddings): correct token truncation for long documents
perf(lpu): reduce median time-to-first-token by 12%
docs(security): document tenant isolation boundaries
```

Rules:

- Use the **imperative mood**, lowercase subject, no trailing period.
- Keep the subject under 72 characters.
- Reference related issues in the commit body, not the subject.
- Squash-merge commit history is preferred; your final squashed message must
  also follow Conventional Commits.

---

## Pull Request Quality Gate

Every pull request must satisfy the full checklist below. A PR that does not clear
every gate will be returned with a **`request-changes`** review or closed.

### Required Checklist

- [ ] Title follows Conventional Commits (e.g., `feat(agent): add regulatory verification tool`).
- [ ] Target branch is `develop`; branch name follows the `feat/`, `fix/`, `docs/`, or `perf/` convention.
- [ ] `pnpm --filter @workspace/axiom-research run typecheck` passes with **zero** errors.
- [ ] Standard linting passes with zero errors and zero new warnings.
- [ ] Production build passes cleanly (e.g., `pnpm --filter @workspace/axiom-research run build`).
- [ ] New functionality is covered by tests; existing tests still pass.
- [ ] No unrelated changes, formatting churn, or stray files.
- [ ] No secrets, credentials, API keys, or personal data in code, commits, or diffs.
- [ ] PR description documents the problem, the change, and the verification performed.

### Benchmark Requirements

Changes touching **LangGraph orchestration** or **PyTorch vector embeddings** must
include benchmark notes demonstrating **no regression** in either of:

- **Latency** — specifically **time-to-first-token (TTFT)** and end-to-end report
  generation time.
- **Accuracy** — specifically **hallucination rate**, measured via the NLI
  verification pass over a fixed evaluation corpus.

Benchmark notes should state the baseline, the measured result, and the methodology.
Perf-related work (`perf/...`) must additionally show the expected improvement.
Regressions without a documented, maintainer-approved trade-off will block the merge.

---

## Code Review Expectations

- Reviews are required for **every** pull request. A PR is not mergeable without at
  least one maintainer approval.
- Respond to review feedback promptly and address every comment — do not resolve
  discussions without a reply.
- Maintainers review for correctness, determinism, security boundaries, and performance.
  Expect rigorous questions about anything that could weaken Axiom's
  hallucination-free guarantees.

---

## Security & Vulnerability Reporting

Security is taken seriously at Axiom. This project handles sensitive functionality:
**multi-tenant data isolation** and **resilience against prompt injection** among them.

> **Do NOT open a public GitHub issue for a security vulnerability.**
> Publicly disclosing a vulnerability — especially one related to tenant isolation,
> access control, or prompt injection — endangers every Axiom workspace.

### Coordinated Disclosure

1. Email **`muhaddas.workspace@gmail.com`** with the subject
   `[Axiom Security] <brief description>`.
2. Include, at minimum:
   - A clear description of the vulnerability and its impact.
   - The affected components and version.
   - A minimal, reproducible proof of concept.
   - Any suggested remediation, if you have one.
3. You will receive an acknowledgment within **48 hours** and a coordinated
   disclosure timeline from the maintainers.
4. We request a **90-day coordinated disclosure window** from the date of first
   contact before any public publication. We will work with you to confirm fixes
   are in place before disclosure.
5. If you report in good faith, you will not face legal action; responsible
   researchers will be credited in the security advisory.

Reported issues are triaged privately and fixed outside of the public issue
tracker. Do not test vulnerabilities against production infrastructure.

---

## Questions & Contact

- **Maintainers & security:** `muhaddas.workspace@gmail.com`
- For non-security questions, open a discussion in the issue tracker before
  writing code, so scope and expectations are clear.

---

_Thank you for helping keep Axiom deterministic, fast, and trustworthy._
