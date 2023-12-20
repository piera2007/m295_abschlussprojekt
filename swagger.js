const swaggerAutogen = require('swagger-autogen')();
const outputFile = './swagger_output.json';
const endpointsFiles = ['./Task_Aufgabe.js'];
swaggerAutogen(outputFile, endpointsFiles);