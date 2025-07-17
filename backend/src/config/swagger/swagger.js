const swaggerJSDoc = require('swagger-jsdoc');

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'ElNaizak API Documentation',
    version: '1.0.0',
    description: 'Automatically generated API documentation for ElNaizak backend',
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Development server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
};
//import "../../modules/customer/routes/customer.routes"

const options = {
  swaggerDefinition,
  apis: [
    './src/modules/**/*.js',    // All controller & route files
    //'../../modules/captain/controllers/**/*.js',
   // '../../modules/captain/routes/**/*.js',
   // '../../modules/customer/routes/customer.routes',
   // '../../modules/customer/routes/**/*.js',
  ],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
