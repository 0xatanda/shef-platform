CREATE TABLE content_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    type VARCHAR(20) NOT NULL,
    title VARCHAR(255),
    description TEXT,
    url TEXT NOT NULL,
    thumbnail_url TEXT,
    youtube_video_id VARCHAR(100),
    alt_text VARCHAR(255),

    created_by UUID,
    updated_by UUID,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

CREATE INDEX idx_content_media_deleted_at
    ON content_media(deleted_at);

CREATE INDEX idx_content_media_type
    ON content_media(type);
