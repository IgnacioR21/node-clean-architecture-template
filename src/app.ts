import { envs } from './config';
import { AppRoutes } from './main/routes';
import { Server } from './main/server';
import { PostgresDatabase } from './shared/infrastructure/database/db';




(()=> {
  main();
})()



async function main (){
  
  await PostgresDatabase.connect()

  
  new Server({
    port: envs.PORT,
    routes: AppRoutes.routes
  })
    .start()
}


