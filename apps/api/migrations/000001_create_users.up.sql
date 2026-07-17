CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,

    email VARCHAR(255) NOT NULL UNIQUE,

    password_hash TEXT NOT NULL,

    avatar TEXT,

    role VARCHAR(30) NOT NULL DEFAULT 'admin',

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    email_verified BOOLEAN NOT NULL DEFAULT FALSE,

    last_login TIMESTAMP,

    created_at TIMESTAMP NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

    deleted_at TIMESTAMP
);

CREATE INDEX idx_users_email
ON users(email);