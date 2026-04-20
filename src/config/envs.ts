import 'dotenv/config';
import { get } from 'env-var';

const JWT_SEED = get('JWT_SEED').required().asString();


export const envs = {


  PORT: get('PORT').required().asPortNumber(),

  DATABASE_URL: get('DATABASE_URL').required().asString(),

  JWT_SEED: JWT_SEED,
  JWT_REFRESH_SEED: get('JWT_REFRESH_SEED').default(JWT_SEED).asString(),
  JWT_ACCESS_EXPIRES_IN: get('JWT_ACCESS_EXPIRES_IN').default('15m').asString(),
  JWT_REFRESH_EXPIRES_IN: get('JWT_REFRESH_EXPIRES_IN').default('7d').asString(),
  AUTH_REFRESH_COOKIE_NAME: get('AUTH_REFRESH_COOKIE_NAME').default('refreshToken').asString(),
  AUTH_REFRESH_COOKIE_SECURE: get('AUTH_REFRESH_COOKIE_SECURE').default('false').asBool(),
  AUTH_REFRESH_COOKIE_SAME_SITE: get('AUTH_REFRESH_COOKIE_SAME_SITE').default('lax').asEnum(['lax', 'strict', 'none']),
  AUTH_REFRESH_COOKIE_PATH: get('AUTH_REFRESH_COOKIE_PATH').default('/api/auth').asString(),

}
