# Release process

Publishing a new extension version is fully automated from `main`. You do not edit `package.json` or `CHANGELOG.md` by hand.

## Prerequisites

- All changes merged to `main` and the working tree is clean.
- `npm ci` has been run at least once (dependencies for `vsce` / `ovsx`).
- GitHub secrets `VSCE_PAT` and `OVSX_PAT` are configured (marketplace publish steps use `continue-on-error` if a token is missing).

## Cut a release (typical)

From a clean `main` checkout:

```bash
git checkout main
git pull
npm run release
```

This runs:

1. **`npm version patch`** — bumps the patch version in `package.json` (e.g. `0.1.13` → `0.1.14`), creates commit `0.1.14`, and tags `v0.1.14`.
2. **`version` lifecycle script** — runs `scripts/update-changelog.js`, which appends a new `CHANGELOG.md` section from `git log` since the previous `v*` tag (skipping version-bump commits).
3. **`git push --follow-tags`** — pushes `main` and the new tag.

Pushing a `v*` tag triggers [`.github/workflows/release.yml`](../.github/workflows/release.yml), which packages the extension, publishes to the VS Code Marketplace and Open VSX (when tokens are present), and creates a GitHub Release with the `.vsix` attached.

## Other version bumps

| Goal | Command |
|------|---------|
| Patch (default) | `npm run release` |
| Minor | `npm version minor && git push --follow-tags` |
| Major | `npm version major && git push --follow-tags` |

The `version` script still updates `CHANGELOG.md` for any `npm version` invocation.

## Changelog only (no publish)

To preview or regenerate the changelog entry without bumping:

```bash
npm run changelog
git checkout -- CHANGELOG.md   # discard if only testing
```

## Manual recovery

If CI fails after the tag is pushed but before marketplaces update, fix the workflow or tokens and re-run the release job from GitHub Actions, or publish locally:

```bash
npm ci
npx vsce package
npx vsce publish          # requires VSCE_PAT or vsce login
npx ovsx publish *.vsix   # requires OVSX_PAT
```

## Commit message conventions

Changelog bullets are derived from `git log` since the previous tag. Conventional prefixes (`fix:`, `feat:`, `docs:`, etc.) are stripped; the rest becomes a bullet under **Changed**. Use clear subject lines on `main` so the generated changelog reads well.
