import { CustomError } from '../../../../shared/errors/custom.error';
import { UserEntity } from '../../domain/entities/user.entity';



export class UserMapper {

  
  static userEntityFromObject(object: { [key: string]:any }) {

    const { id, _id, name, email, password, roles } = object;

    if ( !_id && !id ) {
      throw CustomError.badRequest('Missing id');
    }

    if ( !name ) throw CustomError.badRequest('Missing name');
    if ( !email ) throw CustomError.badRequest('Missing email');
    if ( !password ) throw CustomError.badRequest('Missing password');
    if ( !roles ) throw CustomError.badRequest('Missing roles');


    return new UserEntity(
      _id || id,
      name, 
      email,
      password,
      roles
    );
  }




}
