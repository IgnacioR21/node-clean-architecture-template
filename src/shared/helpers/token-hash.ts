import { createHash } from 'crypto';

export class TokenHashHelper {

  static hash( token: string ): string {
    return createHash('sha256').update(token).digest('hex');
  }

}
