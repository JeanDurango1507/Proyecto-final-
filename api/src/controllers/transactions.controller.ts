import { NextFunction, Request, Response } from 'express';
import { HttpError } from '../config/supabaseHttp';
import { TransactionsService } from '../services/transactions.service';

const transactionsService = new TransactionsService();

const getAccessToken = (request: Request): string => {
  const authorization = request.header('authorization');
  const match = authorization?.match(/^Bearer\s+(.+)$/i);

  if (!match) {
    throw new HttpError(401, 'Debes enviar un token Bearer de Supabase.');
  }

  return match[1];
};

export class TransactionsController {
  public list = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      response.status(200).json({ success: true, data: await transactionsService.list(getAccessToken(request)) });
    } catch (error) {
      next(error);
    }
  };

  public getById = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      response.status(200).json({ success: true, data: await transactionsService.getById(getAccessToken(request), String(request.params.id)) });
    } catch (error) {
      next(error);
    }
  };

  public create = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      response.status(201).json({ success: true, data: await transactionsService.create(getAccessToken(request), request.body) });
    } catch (error) {
      next(error);
    }
  };

  public update = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      response.status(200).json({ success: true, data: await transactionsService.update(getAccessToken(request), String(request.params.id), request.body) });
    } catch (error) {
      next(error);
    }
  };
}
