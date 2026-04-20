import { Router } from 'express';
import { AuthDatasourceImpl } from '../../modules/auth/infrastructure/persistence/drizzle/auth.datasource.impl';
import { AuthRepositoryImpl } from '../../modules/auth/infrastructure/persistence/drizzle/auth.repository.impl';
import { AuthController } from '../../modules/auth/presentation/controller';
import { AuthMiddleware } from '../../modules/auth/presentation/middlewares/auth.middleware';
import { AuthRoutes } from '../../modules/auth/presentation/routes';




export class AuthDI {


  static get routes(): Router {

    const datasource = new AuthDatasourceImpl();
    const authRepository = new AuthRepositoryImpl(datasource);

    const controller = new AuthController(authRepository);
    const middleware = new AuthMiddleware(authRepository);

    return new AuthRoutes(controller, middleware).routes;
  }


}
