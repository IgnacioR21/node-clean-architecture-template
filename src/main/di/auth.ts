import { Router } from 'express';
import { AuthRepositoryImpl } from '../../modules/auth/infrastructure/repositories/auth.repository.impl';
import { AuthController } from '../../modules/auth/presentation/controller';
import { AuthMiddleware } from '../../modules/auth/presentation/middlewares/auth.middleware';
import { AuthRoutes } from '../../modules/auth/presentation/routes';
import { makeAuthDatasource } from '../factories/auth-datasource.factory';




export class AuthDI {


  static get routes(): Router {

    const datasource = makeAuthDatasource();
    const authRepository = new AuthRepositoryImpl(datasource);

    const controller = new AuthController(authRepository);
    const middleware = new AuthMiddleware(authRepository);

    return new AuthRoutes(controller, middleware).routes;
  }


}
