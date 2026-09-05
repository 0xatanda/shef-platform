CREATE TABLE publication_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    publication_id UUID NOT NULL,
    media_id UUID NOT NULL,

    sort_order INTEGER NOT NULL DEFAULT 0,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_publication_media_publication
        FOREIGN KEY (publication_id)
        REFERENCES publications(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_publication_media_media
        FOREIGN KEY (media_id)
        REFERENCES content_media(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_publication_media_publication_id
    ON publication_media(publication_id);

CREATE INDEX idx_publication_media_media_id
    ON publication_media(media_id);

CREATE INDEX idx_publication_media_sort_order
    ON publication_media(publication_id, sort_order);