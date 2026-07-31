import { definePlugin, runWorker, type PluginApiRequestInput, type PluginApiResponse, type PluginDatabaseClient } from "@paperclipai/plugin-sdk";

type StarRow = { issueId: string };

function actorUserId(input: PluginApiRequestInput): string {
  if (input.actor.actorType !== "user") throw new Error("Starred issues require board user authentication");
  const userId = input.actor.userId?.trim() || input.actor.actorId.trim();
  if (!userId) throw new Error("Authenticated board user is required");
  return userId;
}

function issueId(input: PluginApiRequestInput): string {
  const value = input.params.issueId?.trim();
  if (!value) throw new Error("issueId is required");
  return value;
}

function json(status: number, body: unknown): PluginApiResponse {
  return { status, headers: { "content-type": "application/json" }, body };
}

let database: PluginDatabaseClient | null = null;

function getDatabase(): PluginDatabaseClient {
  if (!database) throw new Error("Starred Issues database is not initialized");
  return database;
}

const plugin = definePlugin({
  async setup(ctx) {
    database = ctx.db;
    ctx.logger.info("Starred Issues plugin initialized", { namespace: ctx.db.namespace });
  },

  async onApiRequest(input) {
    const userId = actorUserId(input);

    if (input.routeKey === "list-stars") {
      const db = getDatabase();
      const rows = await db.query<StarRow>(
        `SELECT stars.issue_id AS "issueId"
           FROM ${db.namespace}.issue_stars stars
           INNER JOIN public.issues issues ON issues.id = stars.issue_id
          WHERE stars.user_id = $1 AND issues.company_id = $2
          ORDER BY stars.created_at DESC, stars.issue_id DESC`,
        [userId, input.companyId],
      );
      return json(200, { issueIds: rows.map((row) => row.issueId) });
    }

    const currentIssueId = issueId(input);
    if (input.routeKey === "get-star") {
      const db = getDatabase();
      const rows = await db.query<{ starred: boolean }>(
        `SELECT EXISTS(
           SELECT 1
             FROM ${db.namespace}.issue_stars stars
             INNER JOIN public.issues issues ON issues.id = stars.issue_id
            WHERE stars.user_id = $1 AND stars.issue_id = $2 AND issues.company_id = $3
         ) AS starred`,
        [userId, currentIssueId, input.companyId],
      );
      return json(200, { starred: rows[0]?.starred === true });
    }

    if (input.routeKey === "star-issue") {
      const db = getDatabase();
      await db.execute(
        `INSERT INTO ${db.namespace}.issue_stars (user_id, issue_id)
         VALUES ($1, $2)
         ON CONFLICT (user_id, issue_id) DO NOTHING`,
        [userId, currentIssueId],
      );
      return json(200, { starred: true });
    }

    if (input.routeKey === "unstar-issue") {
      const db = getDatabase();
      await db.execute(
        `DELETE FROM ${db.namespace}.issue_stars
          WHERE user_id = $1 AND issue_id = $2`,
        [userId, currentIssueId],
      );
      return json(200, { starred: false });
    }

    return json(404, { error: "Starred issues route not found" });
  },

  async onHealth() {
    return { status: "ok", message: "Plugin worker is running" };
  }
});

export default plugin;
runWorker(plugin, import.meta.url);
