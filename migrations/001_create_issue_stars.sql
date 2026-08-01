CREATE TABLE plugin_robertdevore_paperclip_plugin_starred_is_87537fb6f2.issue_stars (
  user_id text NOT NULL,
  issue_id uuid NOT NULL REFERENCES public.issues(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, issue_id)
);

CREATE INDEX plugin_robertdevore_paperclip_plugin_starred_is_user_created_idx
  ON plugin_robertdevore_paperclip_plugin_starred_is_87537fb6f2.issue_stars (user_id, created_at DESC, issue_id DESC);

CREATE INDEX plugin_robertdevore_paperclip_plugin_starred_is_issue_user_idx
  ON plugin_robertdevore_paperclip_plugin_starred_is_87537fb6f2.issue_stars (issue_id, user_id);
