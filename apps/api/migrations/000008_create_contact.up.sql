CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(255) NOT NULL,

    email VARCHAR(255) NOT NULL,

    phone VARCHAR(50),

    subject VARCHAR(255),

    message TEXT NOT NULL,

    status VARCHAR(20) NOT NULL DEFAULT 'unread',

    created_at TIMESTAMP NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

    deleted_at TIMESTAMP
);

CREATE INDEX idx_contacts_status
ON contacts(status);

CREATE INDEX idx_contacts_deleted_at
ON contacts(deleted_at);