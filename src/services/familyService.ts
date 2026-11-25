import { Family, FamilyMember } from '../types';
import { supabase } from '../lib/supabase';

interface FamilyMemberRow {
  member_user_id: string;
  first_name: string;
  last_name: string;
  member_role: 'admin' | 'member';
}

export async function listFamilies(): Promise<Family[]> {
  const { data, error } = await supabase
    .from('families')
    .select('id, name')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`No se pudieron cargar los grupos familiares: ${error.message}`);
  }

  return data ?? [];
}

export async function listFamilyMembers(familyId: string): Promise<FamilyMember[]> {
  const { data, error } = await supabase.rpc('get_family_members', {
    target_family_id: familyId,
  });

  if (error) {
    throw new Error(`No se pudieron cargar los integrantes: ${error.message}`);
  }

  return ((data ?? []) as FamilyMemberRow[]).map((member) => ({
    id: member.member_user_id,
    name: [member.first_name, member.last_name].filter(Boolean).join(' ') || 'Usuario',
    role: member.member_role === 'admin' ? 'Admin' : 'Member',
  }));
}

export async function createFamily(name: string): Promise<Family> {
  const normalizedName = name.trim();
  if (normalizedName.length < 2 || normalizedName.length > 100) {
    throw new Error('El nombre del grupo debe tener entre 2 y 100 caracteres.');
  }

  const { data, error } = await supabase.rpc('create_family', {
    group_name: normalizedName,
  }).single();

  if (error) {
    if (error.code === 'PGRST202') {
      return createFamilyWithLegacySchema(normalizedName);
    }
    throw new Error(`No se pudo crear el grupo familiar: ${error.message}`);
  }
  if (!data) {
    throw new Error('Supabase no confirmó la creación del grupo familiar.');
  }

  return data as Family;
}

async function createFamilyWithLegacySchema(name: string): Promise<Family> {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    throw new Error('Debes iniciar sesión para crear un grupo familiar.');
  }

  const { data: family, error: familyError } = await supabase
    .from('families')
    .insert({ name })
    .select('id, name')
    .single();
  if (familyError) {
    throw new Error(`No se pudo crear el grupo familiar: ${familyError.message}`);
  }

  const { error: memberError } = await supabase.from('family_members').insert({
    family_id: family.id,
    user_id: authData.user.id,
    role: 'admin',
  });
  if (memberError) {
    throw new Error(`El grupo se creó, pero no se pudo asignar el administrador: ${memberError.message}`);
  }

  return family;
}
