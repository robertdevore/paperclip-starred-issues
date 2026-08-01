# Starred Issues for Paperclip

This plugin adds a personal, per-user Starred page and a star toggle to every issue header. It uses Paperclip’s native issue list, so sorting, filters, pagination/loading, responsive rows, and issue navigation remain host-owned.

## Install

Build the plugin, then install the local folder into a Paperclip instance:

```bash
pnpm install
pnpm typecheck
pnpm test
pnpm build
paperclipai plugin install /Users/robertdevore/2026/paperclip-starred-issues
```

For an npm installation after publishing:

```bash
paperclipai plugin install @robertdevore/paperclip-plugin-starred-issues
```

The host must include the generic `issueHeaderAction` and `issueIds` extension points used by this plugin. Use a Paperclip release that includes those extensions.

## npm release

The package is configured for public scoped npm publishing. From a clean checkout:

```bash
pnpm install
npm version patch
git push origin main --follow-tags
npm publish --access public
```

Use `npm version minor` or `npm version major` when appropriate. The `prepublishOnly` hook runs typecheck, tests, and a production build before publishing.

## What it registers

- `Starred` sidebar entry at `/:companyPrefix/starred`.
- Starred page using the host `IssuesList` component.
- `issueHeaderAction` extension point next to the built-in Archive action.
- Four board-authenticated API routes under `/api/plugins/robertdevore.paperclip-plugin-starred-issues/api/`.
- A plugin-owned database migration in the host-derived plugin schema.

## Persistence and authorization

The plugin stores only `(user_id, issue_id, created_at)` in `issue_stars`. The composite primary key prevents duplicates, and the issue foreign key cascades on issue deletion. Every route uses the authenticated board actor supplied by Paperclip; caller-supplied user IDs are ignored. Paperclip resolves the issue company and enforces board company access before dispatching issue routes.

The local trusted Paperclip mode uses the stable `board` actor identity. Authenticated deployments use the signed-in user ID, so stars remain personal across sessions and devices.

## Core extension used

The plugin requires two small generic host additions: `issueHeaderAction` lets plugins render entity-scoped actions in the issue header, and `issueIds` lets plugins constrain the native issue list query. Neither behavior is enabled unless a plugin declares the corresponding slot or filter.

## Development

```bash
pnpm dev
pnpm test
```

The SDK snapshot under `.paperclip-sdk/` is generated from the Paperclip checkout used during local development and is intentionally not published to npm. Refresh it when developing against a newer host SDK.

## GitHub release checklist

1. Update the version with `npm version patch`, `minor`, or `major`.
2. Run `pnpm typecheck`, `pnpm test`, and `pnpm build`.
3. Push the commit and tag with `git push origin main --follow-tags`.
4. Publish with `npm publish --access public`.
5. Install the published package into Paperclip and confirm the plugin reports `ready`.
