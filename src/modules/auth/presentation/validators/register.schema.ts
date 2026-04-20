import { z } from 'zod';
import { Validators } from '../../../../config';

export const registerSchema = z.object({
  name: z.unknown(),
  email: z.unknown(),
  password: z.unknown(),
})
  .superRefine((data, ctx) => {
    if ( typeof data.name !== 'string' || !data.name.trim() ) {
      ctx.addIssue({
        code: 'custom',
        message: 'Missing name',
        path: ['name'],
      });
    }

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
    name: (data.name as string).trim(),
    email: (data.email as string).trim(),
    password: data.password as string,
  }));
