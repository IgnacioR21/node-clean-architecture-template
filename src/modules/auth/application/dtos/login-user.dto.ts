export class LoginUserDto {
  constructor(
    public email: string,
    public password: string
  ) {}

  static create( object: { email: string; password: string } ): LoginUserDto {

    const { email, password } = object;

    return new LoginUserDto(email, password);
  }
}
