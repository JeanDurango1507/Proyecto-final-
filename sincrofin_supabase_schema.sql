
begin;


create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text not null default '',
  last_name text not null default '',
  document_id text unique,
  phone_number text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()aña
);


create table public.families (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 2 and 100),
  created_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  created_at timestamptz not null default now()
);

create table public.family_members (
  family_id uuid not null references public.families(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('admin', 'member')),
  joined_at timestamptz not null default now(),
  primary key (family_id, user_id)
);

create index family_members_user_id_idx on public.family_members(user_id);


create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  kind text not null check (kind in ('expense', 'income')),
  icon text,
  created_at timestamptz not null default now(),
  constraint categories_name_kind_unique unique (name, kind),
  constraint categories_id_kind_unique unique (id, kind)
);

insert into public.categories (name, kind, icon) values
  ('feeding', 'expense', 'healthy'),
  ('market', 'expense', 'Ara'),
  ('transport', 'expense', 'car'),
  ('dwelling', 'expense', 'house'),
  ('public-services', 'expense', 'in half'),
  ('health', 'expense', 'stable'),
  ('education', 'expense', 'development software technology'),
  ('entertainment', 'expense', 'matchs Atlético Nacional'),
  ('debts', 'expense', 'credit-card'),
  ('other expenses', 'expense', 'very weed'),
  ('salary', 'income', 'wallet'),
  ('sales', 'income', 'store'),
  ('freelance work', 'income', 'for person'),
  ('other incomes', 'income', 'indrive')
on conflict (name, kind) do nothing;


create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  title text not null check (char_length(trim(title)) between 1 and 160),
  amount numeric(14, 2) not null check (amount > 0),
  transaction_type text not null check (transaction_type in ('expense', 'income')),
  category_id uuid not null,
  scope text not null check (scope in ('personal', 'family')),
  family_id uuid references public.families(id) on delete cascade,
  notes text,
  occurred_on date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint transactions_category_kind_fk
    foreign key (category_id, transaction_type)
    references public.categories(id, kind),
  constraint transactions_scope_family_check check (
    (scope = 'personal' and family_id is null)
    or
    (scope = 'family' and family_id is not null)
  )
);

create index transactions_creator_date_idx on public.transactions(created_by, occurred_on desc);
create index transactions_family_date_idx on public.transactions(family_id, occurred_on desc) where family_id is not null;
create index transactions_category_id_idx on public.transactions(category_id);


create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger transactions_set_updated_at
before update on public.transactions
for each row execute function public.set_updated_at();


create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, first_name, last_name, document_id, phone_number)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'first_name', ''),
    coalesce(new.raw_user_meta_data ->> 'last_name', ''),
    nullif(new.raw_user_meta_data ->> 'document_id', ''),
    nullif(new.raw_user_meta_data ->> 'phone_number', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created_profile
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();


create or replace function public.is_family_member(target_family_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.family_members fm
    where fm.family_id = target_family_id
      and fm.user_id = (select auth.uid())
  );
$$;

create or replace function public.is_family_admin(target_family_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.family_members fm
    where fm.family_id = target_family_id
      and fm.user_id = (select auth.uid())
      and fm.role = 'admin'
  );
$$;


create or replace function public.get_family_members(target_family_id uuid)
returns table (member_user_id uuid, first_name text, last_name text, member_role text)
language sql
stable
security definer
set search_path = public
as $$
  select fm.user_id, p.first_name, p.last_name, fm.role
  from public.family_members fm
  join public.profiles p on p.id = fm.user_id
  where fm.family_id = target_family_id
    and public.is_family_member(target_family_id)
  order by case when fm.role = 'admin' then 0 else 1 end, p.first_name, p.last_name;
$$;

grant execute on function public.is_family_member(uuid) to authenticated;
grant execute on function public.is_family_admin(uuid) to authenticated;
grant execute on function public.get_family_members(uuid) to authenticated;


alter table public.profiles enable row level security;
alter table public.families enable row level security;
alter table public.family_members enable row level security;
alter table public.categories enable row level security;
alter table public.transactions enable row level security;


create policy profiles_select_own
  on public.profiles for select to authenticated
  using (id = (select auth.uid()));

create policy profiles_update_own
  on public.profiles for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));


create policy families_select_member_or_creator
  on public.families for select to authenticated
  using (public.is_family_member(id) or created_by = (select auth.uid()));

create policy families_insert_own
  on public.families for insert to authenticated
  with check (created_by = (select auth.uid()));

create policy families_update_admin
  on public.families for update to authenticated
  using (public.is_family_admin(id))
  with check (public.is_family_admin(id));

create policy families_delete_admin
  on public.families for delete to authenticated
  using (public.is_family_admin(id));


create policy family_members_select_group
  on public.family_members for select to authenticated
  using (public.is_family_member(family_id));

create policy family_members_insert_initial_admin_or_member
  on public.family_members for insert to authenticated
  with check (
    (
      user_id = (select auth.uid())
      and role = 'admin'
      and exists (
        select 1 from public.families f
        where f.id = family_id and f.created_by = (select auth.uid())
      )
    )
    or
    (role = 'member' and public.is_family_admin(family_id))
  );

create policy family_members_delete_self_or_admin
  on public.family_members for delete to authenticated
  using (user_id = (select auth.uid()) or public.is_family_admin(family_id));


create policy categories_select_authenticated
  on public.categories for select to authenticated
  using (true);


create policy transactions_select_authorized
  on public.transactions for select to authenticated
  using (
    (scope = 'personal' and created_by = (select auth.uid()))
    or
    (scope = 'family' and public.is_family_member(family_id))
  );

create policy transactions_insert_authorized
  on public.transactions for insert to authenticated
  with check (
    created_by = (select auth.uid())
    and (
      (scope = 'personal' and family_id is null)
      or
      (scope = 'family' and family_id is not null and public.is_family_member(family_id))
    )
  );


create policy transactions_update_creator
  on public.transactions for update to authenticated
  using (
    created_by = (select auth.uid())
    and (
      (scope = 'personal' and family_id is null)
      or
      (scope = 'family' and public.is_family_member(family_id))
    )
  )
  with check (
    created_by = (select auth.uid())
    and (
      (scope = 'personal' and family_id is null)
      or
      (scope = 'family' and family_id is not null and public.is_family_member(family_id))
    )
  );

create policy transactions_delete_creator
  on public.transactions for delete to authenticated
  using (
    created_by = (select auth.uid())
    and (
      (scope = 'personal' and family_id is null)
      or
      (scope = 'family' and public.is_family_member(family_id))
    )
  );


grant usage on schema public to authenticated;
grant select, update on public.profiles to authenticated;
grant select, insert, update, delete on public.families to authenticated;
grant select, insert, delete on public.family_members to authenticated;
grant select on public.categories to authenticated;
grant select, insert, update, delete on public.transactions to authenticated;

commit;

