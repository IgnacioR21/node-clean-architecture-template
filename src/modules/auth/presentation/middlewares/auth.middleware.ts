import { NextFunction, Request, Response } from 'express';
import { JwtAdapter } from '../../../../config';
import { GetUserById } from '../../application/use-cases/get-user-by-id.use-case';
import { AuthRepository } from '../../domain/repositories/auth.repository';



export class AuthMiddleware {

  constructor(
    private readonly authRepository: AuthRepository,
  ) {}


  validateJWT = async(req: Request, res: Response, next: NextFunction ) => {

    const authorization = req.header('Authorization');
    if ( !authorization ) return res.status(401).json({ error: 'No token provided' });
    if ( !authorization.startsWith('Bearer ') ) return res.status(401).json({ error: 'Invalid Bearer token' });

    const token = authorization.split(' ').at(1) || '';

    try {

      const payload = await JwtAdapter.validateAccessToken(token);
      if ( !payload ) return res.status(401).json({ error: 'Invalid token' });

      const session = await this.authRepository.getSessionById(payload.sessionId);
      if ( !session || session.userId !== payload.sub ) {
        return res.status(401).json({ error: 'Invalid session' });
      }

      if ( session.revokedAt ) return res.status(401).json({ error: 'Session revoked' });
      if ( session.expiresAt.getTime() <= Date.now() ) {
        return res.status(401).json({ error: 'Session expired' });
      }

      const user = await new GetUserById(this.authRepository).execute(payload.sub);
      if ( !user ) return res.status(401).json({ error: 'Invalid token - user not found' })


      req.user = user;
      req.sessionId = session.id;


      next();
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Internal server error' });
    }




  }


}
