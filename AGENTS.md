# AGENTS.md

Guidance for AI coding agents working in this repository.

## Project overview

`tmux-integrated` is a VS Code extension that provides seamless tmux integration
for VS Code terminals via tmux's control mode (`-CC`). See [`README.md`](README.md)
for user-facing docs and [`doc/ARCHITECTURE.md`](doc/ARCHITECTURE.md) for design.

## Repository layout

| Path | Purpose |
|------|---------|
| `src/extension.ts` | Activation entry point, command registration |
| `src/tmuxGateway.ts` | High-level session/window orchestration |
| `src/tmuxControlClient.ts` | tmux `-CC` control-mode protocol client |
| `src/tmuxTerminalProvider.ts` | VS Code `Pseudoterminal` implementation |
| `src/windowTitle.ts` | Window/title helpers |
| `out/` | Compiled JS output (do not edit, gitignored) |
| `scripts/update-changelog.js` | Auto-generates `CHANGELOG.md` from `git log` |
| `doc/` | Architecture and release docs |
| `.github/workflows/` | CI: tag-triggered release pipeline |

## Build, lint, package

```bash
npm ci              # install (first time / clean)
npm run compile     # tsc -p ./  → out/
npm run watch       # tsc --watch
npm run lint        # eslint src --ext ts
npx vsce package    # build .vsix locally (for manual testing)
```

The `vscode:prepublish` hook runs `npm run compile`, so packaging always builds
fresh JS.

## Coding conventions

- TypeScript, target as configured in `tsconfig.json`. Do not relax `strict`
  options without good reason.
- Only `src/` is shipped as source; everything else in the package is the
  compiled `out/` plus assets per `.vscodeignore`.
- Public-facing setting names (`tmux-integrated.*`) and command IDs
  (`tmux-integrated.*`) are part of the user contract — renaming them is a
  breaking change and must be called out in commits.
- Don't hand-edit `CHANGELOG.md` or the `version` field in `package.json`;
  both are managed by the release flow (see below).

## Commit messages

`CHANGELOG.md` bullets are generated from `git log` since the previous `v*` tag
by [`scripts/update-changelog.js`](scripts/update-changelog.js):

- Conventional prefixes (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`,
  `style:`, `test:`, `ci:`, `build:`, `perf:`) are stripped — the rest of the
  subject becomes a bullet under **Changed**.
- Version-bump commits (subject matching `0.x.y`, `release:`, `chore: bump
  version`) and merge commits are skipped.
- Write subject lines on `main` as if they were release notes: clear,
  imperative, no trailing period needed.

## Releasing

Releases are fully automated from `main` — never hand-edit `package.json`'s
`version` or `CHANGELOG.md`. Full details and recovery steps are in
[`doc/RELEASE.md`](doc/RELEASE.md).

### Typical patch release

From a clean `main` checkout with everything merged:

```bash
git checkout main
git pull
npm run release
```

This runs `npm version patch` (bumps version, creates commit + `v*` tag), the
`version` lifecycle script (regenerates `CHANGELOG.md` from `git log` and
stages it into the version commit), then `git push --follow-tags`.

Pushing the `v*` tag triggers
[`.github/workflows/release.yml`](.github/workflows/release.yml), which
packages the extension, publishes to the VS Code Marketplace and Open VSX
(when `VSCE_PAT` / `OVSX_PAT` are configured), and creates a GitHub Release
with the `.vsix` attached.

### Minor / major bumps

| Goal  | Command |
|-------|---------|
| Patch | `npm run release` |
| Minor | `npm version minor && git push --follow-tags` |
| Major | `npm version major && git push --follow-tags` |

The `version` lifecycle script regenerates the changelog for any
`npm version` invocation.

### Preview the changelog without releasing

```bash
npm run changelog
git checkout -- CHANGELOG.md   # discard if only previewing
```

### Pre-release checklist

Before running `npm run release`:

1. Working tree is clean and on `main`, up to date with `origin/main`.
2. `npm run compile` and `npm run lint` both pass.
3. Recent commit subjects on `main` read well as changelog bullets (see
   *Commit messages* above).

### If CI fails after the tag is pushed

Fix the workflow or tokens and re-run the release job from GitHub Actions, or
publish locally per [`doc/RELEASE.md`](doc/RELEASE.md) §Manual recovery.
Do **not** delete and recreate the tag once it has been pushed.
