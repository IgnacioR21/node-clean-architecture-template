import { UserEntity } from '../../../modules/auth/domain/entities/user.entity';


declare global {
  namespace Express {
    interface Request {
      sessionId?: string;
      user?: UserEntity;
    }
  }
}


export {};
