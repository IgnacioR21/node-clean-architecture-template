import { z } from 'zod';
import { Validators } from '../../../../config';

export const loginSchema = z.object({
  email: z.unknown(),
  password: z.unknown(),
})
  .superRefine((data, ctx) => {
    if ( typeof data.email !== 'string' || !data.email.trim() ) {
      ctx.addIssue({
        code: 'custom',
        message: 'Missing email',
        path: ['email'],
      });
    } else if ( !Validators.email.test(data.email) ) {
      ctx.addIssue({
        code: 'custom',
        message: 'Email is not valid',
        path: ['email'],
      });
    }

    if ( typeof data.password !== 'string' || !data.password ) {
      ctx.addIssue({
        code: 'custom',
        message: 'Missing password',
        path: ['password'],
      });
    } else if ( data.password.length < 6 ) {
      ctx.addIssue({
        code: 'custom',
        message: 'Password too short',
        path: ['password'],
      });
    }
  })
  .transform((data) => ({
    email: (data.email as string).trim(),
    password: data.password as string,
  }));
