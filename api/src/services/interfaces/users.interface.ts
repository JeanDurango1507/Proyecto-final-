export interface IUser {
  id: string;
  name: string;
  email: string;
  password?: string;
  createdAt?: Date;
}

export interface IUserService {
  register(userData: Partial<IUser>): Promise<IUser>;
  login(email: string, password: string): Promise<{ user: IUser; token: string }>;
  getById(id: string): Promise<IUser | null>;
}