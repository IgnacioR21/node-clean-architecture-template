import { AuthSessionEntity, CreateAuthSession, RotateAuthSession } from '../entities/auth-session.entity';
import { UserEntity } from '../entities/user.entity';




export abstract class AuthRepository {

  abstract login( email: string, password: string ):Promise<UserEntity>;
  abstract register( userData: { name: string, email: string, password: string } ):Promise<UserEntity>;
  abstract getUserById( id: string ): Promise<UserEntity | null>;
  abstract createSession( sessionData: CreateAuthSession ): Promise<AuthSessionEntity>;
  abstract getSessionById( id: string ): Promise<AuthSessionEntity | null>;
  abstract rotateSession( id: string, sessionData: RotateAuthSession ): Promise<AuthSessionEntity>;
  abstract revokeSession( id: string ): Promise<void>;


}
