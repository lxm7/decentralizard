CREATE TABLE profiles (
  id uuid PRIMARY KEY,
  updated_at timestamp with time zone,
  username text unique,
  avatar_url text,
  website text,
  constraint username_length check (char_length(username) >= 3)
);

-- Only include if using Supabase Realtime
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime;
COMMIT;
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;