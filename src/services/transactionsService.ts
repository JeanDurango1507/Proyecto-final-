import { Category, Transaction, TransactionKind } from '../types';
import { supabase } from './supabase';

interface TransactionRow {
  id: string;
  title: string;
  amount: number;
  category_id: string;
  transaction_type: TransactionKind;
  scope: 'personal' | 'family';
  occurred_on: string;
}

const throwIfError = (error: { message: string } | null): void => {
  if (error) {
    throw new Error(error.message);
  }
};

export const getCategories = async (kind: TransactionKind): Promise<Category[]> => {
  const { data, error } = await supabase
    .from('categories')
    .select('id, name, kind')
    .eq('kind', kind)
    .order('name');

  throwIfError(error);
  return data ?? [];
};

export const createTransaction = async (input: {
  title: string;
  amount: number;
  categoryId: string;
  kind: TransactionKind;
}): Promise<void> => {
  const { error } = await supabase.from('transactions').insert({
    title: input.title.trim(),
    amount: input.amount,
    category_id: input.categoryId,
    transaction_type: input.kind,
    scope: 'personal',
  });

  throwIfError(error);
};

export const getTransactions = async (): Promise<Transaction[]> => {
  const { data: transactionRows, error: transactionsError } = await supabase
    .from('transactions')
    .select('id, title, amount, category_id, transaction_type, scope, occurred_on')
    .order('occurred_on', { ascending: false })
    .returns<TransactionRow[]>();

  throwIfError(transactionsError);
  const rows = transactionRows ?? [];

  if (rows.length === 0) {
    return [];
  }

  const categoryIds = [...new Set(rows.map((row) => row.category_id))];
  const { data: categories, error: categoriesError } = await supabase
    .from('categories')
    .select('id, name')
    .in('id', categoryIds);

  throwIfError(categoriesError);
  const categoryNames = new Map((categories ?? []).map((category) => [category.id, category.name]));

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    amount: Number(row.amount),
    category: categoryNames.get(row.category_id) ?? 'Sin categoría',
    type: row.scope === 'family' ? 'Family' : 'Personal',
    date: row.occurred_on,
    transactionKind: row.transaction_type,
  }));
};
