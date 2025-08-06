const speakers = require('../data/speakers.json');
const sessions = require('../data/sessions.json');
const locations = require('../data/locations.json');

async function routes (fastify, options) {
  fastify.get('/confdata', async (request, reply) => {
    reply.type('application/json').code(200);
    return {
      sessions: sessions,
      speakers: speakers,
      locations: locations
    };
  });
}

module.exports = routes;