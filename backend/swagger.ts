import swaggerAutogen from 'swagger-autogen';

const doc = {
    info: {
        title: 'Taskify REST API',
        description: 'Taskify Backend REST API Documentation'
    },
    host: 'taskify-deployments-production.up.railway.app'
};

const outputFile = './swagger-output.json';
const routes = ['./src/app.ts'];

/* NOTE: If you are using the express Router, you must pass in the 'routes' only the 
root file where the route starts, such as index.js, app.js, routes.js, etc ... */

swaggerAutogen()(outputFile, routes, doc);
