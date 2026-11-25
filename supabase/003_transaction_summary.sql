begin;

-- La función respeta las políticas RLS del usuario autenticado.
create or replace function public.get_transaction_summary()
returns json
language sql
stable
security invoker
set search_path = public
as $$
  select json_build_object(
    'income', coalesce(sum(amount) filter (where transaction_type = 'income'), 0),
    'expenses', coalesce(sum(amount) filter (where transaction_type = 'expense'), 0),
    'balance', coalesce(sum(case when transaction_type = 'income' then amount else -amount end), 0),
    'transactionCount', count(*)
  )
  from public.transactions;
$$;

revoke all on function public.get_transaction_summary() from public;
revoke all on function public.get_transaction_summary() from anon;
grant execute on function public.get_transaction_summary() to authenticated;

commit;
