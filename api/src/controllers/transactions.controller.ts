import { NextFunction, Request, Response } from 'express';
import { HttpError } from '../config/supabaseHttp';
import { TransactionsService } from '../services/transactions.service';

const transactionsService = new TransactionsService();

const getAccessToken = (request: Request): string => {
  const authorization = request.header('authorization');
  const match = authorization?.match(/^Bearer\s+([^\s]+)$/i);

  if (!match || match[1].length > 8192) {
    throw new HttpError(401, 'Debes enviar un token Bearer válido de Supabase.');
  }

  return match[1];
};

const parseIntegerQuery = (value: unknown, fallback: number, name: string): number => {
  if (value === undefined) return fallback;
  if (typeof value !== 'string' || !/^\d+$/.test(value)) {
    throw new HttpError(400, `${name} debe ser un número entero no negativo.`);
  }
  return Number(value);
};

export class TransactionsController {
  public list = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const limit = parseIntegerQuery(request.query.limit, 20, 'limit');
      const offset = parseIntegerQuery(request.query.offset, 0, 'offset');
      if (limit < 1 || limit > 100) throw new HttpError(400, 'limit debe estar entre 1 y 100.');
      response.status(200).json({
        success: true,
        data: await transactionsService.list(getAccessToken(request), limit, offset),
      });
    } catch (error) {
      next(error);
    }
  };

  public getById = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      response.status(200).json({
        success: true,
        data: await transactionsService.getById(getAccessToken(request), String(request.params.id)),
      });
    } catch (error) {
      next(error);
    }
  };

  public create = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      response.status(201).json({
        success: true,
        data: await transactionsService.create(getAccessToken(request), request.body),
      });
    } catch (error) {
      next(error);
    }
  };

  public update = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      response.status(200).json({
        success: true,
        data: await transactionsService.update(
          getAccessToken(request),
          String(request.params.id),
          request.body,
        ),
      });
    } catch (error) {
      next(error);
    }
  };
}
