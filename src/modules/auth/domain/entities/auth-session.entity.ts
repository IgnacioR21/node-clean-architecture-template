export class AuthSessionEntity {

  constructor(
    public id: string,
    public userId: string,
    public refreshTokenHash: string,
    public expiresAt: Date,
    public revokedAt: Date | null,
    public createdAt: Date,
    public updatedAt: Date,
    public userAgent?: string,
    public ip?: string,
  ) {}

}

export interface CreateAuthSession {
  id: string;
  userId: string;
  refreshTokenHash: string;
  expiresAt: Date;
  userAgent?: string;
  ip?: string;
}

export interface RotateAuthSession {
  refreshTokenHash: string;
  expiresAt: Date;
}
