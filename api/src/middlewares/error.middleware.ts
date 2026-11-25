import { Request, Response, NextFunction } from 'express';
import { HttpError } from '../config/supabaseHttp';

export const errorMiddleware = (
  error: unknown,
  _request: Request,
  response: Response,
  _next: NextFunction,
): void => {
  if (error instanceof HttpError) {
    response.status(error.status).json({ success: false, message: error.message });
    return;
  }

  const parserError = error as { status?: unknown } | null;
  if (parserError?.status === 400) {
    response.status(400).json({ success: false, message: 'El cuerpo de la solicitud no es JSON válido.' });
    return;
  }
  if (parserError?.status === 413) {
    response.status(413).json({ success: false, message: 'La solicitud supera el tamaño permitido.' });
    return;
  }

  response.status(500).json({ success: false, message: 'Error interno del servidor.' });
};
