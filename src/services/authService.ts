import { User, UserRegisterForm } from '../types';

// Mock de usuario predeterminado
const MOCK_USER: User = {
  id: 'usr_789456',
  firstName: 'Juan',
  lastName: 'Pérez',
  email: 'juan.perez@example.com',
  documentId: '1020304050',
  phoneNumber: '+573001234567',
};

export const loginUser = async (email: string, password: string): Promise<User> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Simulación básica de validación
      if (email && password.length >= 6) {
        resolve({ ...MOCK_USER, email });
      } else {
        reject(new Error('Invalid email or password'));
      }
    }, 1000); // Simula 1 segundo de latencia de red
  });
};

export const registerUser = async (formData: UserRegisterForm): Promise<User> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: `usr_${Date.now()}`,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        documentId: formData.documentId,
        phoneNumber: formData.phoneNumber,
      });
    }, 1200);
  });
};