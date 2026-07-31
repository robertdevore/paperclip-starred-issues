import {
  IssuesList,
  useHostContext,
  useHostLocation,
  useHostNavigation,
  usePluginToast,
  type PluginDetailTabProps,
  type PluginPageProps,
  type PluginSidebarProps,
} from "@paperclipai/plugin-sdk/ui";
import { useCallback, useEffect, useState } from "react";

const PLUGIN_ID = "robertdevore.paperclip-plugin-starred-issues";

type StarsResponse = { issueIds: string[] };
type StarResponse = { starred: boolean };

async function callStarApi<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api/plugins/${encodeURIComponent(PLUGIN_ID)}/api${path}`, {
    credentials: "same-origin",
    headers: { "content-type": "application/json", ...(init?.headers ?? {}) },
    ...init,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(typeof payload?.error === "string" ? payload.error : `Request failed (${response.status})`);
  return payload as T;
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-2.9-5.6 2.9 1.1-6.2L3 9.6l6.2-.9L12 3Z" />
    </svg>
  );
}

export function StarredSidebar({ context }: PluginSidebarProps) {
  const navigation = useHostNavigation();
  const location = useHostLocation();
  const href = "/starred";
  const active = location.pathname.endsWith("/starred") || location.pathname === "/starred";
  return (
    <a
      {...navigation.linkProps(href)}
      aria-current={active ? "page" : undefined}
      className={`flex items-center gap-2.5 mx-2 rounded-lg px-2 py-1.5 text-(length:--text-compact) font-medium transition-colors ${active ? "bg-accent text-foreground" : "text-foreground/80 hover:bg-accent/50 hover:text-foreground"}`}
      title="Starred"
    >
      <StarIcon filled={active} />
      <span className="truncate">Starred</span>
    </a>
  );
}

export function StarredPage({ context }: PluginPageProps) {
  const [issueIds, setIssueIds] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const refresh = useCallback(async () => {
    if (!context.companyId) return;
    setError(null);
    try {
      const response = await callStarApi<StarsResponse>(`/stars?companyId=${encodeURIComponent(context.companyId)}`);
      setIssueIds(response.issueIds);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load starred issues.");
    }
  }, [context.companyId]);

  useEffect(() => { void refresh(); }, [refresh]);

  if (!context.companyId) return <div className="p-6 text-sm text-muted-foreground">Select a company to view starred issues.</div>;
  if (error) return <div className="p-6 text-sm text-destructive" role="alert">{error}</div>;
  if (issueIds === null) return <div className="p-6 text-sm text-muted-foreground" role="status">Loading starred issues...</div>;
  if (issueIds.length === 0) {
    return (
      <main className="mx-auto w-full max-w-7xl space-y-3 p-6">
        <h1 className="text-xl font-semibold">Starred</h1>
        <div className="rounded-lg border border-dashed border-border p-10 text-center">
          <p className="font-medium">You haven&apos;t starred any issues yet.</p>
          <p className="mt-1 text-sm text-muted-foreground">Star an issue from its issue page to find it here.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-7xl space-y-4 p-6">
      <div>
        <h1 className="text-xl font-semibold">Starred</h1>
        <p className="mt-1 text-sm text-muted-foreground">Your starred issues, with the standard Paperclip task list controls.</p>
      </div>
      <IssuesList
        companyId={context.companyId}
        filters={{ issueIds }}
        viewStateKey="paperclip:starred-issues-view"
        createIssueLabel="Create task"
      />
    </main>
  );
}

export function IssueStarAction({ context }: PluginDetailTabProps) {
  const toast = usePluginToast();
  const hostContext = useHostContext();
  const [starred, setStarred] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [pending, setPending] = useState(false);
  const issueId = context.entityId;

  useEffect(() => {
    let cancelled = false;
    setLoaded(false);
    void callStarApi<StarResponse>(`/issues/${encodeURIComponent(issueId)}/star`).then((response) => {
      if (!cancelled) { setStarred(response.starred); setLoaded(true); }
    }).catch((cause) => {
      if (!cancelled) { setLoaded(true); toast({ title: "Unable to load star state", body: cause instanceof Error ? cause.message : "Please try again.", tone: "error" }); }
    });
    return () => { cancelled = true; };
  }, [issueId, toast]);

  const toggle = async () => {
    if (pending || !loaded || !hostContext.companyId) return;
    const next = !starred;
    setStarred(next);
    setPending(true);
    try {
      await callStarApi<StarResponse>(`/issues/${encodeURIComponent(issueId)}/star`, { method: next ? "POST" : "DELETE" });
    } catch (cause) {
      setStarred(!next);
      toast({ title: next ? "Unable to star issue" : "Unable to remove star", body: cause instanceof Error ? cause.message : "Please try again.", tone: "error" });
    } finally {
      setPending(false);
    }
  };

  return (
    <button
      type="button"
      className={`inline-flex h-6 w-6 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${starred ? "text-amber-500" : ""}`}
      onClick={(event) => { event.stopPropagation(); void toggle(); }}
      onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") event.stopPropagation(); }}
      disabled={pending || !loaded}
      aria-label={starred ? "Remove from starred" : "Star issue"}
      title={starred ? "Remove from starred" : "Star issue"}
      aria-pressed={starred}
    >
      <StarIcon filled={starred} />
    </button>
  );
}
