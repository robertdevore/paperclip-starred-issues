# Starred Issues for Paperclip

This plugin adds a personal, per-user Starred page and a star toggle to every issue header. It uses Paperclip’s native issue list, so sorting, filters, pagination/loading, responsive rows, and issue navigation remain host-owned.

## Install

Build the plugin, then install the local folder into a Paperclip instance:

```bash
pnpm install
pnpm typecheck
pnpm test
pnpm build
paperclipai plugin install /Users/robertdevore/2026/paperclip-plugin-starred-issues
```

For publishing, build and publish this package to npm, then install the package name from Paperclip’s plugin manager.

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

The SDK snapshot under `.paperclip-sdk/` is generated from the Paperclip checkout used during local development. Refresh it when developing against a newer host SDK.
