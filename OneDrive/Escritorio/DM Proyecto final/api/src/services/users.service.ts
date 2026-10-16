import { User } from "../models/user.model";

export class UserService {
  private users: User[] = [];

  public async register(userData: Omit<User, "id">): Promise<User> {
    const normalizedEmail = userData.email.trim().toLowerCase();

    const existingUser = this.users.find(
      (u) => u.email.toLowerCase() === normalizedEmail
    );

    if (existingUser) {
      throw new Error("El usuario ya existe con este correo");
    }

    const newUser: User = {
      id: (this.users.length + 1).toString(),
      name: userData.name,
      email: normalizedEmail,
      password: userData.password,
    };

    this.users.push(newUser);
    console.log("Usuario registrado con exito en memoria:", newUser);
    console.log("Lista actual de usuarios:", this.users);

    return newUser;
  }

  public async login(email: string, password?: string): Promise<{ user: User; token: string }> {
    const normalizedEmail = email.trim().toLowerCase();

    console.log(`Buscando usuario con email: "${normalizedEmail}"`);
    console.log("Usuarios disponibles:", this.users.map((u) => ({ email: u.email, pass: u.password })));

    const user = this.users.find((u) => u.email.toLowerCase() === normalizedEmail);

    if (!user) {
      throw new Error("El correo electronico no se encuentra registrado.");
    }

    if (password && user.password !== password) {
      throw new Error("Contrasena incorrecta.");
    }

    return {
      user,
      token: `fake-jwt-token-${user.id}`,
    };
  }
}