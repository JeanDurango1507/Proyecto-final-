import { supabase } from '../lib/supabase';
import { Category, Transaction, TransactionKind, TransactionScope } from '../types';

export const TRANSACTION_PAGE_SIZE = 20;

type SaveTransactionInput = {
  title: string;
  amount: number;
  categoryId: string;
  transactionType: TransactionKind;
  scope: TransactionScope;
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

export type TransactionPage = {
  items: Transaction[];
  hasMore: boolean;
};

export type TransactionSummary = {
  income: number;
  expenses: number;
  balance: number;
  transactionCount: number;
};

const categoryLabels: Record<string, string> = {
  feeding: 'Alimentación',
  market: 'Mercado',
  transport: 'Transporte',
  dwelling: 'Vivienda',
  'public-services': 'Servicios públicos',
  health: 'Salud',
  education: 'Educación',
  entertainment: 'Entretenimiento',
  debts: 'Deudas',
  'other expenses': 'Otros gastos',
  salary: 'Salario',
  sales: 'Ventas',
  'freelance work': 'Trabajo independiente',
  'other incomes': 'Otros ingresos',
};

const displayCategoryName = (name: string): string =>
  categoryLabels[name.trim().toLowerCase()] ?? name;

let categoriesRequest: Promise<Category[]> | null = null;

async function getAllCategories(): Promise<Category[]> {
  if (!categoriesRequest) {
    categoriesRequest = (async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, kind, icon')
        .order('name');
      if (error) {
        throw new Error(`No se pudieron cargar las categorías: ${error.message}`);
      }
      return (data ?? []) as Category[];
    })().catch((error: unknown) => {
      categoriesRequest = null;
      throw error;
    });
  }

  return categoriesRequest;
}

export async function listTransactions(
  offset = 0,
  pageSize = TRANSACTION_PAGE_SIZE,
): Promise<TransactionPage> {
  const safeOffset = Math.max(0, Math.floor(offset));
  const safePageSize = Math.min(50, Math.max(1, Math.floor(pageSize)));

  const [transactionResult, categories] = await Promise.all([
    supabase
      .from('transactions')
      .select('id, title, amount, category_id, transaction_type, scope, family_id, occurred_on')
      .order('occurred_on', { ascending: false })
      .order('created_at', { ascending: false })
      .range(safeOffset, safeOffset + safePageSize),
    getAllCategories(),
  ]);

  if (transactionResult.error) {
    throw new Error(`No se pudieron cargar los movimientos: ${transactionResult.error.message}`);
  }

  const categoryById = new Map(categories.map((category) => [category.id, category]));
  const rows = (transactionResult.data ?? []) as TransactionRow[];
  const hasMore = rows.length > safePageSize;
  const pageRows = hasMore ? rows.slice(0, safePageSize) : rows;

  return {
    items: pageRows.map((row) => {
      const amount = Math.abs(Number(row.amount));
      return {
        id: row.id,
        title: row.title,
        amount: row.transaction_type === 'expense' ? -amount : amount,
        category: displayCategoryName(categoryById.get(row.category_id)?.name ?? 'Sin categoría'),
        type: row.scope === 'family' ? 'Family' : 'Personal',
        transactionType: row.transaction_type,
        date: row.occurred_on,
        familyId: row.family_id,
      };
    }),
    hasMore,
  };
}

export async function getTransactionSummary(): Promise<TransactionSummary> {
  const { data, error } = await supabase.rpc('get_transaction_summary');

  if (error) {
    // Permite iniciar en bases existentes antes de ejecutar la migración 003.
    // En cuanto la función SQL esté disponible, el resumen vuelve a calcularse en el servidor.
    if (error.code === 'PGRST202') {
      return getTransactionSummaryFromRows();
    }
    throw new Error(`No se pudo calcular el resumen: ${error.message}`);
  }

  const summary = data as Record<string, number | string>;
  return {
    income: Number(summary.income ?? 0),
    expenses: Number(summary.expenses ?? 0),
    balance: Number(summary.balance ?? 0),
    transactionCount: Number(summary.transactionCount ?? 0),
  };
}

async function getTransactionSummaryFromRows(): Promise<TransactionSummary> {
  const pageSize = 1000;
  let offset = 0;
  const summary: TransactionSummary = {
    income: 0,
    expenses: 0,
    balance: 0,
    transactionCount: 0,
  };

  while (true) {
    const { data, error } = await supabase
      .from('transactions')
      .select('amount, transaction_type')
      .range(offset, offset + pageSize - 1);

    if (error) {
      throw new Error(`No se pudo calcular el resumen: ${error.message}`);
    }

    const rows = data ?? [];
    for (const row of rows) {
      const amount = Math.abs(Number(row.amount));
      if (row.transaction_type === 'income') {
        summary.income += amount;
        summary.balance += amount;
      } else {
        summary.expenses += amount;
        summary.balance -= amount;
      }
    }
    summary.transactionCount += rows.length;

    if (rows.length < pageSize) break;
    offset += pageSize;
  }

  return summary;
}

export async function listCategories(kind: TransactionKind): Promise<Category[]> {
  const categories = await getAllCategories();
  return categories
    .filter((category) => category.kind === kind)
    .map((category) => ({ ...category, name: displayCategoryName(category.name) }));
}

export async function saveTransaction(input: SaveTransactionInput): Promise<void> {
  const title = input.title.trim();
  const maximumAmount = 999_999_999_999.99;

  if (!title || title.length > 160) {
    throw new Error('La descripción debe tener entre 1 y 160 caracteres.');
  }

  if (!Number.isFinite(input.amount) || input.amount <= 0 || input.amount > maximumAmount) {
    throw new Error('El monto debe ser mayor que cero y tener hasta 12 dígitos enteros.');
  }

  if (!input.categoryId) {
    throw new Error('Selecciona una categoría válida.');
  }

  if (input.scope === 'family' && !input.familyId) {
    throw new Error('Primero debes crear o seleccionar un grupo familiar.');
  }

  const { data, error } = await supabase
    .from('transactions')
    .insert({
      title,
      amount: input.amount,
      category_id: input.categoryId,
      transaction_type: input.transactionType,
      scope: input.scope,
      family_id: input.scope === 'family' ? input.familyId : null,
      notes: input.notes?.trim() || null,
      occurred_on: input.occurredOn ?? getLocalDateOnly(),
    })
    .select('id')
    .single();

  if (error) {
    throw new Error(`No se pudo guardar el movimiento: ${error.message}`);
  }

  if (!data) {
    throw new Error('Supabase no confirmó el movimiento guardado.');
  }
}

function getLocalDateOnly(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
