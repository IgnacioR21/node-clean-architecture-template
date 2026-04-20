import { AuthRepository } from '../../domain/repositories/auth.repository';

interface LogoutSessionResponse {
  message: string;
}

interface LogoutSessionUseCase {
  execute( sessionId: string ): Promise<LogoutSessionResponse>;
}

export class LogoutSession implements LogoutSessionUseCase {

  constructor(
    private readonly authRepository: AuthRepository,
  ) {}


  async execute( sessionId: string ): Promise<LogoutSessionResponse> {
    await this.authRepository.revokeSession(sessionId);

    return {
      message: 'Session closed successfully',
    };
  }

}
