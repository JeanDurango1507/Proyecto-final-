import { requestSupabaseAuth } from '../config/supabaseHttp';
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

export class UserService {
  public async register(userData: Omit<User, 'id'>): Promise<User> {
    if (!userData.email?.trim() || !userData.password) {
      throw new Error('El correo y la contraseña son obligatorios.');
    }

    const result = await requestSupabaseAuth<SignUpResponse>('/auth/v1/signup', {
      email: userData.email.trim().toLowerCase(),
      password: userData.password,
      data: {
        name: userData.name?.trim() ?? '',
      },
    });

    if (!result.user) {
      throw new Error('Supabase no devolvió el usuario registrado.');
    }

    return mapUser(result.user);
  }

  public async login(email: string, password?: string): Promise<{ user: User; token: string }> {
    if (!email?.trim() || !password) {
      throw new Error('El correo y la contraseña son obligatorios.');
    }

    const result = await requestSupabaseAuth<LoginResponse>('/auth/v1/token?grant_type=password', {
      email: email.trim().toLowerCase(),
      password,
    });

    return {
      user: mapUser(result.user),
      token: result.access_token,
    };
  }
}
