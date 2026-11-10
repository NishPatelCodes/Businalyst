# Businalyst

## Frontend design

Before creating or changing any UI under `frontend/src`, read `frontend/Design.md` and follow it. It defines the tokens, component patterns, chart conventions and page templates for the app.

- It does not cover the landing page (`frontend/src/landing/`, `frontend/src/pages/landing/`), which is due for a rebuild. Do not copy styles between the landing page and the app.
- Section 10 of that file lists inconsistencies in the existing code. Follow the rule in the document, not the nearby legacy value.
- If a change introduces a new token, pattern or component, update `frontend/Design.md` in the same change.
