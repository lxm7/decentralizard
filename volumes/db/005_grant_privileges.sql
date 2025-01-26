-- Grant privileges AFTER schema creation
GRANT USAGE ON SCHEMA auth TO supabase_auth_admin;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA auth TO supabase_auth_admin;
GRANT USAGE ON SCHEMA public TO anon, authenticator;