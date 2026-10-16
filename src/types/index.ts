// src/types/index.ts

export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  Home: undefined;
  AddTransaction: undefined;
  FamilyGroup: undefined;
};

// Asegúrate de que tenga "export" al inicio
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface UserRegisterForm {
  firstName: string;
  lastName: string;
  documentId: string;
  phoneNumber: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export type TransactionType = 'Personal' | 'Family';

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  category: string;
  type: TransactionType;
  date: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  role: 'Admin' | 'Member';
}