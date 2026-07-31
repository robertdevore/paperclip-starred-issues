CREATE TABLE issue_stars (
  user_id text NOT NULL,
  issue_id uuid NOT NULL REFERENCES public.issues(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, issue_id)
);

CREATE INDEX issue_stars_user_created_idx
  ON issue_stars (user_id, created_at DESC, issue_id DESC);

CREATE INDEX issue_stars_issue_user_idx
  ON issue_stars (issue_id, user_id);
