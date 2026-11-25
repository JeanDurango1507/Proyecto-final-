import { HttpError, requestSupabaseRest } from '../config/supabaseHttp';

export type TransactionKind = 'expense' | 'income';
export type TransactionScope = 'personal' | 'family';

export interface TransactionInput {
  title: string;
  amount: number;
  category_id: string;
  transaction_type: TransactionKind;
  scope: TransactionScope;
  family_id?: string | null;
  notes?: string | null;
  occurred_on?: string;
}

type TransactionRecord = TransactionInput & {
  id: string;
  amount: number | string;
  created_at: string;
  updated_at: string;
};

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MAX_AMOUNT = 999_999_999_999.99;
const selectFields = 'id,title,amount,category_id,transaction_type,scope,family_id,notes,occurred_on,created_at,updated_at';

const requireRecord = (value: unknown): Record<string, unknown> => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new HttpError(400, 'Envía un objeto JSON con los datos del movimiento.');
  }
  return value as Record<string, unknown>;
};

const isDateOnly = (value: string): boolean => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
};

const requireTransactionInput = (value: unknown): TransactionInput => {
  const input = requireRecord(value);
  const title = typeof input.title === 'string' ? input.title.trim() : '';
  const amount = typeof input.amount === 'number' ? input.amount : Number.NaN;
  const categoryId = typeof input.category_id === 'string' ? input.category_id : '';
  const transactionType = input.transaction_type;
  const scope = input.scope;
  const familyId = typeof input.family_id === 'string' ? input.family_id : null;
  const notes = input.notes == null ? null : typeof input.notes === 'string' ? input.notes.trim() : undefined;
  const occurredOn = input.occurred_on;

  if (title.length < 1 || title.length > 160) {
    throw new HttpError(400, 'El título debe tener entre 1 y 160 caracteres.');
  }
  if (!Number.isFinite(amount) || amount <= 0 || amount > MAX_AMOUNT) {
    throw new HttpError(400, 'El monto debe ser positivo y no superar 999.999.999.999,99.');
  }
  if (!UUID_PATTERN.test(categoryId)) {
    throw new HttpError(400, 'category_id debe ser un identificador válido.');
  }
  if (transactionType !== 'expense' && transactionType !== 'income') {
    throw new HttpError(400, 'transaction_type debe ser expense o income.');
  }
  if (scope !== 'personal' && scope !== 'family') {
    throw new HttpError(400, 'scope debe ser personal o family.');
  }
  if (scope === 'family' && (!familyId || !UUID_PATTERN.test(familyId))) {
    throw new HttpError(400, 'family_id debe identificar un grupo familiar válido.');
  }
  if (scope === 'personal' && input.family_id != null) {
    throw new HttpError(400, 'Un movimiento personal no puede tener family_id.');
  }
  if (notes === undefined || (typeof notes === 'string' && notes.length > 1000)) {
    throw new HttpError(400, 'Las notas deben tener como máximo 1.000 caracteres.');
  }
  if (occurredOn !== undefined && (typeof occurredOn !== 'string' || !isDateOnly(occurredOn))) {
    throw new HttpError(400, 'occurred_on debe ser una fecha válida con formato AAAA-MM-DD.');
  }

  return {
    title,
    amount,
    category_id: categoryId,
    transaction_type: transactionType,
    scope,
    family_id: scope === 'family' ? familyId : null,
    notes,
    occurred_on: occurredOn as string | undefined,
  };
};

const requireUuid = (id: string): string => {
  if (!UUID_PATTERN.test(id)) throw new HttpError(400, 'El identificador del movimiento no es válido.');
  return id;
};

export class TransactionsService {
  public async list(accessToken: string, limit = 20, offset = 0): Promise<TransactionRecord[]> {
    const safeLimit = Math.min(100, Math.max(1, Math.floor(limit)));
    const safeOffset = Math.max(0, Math.floor(offset));
    return requestSupabaseRest<TransactionRecord[]>(
      `/transactions?select=${selectFields}&order=occurred_on.desc,created_at.desc&limit=${safeLimit}&offset=${safeOffset}`,
      accessToken,
    );
  }

  public async getById(accessToken: string, id: string): Promise<TransactionRecord> {
    const safeId = requireUuid(id);
    const data = await requestSupabaseRest<TransactionRecord[]>(
      `/transactions?id=eq.${encodeURIComponent(safeId)}&select=${selectFields}&limit=1`,
      accessToken,
    );

    if (!data[0]) throw new HttpError(404, 'Movimiento no encontrado.');
    return data[0];
  }

  public async create(accessToken: string, value: unknown): Promise<TransactionRecord> {
    const transaction = requireTransactionInput(value);
    const data = await requestSupabaseRest<TransactionRecord[]>(
      '/transactions',
      accessToken,
      {
        method: 'POST',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify(transaction),
      },
    );

    if (!data[0]) throw new HttpError(502, 'Supabase no confirmó el movimiento guardado.');
    return data[0];
  }

  public async update(accessToken: string, id: string, value: unknown): Promise<TransactionRecord> {
    const input = requireRecord(value);
    const existing = await this.getById(accessToken, id);
    const merged = requireTransactionInput({
      ...existing,
      ...input,
      amount: input.amount === undefined ? Number(existing.amount) : input.amount,
    });

    const data = await requestSupabaseRest<TransactionRecord[]>(
      `/transactions?id=eq.${encodeURIComponent(id)}`,
      accessToken,
      {
        method: 'PATCH',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify(merged),
      },
    );

    if (!data[0]) throw new HttpError(404, 'Movimiento no encontrado.');
    return data[0];
  }
}
