import "@paperclipai/plugin-sdk/ui";

declare module "@paperclipai/plugin-sdk/ui" {
  interface IssuesListFilters {
    /** Supported by Paperclip hosts with the generic issueIds extension. */
    issueIds?: string[];
  }
}
