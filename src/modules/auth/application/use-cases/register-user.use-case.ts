import { randomUUID } from 'crypto';
import { JwtAdapter, JwtTokenPayload } from '../../../../config';
import { CustomError } from '../../../../shared/errors/custom.error';
import { TokenHashHelper } from '../../../../shared/helpers/token-hash';
import { RegisterUserDto } from '../dtos/register-user.dto';
import { AuthRepository } from '../../domain/repositories/auth.repository';

interface UserToken {
  token: string;
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

type CreateToken = (payload: JwtTokenPayload) => Promise<string | null>;
type GetTokenExpirationDate = (token: string) => Date | null;
type HashToken = (token: string) => string;


interface RegisterUserUseCase {
  execute(
    registerUserDto: RegisterUserDto,
    sessionData?: { userAgent?: string; ip?: string }
  ): Promise<UserToken>;
}


export class RegisterUser implements RegisterUserUseCase {

  constructor(
    private readonly authResository: AuthRepository,
    private readonly createAccessToken: CreateToken = JwtAdapter.generateAccessToken,
    private readonly createRefreshToken: CreateToken = JwtAdapter.generateRefreshToken,
    private readonly getTokenExpirationDate: GetTokenExpirationDate = JwtAdapter.getTokenExpirationDate,
    private readonly hashToken: HashToken = TokenHashHelper.hash,
  ){}


  async execute(
    registerUserDto: RegisterUserDto,
    sessionData?: { userAgent?: string; ip?: string }
  ): Promise<UserToken> {

    // Crear usuario
    const user = await this.authResository.register({
      name: registerUserDto.name,
      email: registerUserDto.email,
      password: registerUserDto.password,
    });
    const sessionId = randomUUID();

    const accessToken = await this.createAccessToken({
      sub: user.id,
      sessionId: sessionId,
      type: 'access',
    });
    if ( !accessToken ) throw CustomError.internalServer('Error generating access token');

    const refreshToken = await this.createRefreshToken({
      sub: user.id,
      sessionId: sessionId,
      type: 'refresh',
    });
    if ( !refreshToken ) throw CustomError.internalServer('Error generating refresh token');

    const refreshExpiresAt = this.getTokenExpirationDate(refreshToken);
    if ( !refreshExpiresAt ) throw CustomError.internalServer('Error getting refresh token expiration');

    await this.authResository.createSession({
      id: sessionId,
      userId: user.id,
      refreshTokenHash: this.hashToken(refreshToken),
      expiresAt: refreshExpiresAt,
      userAgent: sessionData?.userAgent,
      ip: sessionData?.ip,
    });

    return {
      token: accessToken,
      accessToken: accessToken,
      refreshToken: refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      }
    };

  }

}
