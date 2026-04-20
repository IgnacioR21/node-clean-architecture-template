import { Request, Response } from 'express';
import { CustomError } from '../../../shared/errors/custom.error';
import { LoginUserDto } from '../application/dtos/login-user.dto';
import { RefreshTokenDto } from '../application/dtos/refresh-token.dto';
import { RegisterUserDto } from '../application/dtos/register-user.dto';
import { LoginUser } from '../application/use-cases/login-user.use-case';
import { LogoutSession } from '../application/use-cases/logout-session.use-case';
import { RefreshSession } from '../application/use-cases/refresh-session.use-case';
import { RegisterUser } from '../application/use-cases/register-user.use-case';
import { AuthCookie } from './helpers/auth-cookie';
import { AuthRepository } from '../domain/repositories/auth.repository';



export class AuthController {

  // DI
  constructor(
    private readonly authRepository: AuthRepository,
  ) {}

  private handleError = ( error: unknown, res: Response ) => {
    if ( error instanceof CustomError ) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    console.log(error); // Winston
    return res.status(500).json({ error: 'Internal Server Error' });
  }

  private getSessionData( req: Request ) {
    return {
      userAgent: req.header('user-agent') || undefined,
      ip: req.ip || undefined,
    };
  }

  private getSafeUser( req: Request ) {
    if ( !req.user ) return undefined;

    return {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      img: req.user.img,
    };
  }


  registerUser = (req: Request, res: Response ) => {
    const registerUserDto = RegisterUserDto.create(req.body);
    
    new RegisterUser(this.authRepository)
      .execute( registerUserDto, this.getSessionData(req) )
      .then( data => {
        AuthCookie.setRefreshToken(res, data.refreshToken);
        return res.json(data);
      } )
      .catch( error => this.handleError(error, res) );
  }


  loginUser = (req: Request, res: Response ) => {
    const loginUserDto = LoginUserDto.create(req.body);
    
    new LoginUser(this.authRepository)
      .execute( loginUserDto, this.getSessionData(req) )
      .then( data => {
        AuthCookie.setRefreshToken(res, data.refreshToken);
        return res.json(data);
      } )
      .catch( error => this.handleError(error, res) );
  }


  refreshSession = (req: Request, res: Response ) => {
    const refreshToken = AuthCookie.getRefreshToken(req) || req.body.refreshToken;
    if ( !refreshToken ) return this.handleError(CustomError.badRequest('Missing refreshToken'), res);

    const refreshTokenDto = RefreshTokenDto.create({ refreshToken });

    new RefreshSession(this.authRepository)
      .execute( refreshTokenDto )
      .then( data => {
        AuthCookie.setRefreshToken(res, data.refreshToken);
        return res.json(data);
      } )
      .catch( error => this.handleError(error, res) );
  }


  logoutSession = (req: Request, res: Response ) => {
    if ( !req.sessionId ) return res.status(401).json({ error: 'Invalid session' });

    new LogoutSession(this.authRepository)
      .execute( req.sessionId )
      .then( data => {
        AuthCookie.clearRefreshToken(res);
        return res.json(data);
      } )
      .catch( error => this.handleError(error, res) );
  }


  getUser = (req: Request, res: Response ) => {
    res.json({
      user: this.getSafeUser(req)
    }) 

  }


}
