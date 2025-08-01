import swaggerJsdoc, { Options } from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Application } from 'express';

const options: Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Gestion Documents Mairie API',
      version: '1.0.0',
      description: 'API pour la gestion des documents de la mairie',
    },
    servers: [
      {
        url: 'http://localhost:3000', // Remplacez par l'URL de votre API
        description: 'Serveur local',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT', // Format du token
        },
      },
    },
    security: [
      {
        bearerAuth: [], // Applique la sécurité par défaut à toutes les routes
      },
    ],
  },
  apis: ['./src/Routes/*.ts'], // Chemin vers vos fichiers de routes
};

const swaggerSpec = swaggerJsdoc(options);

/**
 * Configure Swagger pour l'application Express.
 * @param app - Instance de l'application Express
 */
const setupSwagger = (app: Application): void => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};

export default setupSwagger;