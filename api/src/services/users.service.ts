import { HttpError, requestSupabaseAuth } from '../config/supabaseHttp';
import { User } from '../models/user.model';

type SupabaseUser = {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
};

type SignUpResponse = {
  user: SupabaseUser | null;
  session: { access_token: string } | null;
};

type LoginResponse = {
  user: SupabaseUser;
  access_token: string;
};

type Credentials = { email: string; password: string; name?: string };

const mapUser = (user: SupabaseUser): User => {
  const metadata = user.user_metadata ?? {};
  const firstName = String(metadata.first_name ?? '');
  const lastName = String(metadata.last_name ?? '');

  return {
    id: user.id,
    name: String(metadata.name ?? `${firstName} ${lastName}`.trim()),
    email: user.email ?? '',
  };
};

const parseCredentials = (value: unknown, requireName = false): Credentials => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new HttpError(400, 'Envía un objeto con correo y contraseña.');
  }

  const body = value as Record<string, unknown>;
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body.password === 'string' ? body.password : '';
  const name = typeof body.name === 'string' ? body.name.trim() : '';

  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    throw new HttpError(400, 'Escribe un correo electrónico válido.');
  }
  if (password.length < 6 || password.length > 128) {
    throw new HttpError(400, 'La contraseña debe tener entre 6 y 128 caracteres.');
  }
  if (requireName && (name.length < 2 || name.length > 100)) {
    throw new HttpError(400, 'El nombre debe tener entre 2 y 100 caracteres.');
  }

  return { email, password, name };
};

export class UserService {
  public async register(payload: unknown): Promise<User> {
    const credentials = parseCredentials(payload, true);
    const result = await requestSupabaseAuth<SignUpResponse>('/auth/v1/signup', {
      email: credentials.email,
      password: credentials.password,
      data: { name: credentials.name },
    });

    if (!result.user) {
      throw new HttpError(502, 'Supabase no devolvió el usuario registrado.');
    }

    return mapUser(result.user);
  }

  public async login(payload: unknown): Promise<{ user: User; token: string }> {
    const { email, password } = parseCredentials(payload);
    const result = await requestSupabaseAuth<LoginResponse>('/auth/v1/token?grant_type=password', {
      email,
      password,
    });

    return {
      user: mapUser(result.user),
      token: result.access_token,
    };
  }
}
