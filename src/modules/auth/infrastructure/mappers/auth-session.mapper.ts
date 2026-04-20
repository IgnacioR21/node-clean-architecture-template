import { CustomError } from '../../../../shared/errors/custom.error';
import { AuthSessionEntity } from '../../domain/entities/auth-session.entity';

export class AuthSessionMapper {

  static authSessionEntityFromObject(object: { [key: string]: any }) {

    const {
      id,
      userId,
      refreshTokenHash,
      expiresAt,
      revokedAt,
      createdAt,
      updatedAt,
      userAgent,
      ip,
    } = object;

    if ( !id ) throw CustomError.badRequest('Missing session id');
    if ( !userId ) throw CustomError.badRequest('Missing session userId');
    if ( !refreshTokenHash ) throw CustomError.badRequest('Missing session refreshTokenHash');
    if ( !expiresAt ) throw CustomError.badRequest('Missing session expiresAt');
    if ( !createdAt ) throw CustomError.badRequest('Missing session createdAt');
    if ( !updatedAt ) throw CustomError.badRequest('Missing session updatedAt');

    return new AuthSessionEntity(
      id,
      userId,
      refreshTokenHash,
      new Date(expiresAt),
      revokedAt ? new Date(revokedAt) : null,
      new Date(createdAt),
      new Date(updatedAt),
      userAgent || undefined,
      ip || undefined,
    );
  }

}
