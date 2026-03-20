-- Add sort_order column to websites, prompts, and cases tables
-- Run this in Supabase SQL Editor

ALTER TABLE websites ADD COLUMN IF NOT EXISTS sort_order integer DEFAULT 0;
ALTER TABLE prompts ADD COLUMN IF NOT EXISTS sort_order integer DEFAULT 0;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS sort_order integer DEFAULT 0;

-- Initialize sort_order based on created_at order (so existing data has a meaningful default)
UPDATE websites w
SET sort_order = sub.rn
FROM (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) AS rn FROM websites
) sub
WHERE w.id = sub.id;

UPDATE prompts p
SET sort_order = sub.rn
FROM (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) AS rn FROM prompts
) sub
WHERE p.id = sub.id;

UPDATE cases c
SET sort_order = sub.rn
FROM (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) AS rn FROM cases
) sub
WHERE c.id = sub.id;
