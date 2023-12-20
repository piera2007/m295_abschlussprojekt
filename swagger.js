const swaggerAutogen = require('swagger-autogen')();
const outputFile = './swagger_output.json';
const endpointsFiles = ['./Task_Aufgabe.js']; // Passe den Dateinamen entsprechend an, falls er anders ist
swaggerAutogen(outputFile, endpointsFiles);