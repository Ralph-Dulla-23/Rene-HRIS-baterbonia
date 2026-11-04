# Orientation quiz authoring implementation plan

**Goal:** Let TA/HR edit the existing presentation and four part checkpoints, question counts, question text, choices, correct answers, and explanations.

**Architecture:** Extend the existing localStorage deck configuration with stages and questions. Reuse Recruitment Settings in an orientation-only view linked from NHO management; do not grant access to unrelated settings. The viewer, scoring, completion validation and TA review must consume published configuration.

**Scope:** Existing prototype only; retain deck replacement and slide editing. PPT replacement currently records metadata and does not parse or modify the uploaded PowerPoint binary. Preserve benchmark scoring without making a passing score a completion gate.

- [x] Test legacy configuration defaults, custom questions/scoring, validation of boundaries/counts/answer keys, and orientation-only access.
- [x] Extend deck types/storage and validation; reject incomplete questions and invalid checkpoint placement when publishing.
- [x] Add a per-part editor with checkpoint slide, question count, add/delete/move question, text, answer choices, correct answer and explanation. Keep edits as a draft until publish.
- [x] Connect applicant checkpoints, completion checks and TA review to published configuration; remove fixed five-question/seven-slide assumptions in affected paths.
- [x] Add TA/HR orientation-only navigation; verify affected TSX syntax, imports and regression behavior using available local tooling. Report build/runtime limitations.

**Review focus:** Legacy saved data, empty/invalid input, question removal/reassignment, checkpoint ordering, role isolation and persistence failures.

Validation: Four focused suites passed using installed tooling from the sibling client: configuration/scoring/access, part editor interactions, settings publishing, and the applicant checkpoint-to-completion journey. Local import bundles passed for App, NHO management and Recruitment Settings. Full Vite build is blocked by missing project dependencies. The existing NHO mirror check passes the changed main module but fails on an unchanged NHORoleHeader mirror mismatch, confirmed present at HEAD. No AI Studio or deployed preview was updated.
