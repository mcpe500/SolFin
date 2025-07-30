// server.js
require('dotenv').config(); // Load environment variables
const fastify = require('fastify')({ logger: true });

// Placeholder for Sequelize initialization
// const sequelize = require('./models'); // Assuming you set up your models/index.js correctly

// Define a simple route
fastify.get('/', function (request, reply) {
  reply.send({ hello: 'world' });
});

// Placeholder for database connection test and sync
// sequelize.authenticate().then(() => {
//   console.log('Database connection has been established successfully.');
//   // Sync models (creates tables if they don't exist)
//   return sequelize.sync();
// }).then(() => {
   const start = async () => {
     try {
       await fastify.listen({ port: 3000, host: '0.0.0.0' });
       fastify.log.info(`server listening on ${fastify.server.address().port}`);
     } catch (err) {
       fastify.log.error(err);
       process.exit(1);
     }
   };
   start();
// }).catch(err => {
//   console.error('Unable to connect to the database:', err);
// });