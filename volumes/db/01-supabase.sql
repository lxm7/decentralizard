SELECT 'CREATE DATABASE _supabase WITH OWNER postgres'
WHERE NOT EXISTS (
  SELECT FROM pg_database 
  WHERE datname = '_supabase'
)\gexec