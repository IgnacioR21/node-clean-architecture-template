export class RegisterUserDto {

  private constructor(
    public name: string,
    public email: string,
    public password: string,
  ) { }

  static create( object: { name: string; email: string; password: string } ): RegisterUserDto {

    const { name, email, password } = object;

    return new RegisterUserDto(name, email, password);
  }


}
