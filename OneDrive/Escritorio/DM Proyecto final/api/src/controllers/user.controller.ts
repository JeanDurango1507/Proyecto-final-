import { Request, Response, NextFunction } from "express";
import { userService } from "../config/container";

export class UserController {
  public register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log("Peticion de registro recibida en la API:", req.body);
      const user = await userService.register(req.body);
      res.status(201).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  };

  public login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log("Peticion de login recibida en la API:", req.body);
      const { email, password } = req.body;
      const result = await userService.login(email, password);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };
}