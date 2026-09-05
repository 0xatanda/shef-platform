CREATE TABLE project_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    project_id UUID NOT NULL,
    media_id UUID NOT NULL,

    sort_order INTEGER NOT NULL DEFAULT 0,
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_project_media_project
        FOREIGN KEY (project_id)
        REFERENCES projects(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_project_media_media
        FOREIGN KEY (media_id)
        REFERENCES content_media(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_project_media_project_id
    ON project_media(project_id);

CREATE INDEX idx_project_media_media_id
    ON project_media(media_id);

CREATE INDEX idx_project_media_sort_order
    ON project_media(project_id, sort_order);
