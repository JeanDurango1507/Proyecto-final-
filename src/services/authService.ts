import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, UserRegisterForm } from '../types';

const USERS_STORAGE_KEY = '@app_registered_users';

// Obtener usuarios guardados en el almacenamiento local
const getStoredUsers = async (): Promise<any[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(USERS_STORAGE_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (error) {
    console.error('Error al leer usuarios de AsyncStorage', error);
    return [];
  }
};

// Servicio de Inicio de Sesión
export const loginUser = async (email: string, password: string): Promise<User> => {
  const users = await getStoredUsers();
  const normalizedEmail = email.trim().toLowerCase();

  // 1. Buscar usuario por correo
  const foundUser = users.find(
    (user) => user.email.toLowerCase() === normalizedEmail
  );

  if (!foundUser) {
    throw new Error('El correo electrónico no se encuentra registrado. Por favor, crea una cuenta.');
  }

  // 2. Validar contraseña
  if (foundUser.password !== password) {
    throw new Error('Contraseña incorrecta. Por favor, verifica e intenta de nuevo.');
  }

  // 3. Inicio exitoso
  return {
    id: foundUser.id,
    email: foundUser.email,
    firstName: foundUser.firstName,
    lastName: foundUser.lastName,
  };
};

// Servicio de Registro de Usuarios
export const registerUser = async (formData: UserRegisterForm): Promise<User> => {
  const users = await getStoredUsers();
  const normalizedEmail = formData.email.trim().toLowerCase();

  // Validar si el correo ya existe
  const userExists = users.some(
    (user) => user.email.toLowerCase() === normalizedEmail
  );

  if (userExists) {
    throw new Error('Ya existe una cuenta registrada con este correo electrónico.');
  }

  // Crear nuevo registro
  const newUser = {
    id: (users.length + 1).toString(),
    email: formData.email.trim(),
    password: formData.password,
    firstName: formData.firstName.trim(),
    lastName: formData.lastName.trim(),
    phoneNumber: formData.phoneNumber,
    documentId: formData.documentId,
  };

  // Guardar en AsyncStorage
  const updatedUsers = [...users, newUser];
  await AsyncStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));

  return {
    id: newUser.id,
    email: newUser.email,
    firstName: newUser.firstName,
    lastName: newUser.lastName,
  };
};