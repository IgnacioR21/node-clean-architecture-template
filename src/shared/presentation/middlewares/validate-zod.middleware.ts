import { NextFunction, Request, Response } from 'express';
import { ZodType } from 'zod';

export class ValidateZodMiddleware {

  static validateBody<T>(schema: ZodType<T>) {
    return (req: Request, res: Response, next: NextFunction) => {
      const result = schema.safeParse(req.body ?? {});

      if ( !result.success ) {
        const issue = result.error.issues[0];

        return res.status(400).json({
          error: issue?.message || 'Invalid request body',
        });
      }

      req.body = result.data;
      next();
    };
  }

}
