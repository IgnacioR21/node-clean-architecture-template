import { AuthRepository } from '../../domain/repositories/auth.repository';
import { UserEntity } from '../../domain/entities/user.entity';


interface GetUserByIdUseCase {
  execute( id: string ): Promise<UserEntity | null>;
}


export class GetUserById implements GetUserByIdUseCase {

  constructor(
    private readonly authRepository: AuthRepository,
  ) {}


  execute( id: string ): Promise<UserEntity | null> {
    return this.authRepository.getUserById(id);
  }


}
