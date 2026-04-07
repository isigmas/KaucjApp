-- Create enum types for PostgreSQL (using DO block to handle "already exists") - types must exist before Hibernate creates tables
DO $$ BEGIN
    CREATE TYPE account_role AS ENUM ('USER', 'ADMIN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE account_status AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'DELETED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
