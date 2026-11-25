import { Request, Response, NextFunction } from "express";
import { userService } from "../config/container";

export class UserController {
  public register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await userService.register(req.body);
      res.status(201).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  };

  public login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await userService.login(req.body);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };
}
