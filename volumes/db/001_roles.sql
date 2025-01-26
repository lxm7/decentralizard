-- CREATE ROLE supabase_auth_admin WITH LOGIN PASSWORD '${AUTH_ADMIN_PASSWORD}' BYPASSRLS;
-- CREATE ROLE postgres SUPERUSER;
-- CREATE ROLE anon NOINHERIT;
-- CREATE ROLE authenticator NOINHERIT;

-- ALTER ROLE postgres WITH PASSWORD '${POSTGRES_PASSWORD}';
-- ALTER ROLE authenticator WITH PASSWORD '${AUTHENTICATOR_PASSWORD}';
-- ALTER ROLE supabase_auth_admin SET search_path = auth, public, extensions;

-- GRANT CREATE ON DATABASE postgres TO supabase_auth_admin;
-- GRANT ALL PRIVILEGES ON SCHEMA auth TO supabase_auth_admin;
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA auth TO supabase_auth_admin;


-- Use conditional creation
-- CREATE ROLE IF NOT EXISTS postgres SUPERUSER;
-- CREATE ROLE IF NOT EXISTS anon NOINHERIT;
-- CREATE ROLE IF NOT EXISTS authenticator NOINHERIT;
-- CREATE ROLE IF NOT EXISTS supabase_auth_admin NOINHERIT BYPASSRLS;

-- -- Keep password updates
-- ALTER ROLE postgres WITH PASSWORD '${POSTGRES_PASSWORD}';
-- ALTER ROLE supabase_auth_admin WITH PASSWORD '${AUTH_ADMIN_PASSWORD}';
-- ALTER ROLE authenticator WITH PASSWORD '${AUTHENTICATOR_PASSWORD}';

DO $$
BEGIN
  -- Create roles only if they don't exist
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'postgres') THEN
    CREATE ROLE postgres SUPERUSER;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    CREATE ROLE anon NOINHERIT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticator') THEN
    CREATE ROLE authenticator NOINHERIT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'supabase_auth_admin') THEN
    CREATE ROLE supabase_auth_admin NOINHERIT BYPASSRLS;
  END IF;
  
  ALTER ROLE supabase_auth_admin WITH PASSWORD '${AUTH_ADMIN_PASSWORD}';
END $$;

-- Always set passwords (even if roles existed)
ALTER ROLE postgres WITH PASSWORD '${POSTGRES_PASSWORD}';
-- ALTER ROLE supabase_auth_admin WITH PASSWORD '${AUTH_ADMIN_PASSWORD}';
ALTER ROLE authenticator WITH PASSWORD '${AUTHENTICATOR_PASSWORD}';