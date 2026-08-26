CREATE TABLE testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(255) NOT NULL,

    role VARCHAR(255),

    organization VARCHAR(255),

    content TEXT NOT NULL,

    image_url TEXT,

    sort_order INTEGER NOT NULL DEFAULT 0,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMP NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

    deleted_at TIMESTAMP
);

CREATE INDEX idx_testimonials_deleted_at
ON testimonials(deleted_at);

CREATE INDEX idx_testimonials_is_active
ON testimonials(is_active);

CREATE INDEX idx_testimonials_sort_order
ON testimonials(sort_order);