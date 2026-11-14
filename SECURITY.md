# Security and publication policy



A static local draft exists; no published website exists. Static hosting is the proposed default. Do not embed tokens, account credentials, private documents, real healthcare records, or privileged execution endpoints.



Use local approved assets and synthetic demonstration snapshots. Treat external Markdown, SVG, and demo content as untrusted; sanitize content, prevent unsafe HTML/script injection, and review external URLs. No arbitrary source-code execution or query submission in the public demo. Outbound links should use safe target behavior. Choose a content-security approach appropriate to the eventual host and verify actual response headers where supported.



No third-party analytics, tracking, remote fonts, contact-form processor, or new external integration without approval. A contact link can use an owner-approved address. Profile details, resume files, screenshots, licenses, and public claims require owner review.



Dependencies, secret scans, browser checks, and deployment permissions must be reviewed before release. Local static checks, targeted secret-pattern checks and browser checks are recorded in docs/launch-verification.md. No comprehensive security audit or deployed-host verification has run. Configure a verified private vulnerability reporting channel before publication; none is currently advertised.

