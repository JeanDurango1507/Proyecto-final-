import type { User as SupabaseUser } from '@supabase/supabase-js';
import { User, UserRegisterForm } from '../types';
import { supabase } from './supabase';

const getMetadataText = (user: SupabaseUser, key: string): string => {
  const value: unknown = user.user_metadata[key];
  return typeof value === 'string' ? value : '';
};

export const toAppUser = (user: SupabaseUser): User => ({
  id: user.id,
  email: user.email ?? '',
  firstName: getMetadataText(user, 'first_name'),
  lastName: getMetadataText(user, 'last_name'),
});

export const loginUser = async (email: string, password: string): Promise<User> => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error) {
    throw error;
  }

  return toAppUser(data.user);
};

export const registerUser = async (formData: UserRegisterForm): Promise<User | null> => {
  const { data, error } = await supabase.auth.signUp({
    email: formData.email.trim(),
    password: formData.password,
    options: {
      data: {
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim(),
        document_id: formData.documentId.trim(),
        phone_number: formData.phoneNumber.trim(),
      },
    },
  });

  if (error) {
    throw error;
  }

  return data.session && data.user ? toAppUser(data.user) : null;
};

export const requestPasswordReset = async (email: string): Promise<void> => {
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim());

  if (error) {
    throw error;
  }
};