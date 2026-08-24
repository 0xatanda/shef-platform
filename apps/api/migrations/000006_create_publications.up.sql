CREATE TABLE publications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    title VARCHAR(255) NOT NULL,

    slug VARCHAR(255) NOT NULL UNIQUE,

    summary TEXT,

    content TEXT NOT NULL,

    type VARCHAR(30) NOT NULL DEFAULT 'article',

    status VARCHAR(20) NOT NULL DEFAULT 'draft',

    featured_image TEXT,

    author VARCHAR(255),

    published_at TIMESTAMP NULL,

    published_by UUID REFERENCES users(id),

    created_by UUID REFERENCES users(id),

    updated_by UUID REFERENCES users(id),

    created_at TIMESTAMP NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

    deleted_at TIMESTAMP NULL
);

CREATE INDEX idx_publications_slug
ON publications(slug);

CREATE INDEX idx_publications_status
ON publications(status);

CREATE INDEX idx_publications_type
ON publications(type);

CREATE INDEX idx_publications_deleted_at
ON publications(deleted_at);

CREATE INDEX idx_publications_published_at
ON publications(published_at);