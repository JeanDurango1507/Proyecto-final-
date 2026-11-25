import type { User as SupabaseUser } from '@supabase/supabase-js';
import type { User, UserRegisterForm } from '../types';
import {
  loginUser as signIn,
  registerUser as signUp,
  requestPasswordReset,
} from './supabaseAuthService';

const getMetadataText = (user: SupabaseUser, key: string): string => {
  const value: unknown = user.user_metadata?.[key];
  return typeof value === 'string' ? value : '';
};

export const toAppUser = (user: SupabaseUser): User => ({
  id: user.id,
  email: user.email ?? '',
  firstName: getMetadataText(user, 'first_name'),
  lastName: getMetadataText(user, 'last_name'),
});

export const loginUser = async (email: string, password: string): Promise<User> => {
  const { user } = await signIn(email, password);
  if (!user) throw new Error('Supabase no devolvió el usuario autenticado.');
  return toAppUser(user);
};

export const registerUser = async (formData: UserRegisterForm): Promise<User | null> => {
  const { user, session } = await signUp(formData);
  return session && user ? toAppUser(user) : null;
};

export { requestPasswordReset };
