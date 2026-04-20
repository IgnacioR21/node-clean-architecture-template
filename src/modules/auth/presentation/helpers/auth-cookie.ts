import { Request, Response } from 'express';
import { CookieOptions } from 'express-serve-static-core';
import { envs, JwtAdapter } from '../../../../config';

export class AuthCookie {

  static readonly refreshTokenName = envs.AUTH_REFRESH_COOKIE_NAME;

  static getRefreshToken( req: Request ): string | undefined {
    const refreshToken = req.cookies?.[this.refreshTokenName];

    if ( typeof refreshToken !== 'string' || !refreshToken.trim() ) return undefined;

    return refreshToken.trim();
  }

  static setRefreshToken( res: Response, refreshToken: string ) {
    const expiresAt = JwtAdapter.getTokenExpirationDate(refreshToken);

    res.cookie(this.refreshTokenName, refreshToken, {
      ...this.baseOptions,
      expires: expiresAt || undefined,
    });
  }

  static clearRefreshToken( res: Response ) {
    res.clearCookie(this.refreshTokenName, this.baseOptions);
  }

  private static get baseOptions(): CookieOptions {
    return {
      httpOnly: true,
      secure: envs.AUTH_REFRESH_COOKIE_SECURE,
      sameSite: envs.AUTH_REFRESH_COOKIE_SAME_SITE,
      path: envs.AUTH_REFRESH_COOKIE_PATH,
    };
  }

}
