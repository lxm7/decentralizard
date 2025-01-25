DO $$
BEGIN
  -- 1. Create postgres superuser first
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'postgres') THEN
    CREATE ROLE postgres WITH 
      LOGIN 
      SUPERUSER 
      PASSWORD 'postgres';
  END IF;

  -- 2. Create anon role before granting it
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'anon') THEN
    CREATE ROLE anon;
  END IF;

  -- 3. Create authenticator with password
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'authenticator') THEN
    CREATE ROLE authenticator NOINHERIT LOGIN PASSWORD 'authenticator123';
    CREATE ROLE anon;
    -- Now grant AFTER creating anon
    GRANT anon TO authenticator;
  END IF;

  -- 4. Create auth admin
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'supabase_auth_admin') THEN
    CREATE ROLE supabase_auth_admin WITH LOGIN PASSWORD 'authadmin123';
  END IF;

  -- Force password updates
  ALTER ROLE postgres WITH PASSWORD 'postgres';
  ALTER ROLE authenticator WITH PASSWORD 'authenticator123';
  ALTER ROLE supabase_auth_admin WITH PASSWORD 'authadmin123';
END $$;