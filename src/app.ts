import './shared/types/express';
import { envs } from './config';
import { connectDatabase } from './main/bootstrap/database';
import { AppRoutes } from './main/routes';
import { Server } from './main/server';




(()=> {
  main();
})()



async function main (){
  
  await connectDatabase()

  
  new Server({
    port: envs.PORT,
    routes: AppRoutes.routes
  })
    .start()
}
