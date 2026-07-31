import { describe, expect, it } from "vitest";
import { createTestHarness } from "@paperclipai/plugin-sdk/testing";
import manifest from "../src/manifest.js";
import plugin from "../src/worker.js";

describe("Starred Issues plugin", () => {
  it("declares the page, sidebar, header action, database, and API surfaces", () => {
    expect(manifest.database?.coreReadTables).toContain("issues");
    expect(manifest.apiRoutes?.map((route) => route.routeKey)).toEqual([
      "list-stars", "get-star", "star-issue", "unstar-issue",
    ]);
    expect(manifest.ui?.slots?.map((slot) => slot.type)).toEqual([
      "sidebar", "page", "issueHeaderAction",
    ]);
  });

  it("uses the authenticated actor and an idempotent insert", async () => {
    const harness = createTestHarness({ manifest });
    await plugin.definition.setup(harness.ctx);

    const response = await plugin.definition.onApiRequest?.({
      routeKey: "star-issue",
      method: "POST",
      path: "/issues/11111111-1111-4111-8111-111111111111/star",
      params: { issueId: "11111111-1111-4111-8111-111111111111" },
      query: {},
      body: null,
      actor: { actorType: "user", actorId: "user-1", userId: "user-1" },
      companyId: "company-1",
      headers: {},
    });

    expect(response?.body).toEqual({ starred: true });
    expect(harness.dbExecutes.at(-1)?.sql).toContain("ON CONFLICT (user_id, issue_id) DO NOTHING");
    expect(harness.dbExecutes.at(-1)?.params).toEqual(["user-1", "11111111-1111-4111-8111-111111111111"]);
  });

  it("limits list results to the authenticated user and company", async () => {
    const harness = createTestHarness({ manifest });
    await plugin.definition.setup(harness.ctx);

    const response = await plugin.definition.onApiRequest?.({
      routeKey: "list-stars",
      method: "GET",
      path: "/stars",
      params: {},
      query: { companyId: "company-1" },
      body: null,
      actor: { actorType: "user", actorId: "user-1", userId: "user-1" },
      companyId: "company-1",
      headers: {},
    });

    expect(response?.body).toEqual({ issueIds: [] });
    expect(harness.dbQueries.at(-1)?.sql).toContain("stars.user_id = $1 AND issues.company_id = $2");
    expect(harness.dbQueries.at(-1)?.params).toEqual(["user-1", "company-1"]);
  });
});
