const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/$/, '');
const supabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.SUPABASE_ANON_KEY;

export class HttpError extends Error {
  public readonly status: number;

  public constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

const requireConfig = (): { url: string; key: string } => {
  if (!supabaseUrl || !supabaseKey) {
    throw new HttpError(500, 'La API no tiene configuradas las variables de Supabase.');
  }

  return { url: supabaseUrl, key: supabaseKey };
};

const parseErrorMessage = (payload: unknown): string => {
  if (typeof payload === 'object' && payload !== null) {
    const body = payload as Record<string, unknown>;
    return String(
      body.error_description ?? body.message ?? body.msg ?? body.hint ?? 'Supabase rechazó la solicitud.',
    );
  }

  return 'Supabase rechazó la solicitud.';
};

const parseResponse = async <T>(response: Response): Promise<T> => {
  const payload = (await response.json()) as unknown;

  if (!response.ok) {
    throw new HttpError(response.status, parseErrorMessage(payload));
  }

  return payload as T;
};

export const requestSupabaseAuth = async <T>(
  path: string,
  body: Record<string, unknown>,
): Promise<T> => {
  const { url, key } = requireConfig();
  const response = await fetch(`${url}${path}`, {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  return parseResponse<T>(response);
};

export const requestSupabaseRest = async <T>(
  path: string,
  accessToken: string,
  options: RequestInit = {},
): Promise<T> => {
  const { url, key } = requireConfig();
  const response = await fetch(`${url}/rest/v1${path}`, {
    ...options,
    headers: {
      apikey: key,
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  });

  return parseResponse<T>(response);
};
