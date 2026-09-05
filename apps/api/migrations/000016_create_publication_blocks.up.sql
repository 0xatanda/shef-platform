CREATE TABLE publication_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    publication_id UUID NOT NULL,

    type VARCHAR(20) NOT NULL,
    content TEXT,

    media_id UUID NULL,

    sort_order INTEGER NOT NULL DEFAULT 0,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_publication_blocks_publication
        FOREIGN KEY (publication_id)
        REFERENCES publications(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_publication_blocks_media
        FOREIGN KEY (media_id)
        REFERENCES content_media(id)
        ON DELETE SET NULL
);

CREATE INDEX idx_publication_blocks_publication_id
    ON publication_blocks(publication_id);

CREATE INDEX idx_publication_blocks_media_id
    ON publication_blocks(media_id);

CREATE INDEX idx_publication_blocks_sort_order
    ON publication_blocks(publication_id, sort_order);