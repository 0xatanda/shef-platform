ALTER TABLE projects
ADD COLUMN published_by UUID;

ALTER TABLE projects
ADD CONSTRAINT fk_projects_published_by
FOREIGN KEY (published_by)
REFERENCES users(id);