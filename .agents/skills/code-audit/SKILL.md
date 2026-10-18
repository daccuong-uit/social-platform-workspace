---
name: code-audit
description: "Use when reviewing code for correctness, security, architecture boundaries, and missing tests; report concrete findings before summaries."
---

# Code Audit

1. Establish the review scope and inspect the working tree before judging changes.
2. Trace each relevant behavior through its callers, persistence boundary, and consumers.
3. Prioritize reproducible bugs, security risks, data loss, and behavioral regressions.
4. Check secrets, cross-service imports, database ownership, authorization, and event reliability where relevant.
5. Report findings first with file references and impact. State assumptions and test gaps separately.

Do not make code changes during a review unless the user explicitly asks to fix the findings.