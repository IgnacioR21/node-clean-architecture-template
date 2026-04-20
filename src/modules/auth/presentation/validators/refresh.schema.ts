import { z } from 'zod';

export const refreshSchema = z.object({
  refreshToken: z.unknown().optional(),
})
  .superRefine((data, ctx) => {
    if ( data.refreshToken === undefined ) return;

    if ( typeof data.refreshToken !== 'string' || !data.refreshToken.trim() ) {
      ctx.addIssue({
        code: 'custom',
        message: 'Invalid refreshToken',
        path: ['refreshToken'],
      });
    }
  })
  .transform((data) => ({
    refreshToken: typeof data.refreshToken === 'string'
      ? data.refreshToken.trim()
      : undefined,
  }));
