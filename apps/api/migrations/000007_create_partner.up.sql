CREATE TABLE partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(255) NOT NULL UNIQUE,

    logo TEXT NOT NULL,

    website TEXT,

    description TEXT,

    display_order INTEGER NOT NULL DEFAULT 0,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMP NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

    deleted_at TIMESTAMP
);

CREATE INDEX idx_partners_deleted_at
ON partners(deleted_at);

CREATE INDEX idx_partners_display_order
ON partners(display_order);

CREATE INDEX idx_partners_is_active
ON partners(is_active);