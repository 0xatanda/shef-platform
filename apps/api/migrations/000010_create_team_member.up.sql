CREATE TABLE team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(255) NOT NULL,

    role VARCHAR(255) NOT NULL,

    bio TEXT,

    image_url TEXT,

    email VARCHAR(255),

    linkedin TEXT,

    twitter TEXT,

    sort_order INTEGER NOT NULL DEFAULT 0,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMP NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

    deleted_at TIMESTAMP
);

CREATE INDEX idx_team_members_deleted_at
ON team_members(deleted_at);

CREATE INDEX idx_team_members_is_active
ON team_members(is_active);

CREATE INDEX idx_team_members_sort_order
ON team_members(sort_order);