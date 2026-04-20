export class RefreshTokenDto {

  constructor(
    public refreshToken: string,
  ) {}

  static create( object: { refreshToken: string } ): RefreshTokenDto {
    return new RefreshTokenDto(object.refreshToken.trim());
  }

}
