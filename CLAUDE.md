# Businalyst

## Frontend design

Before creating or changing any UI under `frontend/src`, read `frontend/Design.md` and follow it. It defines the tokens, component patterns, chart conventions and page templates for the app.

- The landing page (`frontend/src/landing/`) follows it too; section 11 lists the marketing-only differences. Landing tokens are in `frontend/src/landing/tokens/tokens.css` and must stay in step with `frontend/src/index.css`.
- Section 10 of that file lists inconsistencies in the existing code. Follow the rule in the document, not the nearby legacy value.
- If a change introduces a new token, pattern or component, update `frontend/Design.md` in the same change.
