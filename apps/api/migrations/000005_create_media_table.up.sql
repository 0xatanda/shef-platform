CREATE TABLE media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    original_name TEXT NOT NULL,

    filename TEXT NOT NULL,

    mime_type VARCHAR(255) NOT NULL,

    size BIGINT NOT NULL,

    path TEXT NOT NULL,

    url TEXT NOT NULL,

    uploaded_by UUID REFERENCES users(id),

    created_at TIMESTAMP NOT NULL DEFAULT NOW(),

    deleted_at TIMESTAMP NULL
);

CREATE INDEX idx_media_uploaded_by
ON media(uploaded_by);

CREATE INDEX idx_media_deleted_at
ON media(deleted_at);