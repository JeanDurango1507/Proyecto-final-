
import { supabase } from '../lib/supabase';
import { UserRegisterForm } from '../types';

export async function registerUser(data: UserRegisterForm) {
  const { data: result, error } = await supabase.auth.signUp({
    email: data.email.trim().toLowerCase(),
    password: data.password,
    options: {
      data: {
        first_name: data.firstName.trim(),
        last_name: data.lastName.trim(),
        document_id: data.documentId.trim() || null,
        phone_number: data.phoneNumber.trim() || null,
      },
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  return result;
}

export async function loginUser(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function logoutUser() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(error.message);
  }
}

export async function requestPasswordReset(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase());

  if (error) {
    throw new Error(error.message);
  }
}
