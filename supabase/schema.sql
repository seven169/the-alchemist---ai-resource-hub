-- supabase/schema.sql

-- Drop tables if they exist (for easy re-running)
DROP TABLE IF EXISTS "public"."cases_logs";
DROP TABLE IF EXISTS "public"."cases";
DROP TABLE IF EXISTS "public"."prompts";
DROP TABLE IF EXISTS "public"."websites";


-- Websites Table
CREATE TABLE "public"."websites" (
    "id" TEXT PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "tags" TEXT[] DEFAULT '{}',
    "image" TEXT,
    "url" TEXT,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Prompts Table
CREATE TABLE "public"."prompts" (
    "id" TEXT PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "tags" TEXT[] DEFAULT '{}',
    "image" TEXT,
    "rating" NUMERIC(3, 1),
    "positive" TEXT,
    "negative" TEXT,
    "model" TEXT,
    "sampler" TEXT,
    "steps" INT,
    "cfg" NUMERIC(5, 1),
    "seed" TEXT,
    "size" TEXT,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Cases Table
CREATE TABLE "public"."cases" (
    "id" TEXT PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "tags" TEXT[] DEFAULT '{}',
    "image" TEXT,
    "status" TEXT,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Cases Logs (One Case to Many Logs)
CREATE TABLE "public"."cases_logs" (
    "id" TEXT PRIMARY KEY,
    "case_id" TEXT NOT NULL REFERENCES "public"."cases"("id") ON DELETE CASCADE,
    "title" TEXT NOT NULL,
    "time" TEXT,
    "description" TEXT,
    "images" TEXT[] DEFAULT '{}',
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Note: We can add RLS (Row Level Security) policies here if we add authentication.
-- For now, allow public reading.
ALTER TABLE "public"."websites" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."prompts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."cases" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."cases_logs" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on websites" ON "public"."websites" FOR SELECT USING (true);
CREATE POLICY "Allow public read access on prompts" ON "public"."prompts" FOR SELECT USING (true);
CREATE POLICY "Allow public read access on cases" ON "public"."cases" FOR SELECT USING (true);
CREATE POLICY "Allow public read access on cases_logs" ON "public"."cases_logs" FOR SELECT USING (true);
