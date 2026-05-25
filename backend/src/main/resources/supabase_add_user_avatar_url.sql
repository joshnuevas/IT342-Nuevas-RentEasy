-- Run this in Supabase SQL Editor so renter profile photos can be saved
-- and shown to other users on web and mobile.

alter table public.users
  add column if not exists avatar_url text;

