CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    title VARCHAR(255) NOT NULL,

    slug VARCHAR(255) NOT NULL UNIQUE,

    summary TEXT,

    content TEXT NOT NULL,

    featured_image TEXT,

    status VARCHAR(20) NOT NULL DEFAULT 'draft',

    published_at TIMESTAMP NULL,

    created_by UUID REFERENCES users(id),

    updated_by UUID REFERENCES users(id),

    created_at TIMESTAMP NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

    deleted_at TIMESTAMP NULL
);

CREATE INDEX idx_projects_slug ON projects(slug);

CREATE INDEX idx_projects_status ON projects(status);

CREATE INDEX idx_projects_deleted_at ON projects(deleted_at);