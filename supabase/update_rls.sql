-- supabase/update_rls.sql
-- 启用所有的 Insert, Update, Delete 权限 (允许前端后台直接写入数据)
-- 注意：因为目前使用的是无账号密码的快速原型方案，此操作允许持有 Anon Key 的应用端修改数据。

CREATE POLICY "Allow public insert access on websites" ON "public"."websites" FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on websites" ON "public"."websites" FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access on websites" ON "public"."websites" FOR DELETE USING (true);

CREATE POLICY "Allow public insert access on prompts" ON "public"."prompts" FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on prompts" ON "public"."prompts" FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access on prompts" ON "public"."prompts" FOR DELETE USING (true);

CREATE POLICY "Allow public insert access on cases" ON "public"."cases" FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on cases" ON "public"."cases" FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access on cases" ON "public"."cases" FOR DELETE USING (true);

CREATE POLICY "Allow public insert access on cases_logs" ON "public"."cases_logs" FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on cases_logs" ON "public"."cases_logs" FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access on cases_logs" ON "public"."cases_logs" FOR DELETE USING (true);
