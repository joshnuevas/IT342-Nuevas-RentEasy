do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'cart_items'
      and column_name = 'id'
  ) and not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'cart_items'
      and column_name = 'cart_item_id'
  ) then
    alter table public.cart_items rename column id to cart_item_id;
  end if;
end $$;
