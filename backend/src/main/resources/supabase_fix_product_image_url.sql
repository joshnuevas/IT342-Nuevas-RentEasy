-- Run this in Supabase SQL Editor if listings save without images,
-- but fail after selecting a product picture.
--
-- Reason:
-- Older RentEasy databases may still have products.image_url as varchar(255).
-- Base64 image previews are much longer than 255 characters, so PostgreSQL
-- rejects the row before the product listing can be saved.

alter table public.products
  alter column image_url type text;

