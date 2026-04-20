import { AuthSessionEntity, CreateAuthSession, RotateAuthSession } from '../../../domain/entities/auth-session.entity';
import { AuthDatasource } from '../../../domain/datasources/auth.datasource';
import { UserEntity } from '../../../domain/entities/user.entity';
import { AuthRepository } from '../../../domain/repositories/auth.repository';



export class AuthRepositoryImpl implements AuthRepository {
  
  constructor(
    private readonly authDatasource: AuthDatasource,
  ) {}
  login( email: string, password: string ): Promise<UserEntity> {
    return this.authDatasource.login( email, password );
  }
  
  register( userData: { name: string, email: string, password: string } ): Promise<UserEntity> {
    return this.authDatasource.register(userData);
  }

  getUserById( id: string ): Promise<UserEntity | null> {
    return this.authDatasource.getUserById(id);
  }

  createSession( sessionData: CreateAuthSession ): Promise<AuthSessionEntity> {
    return this.authDatasource.createSession(sessionData);
  }

  getSessionById( id: string ): Promise<AuthSessionEntity | null> {
    return this.authDatasource.getSessionById(id);
  }

  rotateSession( id: string, sessionData: RotateAuthSession ): Promise<AuthSessionEntity> {
    return this.authDatasource.rotateSession(id, sessionData);
  }

  revokeSession( id: string ): Promise<void> {
    return this.authDatasource.revokeSession(id);
  }


}
