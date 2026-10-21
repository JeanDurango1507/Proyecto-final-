
import { supabase } from '../lib/supabase';
import {
  Category,
  Transaction,
  TransactionKind,
} from '../types';

type TransactionScope = 'personal' | 'family';

type SaveTransactionInput = {
  title: string;
  amount: number;
  categoryName: string;
  transactionType?: 'expense' | 'income';
  scope: 'personal' | 'family';
  familyId?: string;
  notes?: string;
  occurredOn?: string;
};

type TransactionRow = {
  id: string;
  title: string;
  amount: number | string;
  category_id: string;
  transaction_type: TransactionKind;
  scope: TransactionScope;
  family_id: string | null;
  occurred_on: string;
};

type BalanceRow = {
  amount: number | string;
  transaction_type: TransactionKind;
};

const normalize = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLocaleLowerCase();

async function getBalance(scope: TransactionScope, familyId?: string): Promise<number> {
  let query = supabase
    .from('transactions')
    .select('amount, transaction_type')
    .eq('scope', scope);

  if (scope === 'family' && familyId) {
    query = query.eq('family_id', familyId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`No se pudo comprobar el saldo disponible: ${error.message}`);
  }

  return ((data ?? []) as BalanceRow[]).reduce((balance, row) => {
    const amount = Math.abs(Number(row.amount));
    return balance + (row.transaction_type === 'expense' ? -amount : amount);
  }, 0);
}

export async function listTransactions(): Promise<Transaction[]> {
  const [{ data: transactionRows, error: transactionError }, { data: categoryRows, error: categoryError }] =
    await Promise.all([
      supabase
        .from('transactions')
        .select('id, title, amount, category_id, transaction_type, scope, family_id, occurred_on')
        .order('occurred_on', { ascending: false })
        .order('created_at', { ascending: false }),
      supabase.from('categories').select('id, name, kind, icon'),
    ]);

  if (transactionError) {
    throw new Error(`No se pudieron cargar los movimientos: ${transactionError.message}`);
  }

  if (categoryError) {
    throw new Error(`No se pudieron cargar las categorías: ${categoryError.message}`);
  }

  const categoriesById = new Map(
    ((categoryRows ?? []) as Category[]).map((category) => [category.id, category]),
  );

  return ((transactionRows ?? []) as TransactionRow[]).map((row) => {
    const category = categoriesById.get(row.category_id);
    const amount = Math.abs(Number(row.amount));

    return {
      id: row.id,
      title: row.title,
      amount: row.transaction_type === 'expense' ? -amount : amount,
      category: category?.name ?? 'Sin categoría',
      type: row.scope === 'family' ? 'Family' : 'Personal',
      transactionKind: row.transaction_type,
      date: row.occurred_on,
      familyId: row.family_id,
    };
  });
}

export async function saveTransaction(input: SaveTransactionInput) {
  const { data: authData, error: authError } =
    await supabase.auth.getUser();

  if (authError || !authData.user) {
    throw new Error('Debes iniciar sesión antes de guardar un movimiento.');
  }

  if (!Number.isFinite(input.amount) || input.amount <= 0) {
    throw new Error('El valor debe ser mayor que cero.');
  }

  const transactionType = input.transactionType ?? 'expense';

  const { data: category, error: categoryError } = await supabase
    .from('categories')
    .select('id')
    .ilike('name', input.categoryName.trim())
    .eq('kind', transactionType)
    .single();

  if (categoryError || !category) {
    throw new Error(
      `No se encontró la categoría "${input.categoryName}". Usa una categoría existente.`
    );
  }

  if (input.scope === 'family' && !input.familyId) {
    throw new Error(
      'Primero debes crear o seleccionar un grupo familiar.'
    );
  }

  if (transactionType === 'expense') {
    const balance = await getBalance(input.scope, input.familyId);

    if (input.amount > balance) {
      throw new Error(
        `Saldo insuficiente. Tu saldo disponible es ${Math.max(balance, 0).toFixed(2)}. Registra primero un ingreso.`,
      );
    }
  }

  const { data, error } = await supabase
    .from('transactions')
    .insert({
      title: input.title.trim(),
      amount: input.amount,
      category_id: category.id,
      transaction_type: transactionType,
      scope: input.scope,
      family_id: input.scope === 'family' ? input.familyId : null,
      notes: input.notes?.trim() || null,
      occurred_on: input.occurredOn ?? new Date().toISOString().slice(0, 10),
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
