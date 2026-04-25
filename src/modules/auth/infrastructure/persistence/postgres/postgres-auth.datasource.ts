import { randomUUID } from 'crypto';
import { eq } from 'drizzle-orm';
import { BcryptAdapter } from '../../../../../config';
import { CustomError } from '../../../../../shared/errors/custom.error';
import { db } from '../../../../../shared/infrastructure/database/postgres/db';
import { AuthDatasource } from '../../../domain/datasources/auth.datasource';
import { AuthSessionEntity, CreateAuthSession, RotateAuthSession } from '../../../domain/entities/auth-session.entity';
import { UserEntity } from '../../../domain/entities/user.entity';
import { AuthSessionMapper } from '../../mappers/auth-session.mapper';
import { UserMapper } from '../../mappers/user.mapper';
import { authSessionsTable } from './auth-session.schema';
import { usersTable } from './user.schema';


type HashFunction = (password: string) => string;
type CompareFunction = (password: string, hashed: string) => boolean;


export class PostgresAuthDatasource implements AuthDatasource {

  constructor(
    private readonly hashPassword: HashFunction = BcryptAdapter.hash,
    private readonly comparePassword: CompareFunction = BcryptAdapter.compare,
  ) {}



  async login( email: string, password: string ): Promise<UserEntity> {

    try {
      const user = await db.query.usersTable.findFirst({
        where: eq(usersTable.email, email),
      });

      if ( !user ) throw CustomError.badRequest('User does not exists - email');

      const isMatching = this.comparePassword(password, user.password);
      if ( !isMatching ) throw CustomError.badRequest('Password is not valid');

      return UserMapper.userEntityFromObject(user);


    } catch (error) {
      
      if( error instanceof CustomError ) {
        throw error;
      }
      console.log(error); 
      throw CustomError.internalServer();
    }


  }

  
  async register( userData: { name: string, email: string, password: string } ): Promise<UserEntity> {
    const { name, email, password } = userData;

    try {

      // 1. Verificar si el correo existe
      const exists = await db.query.usersTable.findFirst({
        where: eq(usersTable.email, email),
      });
      if ( exists ) throw CustomError.badRequest('User already exists');
      
      // 2. Hash de contraseÃ±a
      const [ user ] = await db.insert(usersTable).values({
        id: randomUUID(),
        name: name,
        email: email,
        password: this.hashPassword( password ),
      }).returning();


      // 3. Mapear la respuesta a nuestra entidad
      return UserMapper.userEntityFromObject(user);

      
    } catch (error) {
      
      if( error instanceof CustomError ) {
        throw error;
      }
      throw CustomError.internalServer();

    }
    
  }


  async getUserById( id: string ): Promise<UserEntity | null> {
    try {
      const user = await db.query.usersTable.findFirst({
        where: eq(usersTable.id, id),
      });

      if ( !user ) return null;

      return UserMapper.userEntityFromObject(user);
    } catch (_error) {
      throw CustomError.internalServer();
    }
  }

  async createSession( sessionData: CreateAuthSession ): Promise<AuthSessionEntity> {
    try {
      const [session] = await db.insert(authSessionsTable).values({
        id: sessionData.id,
        userId: sessionData.userId,
        refreshTokenHash: sessionData.refreshTokenHash,
        userAgent: sessionData.userAgent,
        ip: sessionData.ip,
        expiresAt: sessionData.expiresAt,
      }).returning();

      return AuthSessionMapper.authSessionEntityFromObject(session);
    } catch (_error) {
      throw CustomError.internalServer();
    }
  }

  async getSessionById( id: string ): Promise<AuthSessionEntity | null> {
    try {
      const session = await db.query.authSessionsTable.findFirst({
        where: eq(authSessionsTable.id, id),
      });

      if ( !session ) return null;

      return AuthSessionMapper.authSessionEntityFromObject(session);
    } catch (_error) {
      throw CustomError.internalServer();
    }
  }

  async rotateSession( id: string, sessionData: RotateAuthSession ): Promise<AuthSessionEntity> {
    try {
      const [session] = await db.update(authSessionsTable).set({
        refreshTokenHash: sessionData.refreshTokenHash,
        expiresAt: sessionData.expiresAt,
        updatedAt: new Date(),
      }).where(eq(authSessionsTable.id, id)).returning();

      if ( !session ) throw CustomError.badRequest('Session not found');

      return AuthSessionMapper.authSessionEntityFromObject(session);
    } catch (error) {
      if ( error instanceof CustomError ) throw error;

      throw CustomError.internalServer();
    }
  }

  async revokeSession( id: string ): Promise<void> {
    try {
      await db.update(authSessionsTable).set({
        revokedAt: new Date(),
        updatedAt: new Date(),
      }).where(eq(authSessionsTable.id, id));
    } catch (_error) {
      throw CustomError.internalServer();
    }
  }



}
