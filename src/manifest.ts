import type { PaperclipPluginManifestV1 } from "@paperclipai/plugin-sdk";

// The host extension is available in the Paperclip runtime before it is
// present in every published SDK type snapshot.
const manifest = {
  id: "robertdevore.paperclip-plugin-starred-issues",
  apiVersion: 1,
  version: "0.1.1",
  displayName: "Starred Issues",
  description: "Personal starred issues for Paperclip with a sidebar page and issue-header toggle.",
  author: "Robert DeVore",
  categories: ["ui"],
  capabilities: [
    "database.namespace.migrate",
    "database.namespace.read",
    "database.namespace.write",
    "api.routes.register",
    "ui.page.register",
    "ui.sidebar.register",
    "ui.action.register"
  ],
  entrypoints: {
    worker: "./dist/worker.js",
    ui: "./dist/ui"
  },
  database: {
    migrationsDir: "migrations",
    coreReadTables: ["issues"],
  },
  apiRoutes: [
    {
      routeKey: "list-stars",
      method: "GET",
      path: "/stars",
      auth: "board",
      capability: "api.routes.register",
      companyResolution: { from: "query", key: "companyId" },
    },
    {
      routeKey: "get-star",
      method: "GET",
      path: "/issues/:issueId/star",
      auth: "board",
      capability: "api.routes.register",
      companyResolution: { from: "issue", param: "issueId" },
    },
    {
      routeKey: "star-issue",
      method: "POST",
      path: "/issues/:issueId/star",
      auth: "board",
      capability: "api.routes.register",
      companyResolution: { from: "issue", param: "issueId" },
    },
    {
      routeKey: "unstar-issue",
      method: "DELETE",
      path: "/issues/:issueId/star",
      auth: "board",
      capability: "api.routes.register",
      companyResolution: { from: "issue", param: "issueId" },
    },
  ],
  ui: {
    slots: [
      {
        type: "sidebar",
        id: "starred-sidebar",
        displayName: "Starred",
        exportName: "StarredSidebar",
        order: 60,
      },
      {
        type: "page",
        id: "starred-page",
        displayName: "Starred",
        exportName: "StarredPage",
        routePath: "starred",
      },
      {
        type: "issueHeaderAction",
        id: "issue-star-action",
        displayName: "Star issue",
        exportName: "IssueStarAction",
        entityTypes: ["issue"],
        order: 10,
      }
    ]
  }
} as unknown as PaperclipPluginManifestV1;

export default manifest;
