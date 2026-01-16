-- ============================================
-- Bulk Publish All Draft Posts in Supabase
-- ============================================
-- WARNING: This will publish ALL draft posts immediately
-- Make sure you want to do this before running!

-- Option 1: Update all draft posts to published status
UPDATE posts
SET
  "_status" = 'published',
  "published_at" = COALESCE("published_at", NOW()),
  "updated_at" = NOW()
WHERE "_status" = 'draft';

-- Option 2: Preview what will be changed (run this first to be safe)
-- SELECT
--   id,
--   title,
--   slug,
--   "_status" as current_status,
--   "published_at",
--   "updated_at"
-- FROM posts
-- WHERE "_status" = 'draft';

-- Option 3: Update specific posts by ID
-- UPDATE posts
-- SET
--   "_status" = 'published',
--   "published_at" = COALESCE("published_at", NOW()),
--   "updated_at" = NOW()
-- WHERE id IN (1, 2, 3, 4, 5);

-- Option 4: Verify the changes after update
-- SELECT
--   "_status" as status,
--   COUNT(*) as count
-- FROM posts
-- GROUP BY "_status";
