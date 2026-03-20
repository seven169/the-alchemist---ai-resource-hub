-- supabase/storage_setup.sql
-- 开启并配置 Supabase Storage (对象存储) 用于图片上传

-- 1. 插入（创建）一个名为 'images' 的公开存储桶
insert into storage.buckets (id, name, public) 
values ('images', 'images', true)
on conflict (id) do nothing; -- 防止重复执行报错

-- 注：以下是针对目前无认证(Anon key)即可读写方案的快速原型 RLS 策略。
-- 如果要正式上线商用，建议将其替换为 authenticated(已登录用户) 才可上传/删除。

-- 2. 允许外网所有人读取（下载） 'images' 桶里的文件
create policy "允许任何人访问图片"
on storage.objects for select
using ( bucket_id = 'images' );

-- 3. 允许任何人直接上传文件到 'images' 桶
create policy "允许任何人上传图片"
on storage.objects for insert
with check ( bucket_id = 'images' );

-- 4. 允许任何人更新图片
create policy "允许任何人更新图片"
on storage.objects for update
using ( bucket_id = 'images' );

-- 5. 允许任何人删除图片
create policy "允许任何人删除图片"
on storage.objects for delete
using ( bucket_id = 'images' );
