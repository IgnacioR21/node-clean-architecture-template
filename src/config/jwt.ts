import jwt, { JwtPayload } from 'jsonwebtoken';
import { envs } from './envs';


const ACCESS_JWT_SEED = envs.JWT_SEED;
const REFRESH_JWT_SEED = envs.JWT_REFRESH_SEED;

export type JwtTokenType = 'access' | 'refresh';

export interface JwtTokenPayload {
  sub: string;
  sessionId: string;
  type: JwtTokenType;
}


export class JwtAdapter {

  static generateAccessToken( payload: JwtTokenPayload ): Promise<string | null> {
    return this.signToken(payload, ACCESS_JWT_SEED, envs.JWT_ACCESS_EXPIRES_IN);
  }

  static generateRefreshToken( payload: JwtTokenPayload ): Promise<string | null> {
    return this.signToken(payload, REFRESH_JWT_SEED, envs.JWT_REFRESH_EXPIRES_IN);
  }

  static validateAccessToken( token: string ): Promise<JwtTokenPayload | null> {
    return this.validateToken(token, ACCESS_JWT_SEED, 'access');
  }

  static validateRefreshToken( token: string ): Promise<JwtTokenPayload | null> {
    return this.validateToken(token, REFRESH_JWT_SEED, 'refresh');
  }

  static getTokenExpirationDate( token: string ): Date | null {
    const decoded = jwt.decode(token);

    if ( !decoded || typeof decoded === 'string' || !decoded.exp ) {
      return null;
    }

    return new Date(decoded.exp * 1000);
  }

  private static async signToken(
    payload: JwtTokenPayload,
    seed: string,
    duration: string,
  ): Promise<string | null> {

    return new Promise( ( resolve ) => {

      jwt.sign( payload, seed, { expiresIn: duration }, (err, token) => {

        if ( err || !token ) return resolve(null);

        resolve(token);
      });


    } );


  }


  private static async validateToken(
    token: string,
    seed: string,
    type: JwtTokenType,
  ): Promise<JwtTokenPayload | null> {

    return new Promise( (resolve) => {

      jwt.verify( token, seed, (err, decoded) => {

        if ( err || !decoded || typeof decoded === 'string' ) return resolve(null);

        const payload = decoded as JwtPayload & Partial<JwtTokenPayload>;

        if ( payload.type !== type ) return resolve(null);
        if ( typeof payload.sub !== 'string' ) return resolve(null);
        if ( typeof payload.sessionId !== 'string' ) return resolve(null);

        resolve({
          sub: payload.sub,
          sessionId: payload.sessionId,
          type: type,
        });

      });


    });


  }


}
