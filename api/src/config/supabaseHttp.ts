export class HttpError extends Error {
  public readonly status: number;

  public constructor(status: number, message: string) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
  }
}

type SupabaseConfig = { url: string; key: string };

const requireConfig = (): SupabaseConfig => {
  const url = process.env.SUPABASE_URL?.trim().replace(/\/$/, '');
  const key = process.env.SUPABASE_PUBLISHABLE_KEY?.trim();

  if (!url || !key) {
    throw new HttpError(500, 'La API requiere SUPABASE_URL y SUPABASE_PUBLISHABLE_KEY.');
  }

  try {
    const parsedUrl = new URL(url);
    const isLocalDevelopment = ['localhost', '127.0.0.1'].includes(parsedUrl.hostname);
    if (parsedUrl.protocol !== 'https:' && !isLocalDevelopment) {
      throw new Error('HTTPS requerido');
    }
  } catch {
    throw new HttpError(500, 'SUPABASE_URL debe ser una URL válida y segura.');
  }

  return { url, key };
};

const parseErrorMessage = (payload: unknown): string => {
  if (typeof payload === 'object' && payload !== null) {
    const body = payload as Record<string, unknown>;
    const message = body.error_description ?? body.message ?? body.msg ?? body.hint;
    if (typeof message === 'string' && message.length > 0) return message.slice(0, 300);
  }

  return 'Supabase rechazó la solicitud.';
};

const parseResponse = async <T>(response: Response): Promise<T> => {
  const responseText = await response.text();
  let payload: unknown = null;

  if (responseText) {
    try {
      payload = JSON.parse(responseText) as unknown;
    } catch {
      payload = null;
    }
  }

  if (!response.ok) {
    throw new HttpError(response.status, parseErrorMessage(payload));
  }

  return payload as T;
};

const sendRequest = async <T>(url: string, options: RequestInit): Promise<T> => {
  try {
    const response = await fetch(url, { ...options, signal: AbortSignal.timeout(10_000) });
    return await parseResponse<T>(response);
  } catch (error: unknown) {
    if (error instanceof HttpError) throw error;
    throw new HttpError(502, 'No fue posible comunicarse con el servicio de datos.');
  }
};

export const requestSupabaseAuth = async <T>(
  path: string,
  body: Record<string, unknown>,
): Promise<T> => {
  const { url, key } = requireConfig();
  return sendRequest<T>(`${url}${path}`, {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
};

export const requestSupabaseRest = async <T>(
  path: string,
  accessToken: string,
  options: RequestInit = {},
): Promise<T> => {
  const { url, key } = requireConfig();
  return sendRequest<T>(`${url}/rest/v1${path}`, {
    ...options,
    headers: {
      apikey: key,
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  });
};
