import dotenv from 'dotenv';
// Load environment variables from .env file
dotenv.config();
import express, { Request, Response, Express } from 'express';
const app: Express = express();
const port: number = process.env.PORT ? Number(process.env.PORT) : 3000;
import { DBConnection } from './db/connection';
DBConnection.getInstance().connect();
app.get('/', (req: Request, res: Response) => {
    res.send('Hello, TypeScript with Express!');
});

// Dynamic Routing based on the Module's name from modules folder
import { readdirSync } from 'fs';
import { join, extname, basename } from 'path';
import { CustomRouteT } from './factory/types/factory';
import pluralize from 'pluralize';

const modulesPath: string = join(__dirname, 'modules');
const moduleFiles: string[] = readdirSync(modulesPath);

moduleFiles.forEach((moduleFile: string) => {
    // Remove file extension (.ts or .js) to get module name
    const moduleName = basename(moduleFile, extname(moduleFile));
    const routeName = pluralize(moduleName.toLowerCase());
    
    console.log(`Module file: ${moduleFile}, Module: ${moduleName}, Route: ${routeName}`);
    const modulePath: string = join(modulesPath, moduleFile);
    
    import(modulePath).then(module => {
        const controller = new module.default();

        controller.customRoutes.forEach((route: CustomRouteT) => {
            console.log(`Registering custom route: ${routeName + route.path} - ${route.method}`);
            switch(route.method) {
                case 'GET':
                    app.get(`/${routeName + route.path}`, route.handler);
                    break;
                case 'POST':
                    app.post(`/${routeName + route.path}`, route.handler);
                    break;
                case 'PUT':
                    app.put(`/${routeName + route.path}`, route.handler);
                    break;
                case 'PATCH':
                    app.patch(`/${routeName + route.path}`, route.handler);
                    break;
                case 'DELETE':
                    app.delete(`/${routeName + route.path}`, route.handler);
                    break;
                default:
                    console.error('Invalid method');
            }
        });

        /* DEFAULT CRUD ROUTES START */
        app.get(`/${routeName}`, controller.readAll);
        app.get(`/${routeName}/:id`, controller.read);
        app.post(`/${routeName}`, controller.create);
        app.put(`/${routeName}/:id`, controller.update);
        app.delete(`/${routeName}/:id`, controller.delete);
        /* DEFAULT CRUD ROUTES END */
    }).catch(error => {
        console.error(`Error importing module: ${error}`);
    });
});


app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
