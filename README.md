# Rohith Varma — engineering portfolio

Status: implemented and locally checked static draft. Not deployed or approved for publication.

A classic editorial portfolio with MediFlow's verified local implementation, Agentic DataOps clearly labeled as design-stage work, an interactive architecture explanation, and recorded synthetic scenarios. No live pipeline or AI runs in the browser.

## Preview and verification

From this folder, use existing Node:

```powershell
$env:PORTFOLIO_PRIVATE_TERMS = '["private-account-name","other-private-identifier"]'
node scripts/check.mjs
node scripts/preview.mjs
```

Open http://127.0.0.1:4173 and stop with Ctrl+C. No install or build step is required. `dist/` contains the nine deployment assets, including complete licensing notices; it is intentionally tracked. The preview serves only these files on loopback. Node 20.17.0 was used locally; it is end-of-life and should be reviewed before future CI use. Production static hosting needs no Node runtime.

- [Design](docs/design-brief.md)
- [Content evidence](docs/content-evidence-register.md)
- [Acceptance checks](docs/acceptance-scenarios.md)
- [Actual verification and file inventory](PUBLICATION.md)
- [Deployment candidate hashes](PUBLICATION.md)
- [Security](SECURITY.md)

The owner approved identity details for this local draft only. No email, LinkedIn or downloadable resume is included. GitHub profile identity is verified; project repository URLs are pending. No dependencies, external fonts, analytics or third-party browser requests are needed. Existing workflow drafts have not run on GitHub and are not deployment evidence.

Future publication must approve exact assets, personal content, final license files, repository visibility, hosting and workflow permissions. Serve only the approved static asset set, never internal documentation or raw runtime artifacts. The three repositories are staged privately under RohithVarmaD07; public release and website deployment require separate approval.

The privacy checker requires nonempty `PORTFOLIO_PRIVATE_TERMS` JSON configuration supplied locally, never committed. Include every private identifier that must be excluded; matching is case-insensitive. It also rejects generic private paths, key markers and emails. Checker regression tests use `node --test scripts/check.test.mjs` with `PORTFOLIO_TEST_ROOT` pointing to a new isolated evidence directory. Test fixtures are retained; no source website assets are mutated.

## License

Original covered materials use the [MIT License](LICENSE), Copyright (c) 2026 Rohith Varma. Read the [scope and exclusions](LICENSE_SCOPE.md) and [third-party review](THIRD_PARTY.md). Personal materials are reserved, including personal content embedded in HTML. These files are prepared locally; publication still requires owner approval.
