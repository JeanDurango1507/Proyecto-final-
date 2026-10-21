
import { supabase } from '../lib/supabase';

type RegisterData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  documentId?: string;
  phoneNumber?: string;
};

export async function registerUser(data: RegisterData) {
  const { data: result, error } = await supabase.auth.signUp({
    email: data.email.trim().toLowerCase(),
    password: data.password,
    options: {
      data: {
        first_name: data.firstName.trim(),
        last_name: data.lastName.trim(),
        document_id: data.documentId?.trim() || null,
        phone_number: data.phoneNumber?.trim() || null,
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
