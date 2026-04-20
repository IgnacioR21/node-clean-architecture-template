import { JwtAdapter, JwtTokenPayload } from '../../../../config';
import { CustomError } from '../../../../shared/errors/custom.error';
import { TokenHashHelper } from '../../../../shared/helpers/token-hash';
import { RefreshTokenDto } from '../dtos/refresh-token.dto';
import { AuthRepository } from '../../domain/repositories/auth.repository';

interface AuthResponse {
  token: string;
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

type ValidateRefreshToken = (token: string) => Promise<JwtTokenPayload | null>;
type CreateToken = (payload: JwtTokenPayload) => Promise<string | null>;
type GetTokenExpirationDate = (token: string) => Date | null;
type HashToken = (token: string) => string;

interface RefreshSessionUseCase {
  execute( refreshTokenDto: RefreshTokenDto ): Promise<AuthResponse>;
}

export class RefreshSession implements RefreshSessionUseCase {

  constructor(
    private readonly authRepository: AuthRepository,
    private readonly validateRefreshToken: ValidateRefreshToken = JwtAdapter.validateRefreshToken,
    private readonly createAccessToken: CreateToken = JwtAdapter.generateAccessToken,
    private readonly createRefreshToken: CreateToken = JwtAdapter.generateRefreshToken,
    private readonly getTokenExpirationDate: GetTokenExpirationDate = JwtAdapter.getTokenExpirationDate,
    private readonly hashToken: HashToken = TokenHashHelper.hash,
  ) {}


  async execute( refreshTokenDto: RefreshTokenDto ): Promise<AuthResponse> {

    const payload = await this.validateRefreshToken(refreshTokenDto.refreshToken);
    if ( !payload ) throw CustomError.unauthorized('Invalid refresh token');

    const session = await this.authRepository.getSessionById(payload.sessionId);
    if ( !session || session.userId !== payload.sub ) {
      throw CustomError.unauthorized('Invalid session');
    }

    if ( session.revokedAt ) throw CustomError.unauthorized('Session revoked');
    if ( session.expiresAt.getTime() <= Date.now() ) {
      throw CustomError.unauthorized('Session expired');
    }

    if ( session.refreshTokenHash !== this.hashToken(refreshTokenDto.refreshToken) ) {
      throw CustomError.unauthorized('Invalid refresh token');
    }

    const user = await this.authRepository.getUserById(payload.sub);
    if ( !user ) throw CustomError.unauthorized('Invalid token - user not found');

    const accessToken = await this.createAccessToken({
      sub: user.id,
      sessionId: session.id,
      type: 'access',
    });
    if ( !accessToken ) throw CustomError.internalServer('Error generating access token');

    const newRefreshToken = await this.createRefreshToken({
      sub: user.id,
      sessionId: session.id,
      type: 'refresh',
    });
    if ( !newRefreshToken ) throw CustomError.internalServer('Error generating refresh token');

    const refreshExpiresAt = this.getTokenExpirationDate(newRefreshToken);
    if ( !refreshExpiresAt ) throw CustomError.internalServer('Error getting refresh token expiration');

    await this.authRepository.rotateSession(session.id, {
      refreshTokenHash: this.hashToken(newRefreshToken),
      expiresAt: refreshExpiresAt,
    });

    return {
      token: accessToken,
      accessToken: accessToken,
      refreshToken: newRefreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      }
    };
  }

}
