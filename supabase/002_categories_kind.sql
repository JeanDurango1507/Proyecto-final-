begin;

alter table public.categories
  add column if not exists kind text;

update public.categories
set kind = case
  when lower(trim(name)) in (
    'salary', 'sales', 'freelance work', 'investments',
    'other income', 'other incomes', 'salario', 'ventas',
    'trabajo independiente', 'inversiones', 'otros ingresos'
  ) then 'income'
  else 'expense'
end
where kind is null or kind not in ('expense', 'income');

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.categories'::regclass
      and conname = 'categories_kind_check'
  ) then
    alter table public.categories
      add constraint categories_kind_check
      check (kind in ('expense', 'income'));
  end if;
end
$$;

alter table public.categories
  alter column kind set not null;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.categories'::regclass
      and conname = 'categories_id_kind_unique'
  ) then
    alter table public.categories
      add constraint categories_id_kind_unique unique (id, kind);
  end if;
end
$$;

commit;
