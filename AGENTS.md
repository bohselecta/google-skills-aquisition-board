# Google Emergence: Maintainer & Agent Operating Invariants

This document establishes frozen product invariants and instructions for AI agents (Antigravity, Codex, Gemini) and human maintainers working on **Google Emergence**.

---

## 1. Frozen Product Invariants

1. **Human-in-the-Loop Sovereignty:** A capability mark may NEVER change automatically based on background model inference or passive observation. The human employee must explicitly submit an artifact and verify the assessment.
2. **Dual-Mode Assistance Separation:** Independent human performance and Gemini Enterprise assisted execution must NEVER be merged into a single composite score. They answer different questions: unassisted mastery vs. human-plus-AI leverage.
3. **No Social Scoring or Ambient Surveillance:** The system must NEVER implement background screen capture, keystroke telemetry, emotion inference, camera gaze tracking, or automated stack ranking.
4. **Suppression of Small Cohorts:** Comparisons with fewer than 30 participants must remain withheld. Never relax the $k \ge 30$ privacy threshold.
5. **Zero-Telemetry Demo Guarantee:** The client application (`src/app.js`) must not make unconsented external network calls (`fetch`, `XMLHttpRequest`, `WebSocket`, `sendBeacon`). The demo remains 100% offline and browser-local.
6. **Zero-Stub Policy:** All features presented in the user interface must be fully functional and backed by deterministic domain logic in `src/domain.js`.

---

## 2. Verification Protocol

Before committing or releasing modifications:
1. Run `npm test` and verify that all 33 domain tests pass cleanly.
2. Run `npm run build` and ensure `dist/google-emergence.html` is generated without errors.
3. Verify that visual assets (SVG marks, Google Material 3 tokens) render correctly without external CDN breakage.
4. Inspect `git diff` to ensure no proprietary credentials or unconsented telemetry are introduced.
