CREATE TABLE donations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(255) NOT NULL,

    email VARCHAR(255) NOT NULL,

    phone VARCHAR(50),

    amount NUMERIC(15,2) NOT NULL DEFAULT 0,

    currency VARCHAR(10) NOT NULL DEFAULT 'NGN',

    message TEXT,

    status VARCHAR(30) NOT NULL DEFAULT 'pending',

    admin_note TEXT,

    created_at TIMESTAMP NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

    deleted_at TIMESTAMP
);

CREATE INDEX idx_donations_deleted_at
ON donations(deleted_at);

CREATE INDEX idx_donations_status
ON donations(status);

CREATE INDEX idx_donations_email
ON donations(email);

CREATE INDEX idx_donations_created_at
ON donations(created_at);