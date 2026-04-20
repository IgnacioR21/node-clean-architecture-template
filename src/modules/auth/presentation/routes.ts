import { Router } from 'express';
import { ValidateZodMiddleware } from '../../../shared/presentation/middlewares/validate-zod.middleware';
import { AuthController } from './controller';
import { AuthMiddleware } from './middlewares/auth.middleware';
import { loginSchema, refreshSchema, registerSchema } from './validators';




export class AuthRoutes {

  constructor(
    private readonly authController: AuthController,
    private readonly authMiddleware: AuthMiddleware,
  ) {}

  get routes(): Router {

    const router = Router();

    // Definir todas mis rutas principales
    router.post('/login', [ ValidateZodMiddleware.validateBody(loginSchema) ], this.authController.loginUser )
    router.post('/register', [ ValidateZodMiddleware.validateBody(registerSchema) ], this.authController.registerUser)
    router.post('/refresh', [ ValidateZodMiddleware.validateBody(refreshSchema) ], this.authController.refreshSession)
    router.post('/logout', [ this.authMiddleware.validateJWT ], this.authController.logoutSession)
    
    router.get('/', [this.authMiddleware.validateJWT] ,this.authController.getUser );
    
    


    return router;
  }


}
