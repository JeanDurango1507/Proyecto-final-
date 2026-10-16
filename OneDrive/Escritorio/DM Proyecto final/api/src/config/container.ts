import { UserService } from "../services/users.service";
import { UserController } from "../controllers/user.controller";

export const userService = new UserService();
export const userController = new UserController();