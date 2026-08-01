# Starred Issues for Paperclip

This plugin adds a personal, per-user Starred page and a star toggle to every issue header. It uses Paperclip’s native issue list, so sorting, filters, pagination/loading, responsive rows, and issue navigation remain host-owned.

Package: `@robertdevore/paperclip-plugin-starred-issues`

Source: https://github.com/robertdevore/paperclip-starred-issues

## Install from npm

After the package is published, install it into a Paperclip instance with the Paperclip CLI or Plugin Manager:

```bash
paperclipai plugin install @robertdevore/paperclip-plugin-starred-issues
paperclipai plugin inspect robertdevore.paperclip-plugin-starred-issues
```

The plugin must report `status=ready`. The host must include the generic `issueHeaderAction` and `issueIds` extension points used by this plugin. Use a Paperclip release that includes those extensions.

## Install from a local checkout

For development or testing changes before publishing:

```bash
git clone https://github.com/robertdevore/paperclip-starred-issues.git
cd paperclip-starred-issues
pnpm install
pnpm typecheck
pnpm test
pnpm build
paperclipai plugin install "$PWD"
```

Paperclip watches the local plugin’s built `dist/` files. Run `pnpm dev` in the checkout while iterating on source changes.

## Compatibility

- Node.js 20 or newer is required for local development and package execution.
- The plugin uses Paperclip’s board-authenticated plugin API routes.
- Stars are personal to the authenticated Paperclip user in authenticated deployments.
- In local trusted mode, Paperclip uses the stable `board` actor identity.

## Publish to npm

The package is configured as a public scoped package. npm requires an npm account and either account 2FA or a granular access token configured to bypass 2FA for direct publishing. Publish the first release from a clean checkout:

```bash
cd paperclip-starred-issues
pnpm install
npm login
npm whoami
npm pack --dry-run
npm publish --access public
```

The `prepublishOnly` hook automatically runs typecheck, tests, and a production build. The npm tarball contains only `dist/`, `migrations/`, `README.md`, `LICENSE`, and `package.json`; development SDK snapshots, source, tests, and lockfiles are excluded.

After publishing, verify the package is public and installable:

```bash
npm view @robertdevore/paperclip-plugin-starred-issues version
paperclipai plugin install @robertdevore/paperclip-plugin-starred-issues
```

For later releases, update the version, push the commit and tag, then publish:

```bash
npm version patch   # or minor / major
git push origin main --follow-tags
npm publish --access public
```

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

1. Make the GitHub repository public if you want others to browse or clone the source.
2. Update the version with `npm version patch`, `minor`, or `major`.
3. Run `pnpm typecheck`, `pnpm test`, `pnpm build`, and `npm pack --dry-run`.
4. Push the commit and tag with `git push origin main --follow-tags`.
5. Publish with `npm publish --access public`.
6. Install the published package into Paperclip and confirm the plugin reports `ready`.
