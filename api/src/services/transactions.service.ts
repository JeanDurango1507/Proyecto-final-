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

const selectFields = 'id,title,amount,category_id,transaction_type,scope,family_id,notes,occurred_on,created_at,updated_at';

const requireTransactionInput = (input: Partial<TransactionInput>): TransactionInput => {
  if (!input.title?.trim()) {
    throw new HttpError(400, 'El título es obligatorio.');
  }

  if (!Number.isFinite(input.amount) || Number(input.amount) <= 0) {
    throw new HttpError(400, 'El valor debe ser mayor que cero.');
  }

  if (!input.category_id || !input.transaction_type || !input.scope) {
    throw new HttpError(400, 'category_id, transaction_type y scope son obligatorios.');
  }

  if (input.scope === 'family' && !input.family_id) {
    throw new HttpError(400, 'family_id es obligatorio para un movimiento familiar.');
  }

  if (input.scope === 'personal' && input.family_id) {
    throw new HttpError(400, 'Un movimiento personal no puede tener family_id.');
  }

  return {
    title: input.title.trim(),
    amount: Number(input.amount),
    category_id: input.category_id,
    transaction_type: input.transaction_type,
    scope: input.scope,
    family_id: input.scope === 'family' ? input.family_id : null,
    notes: input.notes?.trim() || null,
    occurred_on: input.occurred_on,
  };
};

export class TransactionsService {
  public async list(accessToken: string) {
    return requestSupabaseRest<unknown[]>(
      `/transactions?select=${selectFields}&order=occurred_on.desc,created_at.desc`,
      accessToken,
    );
  }

  public async getById(accessToken: string, id: string) {
    const data = await requestSupabaseRest<unknown[]>(
      `/transactions?id=eq.${encodeURIComponent(id)}&select=${selectFields}`,
      accessToken,
    );

    if (!data[0]) {
      throw new HttpError(404, 'Movimiento no encontrado.');
    }

    return data[0];
  }

  public async create(accessToken: string, input: Partial<TransactionInput>) {
    const transaction = requireTransactionInput(input);
    const data = await requestSupabaseRest<unknown[]>(
      '/transactions',
      accessToken,
      {
        method: 'POST',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify(transaction),
      },
    );

    return data[0];
  }

  public async update(accessToken: string, id: string, input: Partial<TransactionInput>) {
    const allowed = {
      ...(input.title === undefined ? {} : { title: input.title.trim() }),
      ...(input.amount === undefined ? {} : { amount: Number(input.amount) }),
      ...(input.category_id === undefined ? {} : { category_id: input.category_id }),
      ...(input.transaction_type === undefined ? {} : { transaction_type: input.transaction_type }),
      ...(input.scope === undefined ? {} : { scope: input.scope }),
      ...(input.family_id === undefined ? {} : { family_id: input.family_id }),
      ...(input.notes === undefined ? {} : { notes: input.notes?.trim() || null }),
      ...(input.occurred_on === undefined ? {} : { occurred_on: input.occurred_on }),
    };

    if (Object.keys(allowed).length === 0) {
      throw new HttpError(400, 'Debes enviar al menos un campo para actualizar.');
    }

    const data = await requestSupabaseRest<unknown[]>(
      `/transactions?id=eq.${encodeURIComponent(id)}`,
      accessToken,
      {
        method: 'PATCH',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify(allowed),
      },
    );

    if (!data[0]) {
      throw new HttpError(404, 'Movimiento no encontrado.');
    }

    return data[0];
  }
}
