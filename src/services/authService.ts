import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, UserRegisterForm } from '../types';

const API_URL = 'http://192.168.40.41:3000/api/v1/users';
const CURRENT_USER_STORAGE_KEY = '@app_current_user';
const TOKEN_STORAGE_KEY = '@app_user_token';

// Parseo defensivo para evitar caídas si el servidor responde con HTML por error de ruta
const parseResponseSafely = async (response: Response) => {
  const responseText = await response.text();
  try {
    return JSON.parse(responseText);
  } catch (error) {
    console.error("El servidor devolvió una respuesta no válida (HTML):", responseText.substring(0, 100));
    throw new Error("El servidor no respondió con un formato JSON válido. Verifique la conexión.");
  }
};

export const loginUser = async (email: string, password: string): Promise<User> => {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const result = await parseResponseSafely(response);

  if (!response.ok) {
    throw new Error(result.message || 'Error al iniciar sesión');
  }

  const userData = result.data?.user || result.user || result.data || result;
  const userSession: User = {
    id: userData.id || userData._id || userData.userId || '1',
    email: userData.email || email,
    firstName: userData.name || userData.firstName || 'Usuario',
    lastName: userData.lastName || '',
  };

  await AsyncStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(userSession));
  const token = result.data?.token || result.token;
  if (token) {
    await AsyncStorage.setItem(TOKEN_STORAGE_KEY, token);
  }

  return userSession;
};

export const registerUser = async (formData: UserRegisterForm): Promise<User> => {
  const emailLower = formData.email.trim().toLowerCase();
  
  // REQUISITO INSTITUCIONAL: Validación estricta de correo @pascualbravo.edu.co
  if (!emailLower.endsWith('@pascualbravo.edu.co')) {
    throw new Error('Solo se permite el registro con correos institucionales (@pascualbravo.edu.co)');
  }

  const response = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: `${formData.firstName} ${formData.lastName}`.trim(),
      email: emailLower,
      password: formData.password,
    }),
  });

  const result = await parseResponseSafely(response);

  if (!response.ok) {
    throw new Error(result.message || 'Error en el registro. Verifique su correo electrónico.');
  }

  const userData = result.data?.user || result.data || result;
  const userSession: User = {
    id: userData.id || userData._id || userData.userId || '1',
    email: userData.email || emailLower,
    firstName: formData.firstName,
    lastName: formData.lastName,
  };

  await AsyncStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(userSession));
  const token = result.data?.token || result.token;
  if (token) {
    await AsyncStorage.setItem(TOKEN_STORAGE_KEY, token);
  }

  return userSession;
};

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const jsonValue = await AsyncStorage.getItem(CURRENT_USER_STORAGE_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error('Error al recuperar sesión', error);
    return null;
  }
};

export const logoutUser = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(CURRENT_USER_STORAGE_KEY);
    await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch (error) {
    console.error('Error al cerrar sesión', error);
  }
};