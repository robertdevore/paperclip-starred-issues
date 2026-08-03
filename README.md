# Starred Issues for Paperclip

Add personal starred issues to Paperclip: a **Starred** sidebar page, a star toggle in every issue header, and persistent per-user storage.

This is a published, ready-to-install Paperclip plugin.

- npm: [`@robertdevore/paperclip-plugin-starred-issues`](https://www.npmjs.com/package/@robertdevore/paperclip-plugin-starred-issues)
- Source and releases: [github.com/robertdevore/paperclip-starred-issues](https://github.com/robertdevore/paperclip-starred-issues)
- Current release: [`v0.1.1`](https://github.com/robertdevore/paperclip-starred-issues/releases/tag/v0.1.1)

## Install the published plugin

Install it into a Paperclip instance with the Paperclip CLI or Plugin Manager:

```bash
paperclipai plugin install @robertdevore/paperclip-plugin-starred-issues
paperclipai plugin inspect robertdevore.paperclip-plugin-starred-issues
```

The inspection should report `status=ready`. Once installed, reload Paperclip if necessary. You will see **Starred** in the sidebar and a star button in each issue header.

## Requirements

- Paperclip with external plugin support.
- Node.js 20 or newer on the Paperclip host.

### Current Paperclip compatibility status

This plugin is a reference implementation for two Paperclip extension points that are not currently available in the published Paperclip host/SDK. It is not expected to work on an unmodified Paperclip release until these features are accepted upstream:

- `issueHeaderAction` is a core UI slot. Paperclip renders the slot in the issue header and passes the issue context to the plugin component.
- `issueIds` is a core `IssuesList` filter. Paperclip carries the list of IDs through the SDK and issue-list API so the plugin can reuse the native list UI.

These are host features, not methods that a plugin author can implement inside the plugin while still using the native Paperclip issue header and issue-list controls. The compatibility shims (`src/manifest.ts` and `src/host-compat.d.ts`) only let the plugin compile against the current published SDK; they do not add the missing host behavior. The plugin uses Paperclip’s board-authenticated plugin API routes; in authenticated deployments, stars are personal to the signed-in user.

## How it works

- Open an issue and select the star button in the issue header.
- Open **Starred** in the sidebar to see your starred issues.
- Use the standard Paperclip issue-list controls on the Starred page.
- Select the star button again to remove an issue from Starred.

The plugin stores only `(user_id, issue_id, created_at)` in its own `issue_stars` table. Duplicate stars are prevented by the composite primary key, and stars are removed automatically when an issue is deleted.

## Local development

Clone the public repository when developing or testing changes locally:

```bash
git clone https://github.com/robertdevore/paperclip-starred-issues.git
cd paperclip-starred-issues
pnpm install
pnpm typecheck
pnpm test
pnpm build
paperclipai plugin install "$PWD"
pnpm dev
```

Paperclip watches the local plugin’s built `dist/` files while `pnpm dev` is running. The repository uses the published `@paperclipai/plugin-sdk`, so a fresh clone does not require a local Paperclip checkout or ignored SDK snapshot.

## Release maintenance

The npm package and GitHub repository are both public. Maintainers can publish a new release with:

```bash
npm version patch   # or minor / major
pnpm typecheck
pnpm test
pnpm build
npm pack --dry-run
git push origin main --follow-tags
npm publish --access public
gh release create vX.Y.Z --title "vX.Y.Z" --generate-notes
```

Verify the published package and release:

```bash
npm view @robertdevore/paperclip-plugin-starred-issues version
paperclipai plugin install @robertdevore/paperclip-plugin-starred-issues
paperclipai plugin inspect robertdevore.paperclip-plugin-starred-issues
```

The package tarball contains only the built plugin, migration, README, license, and package metadata. Source, tests, development SDK snapshots, and lockfiles are not included.

## License

MIT
