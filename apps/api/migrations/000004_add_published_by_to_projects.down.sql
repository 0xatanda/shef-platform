ALTER TABLE projects
DROP CONSTRAINT IF EXISTS fk_projects_published_by;

ALTER TABLE projects
DROP COLUMN IF EXISTS published_by;