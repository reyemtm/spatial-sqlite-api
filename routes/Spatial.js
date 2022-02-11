const {
  searchByDistance,
  searchParcels,
  findNearest,
  findWithin,
} = require("../controllers/SpatialSQL.js");

function spatialRoutes(fastify, options, done) {
  fastify.get("/places", searchByDistance);

  fastify.get("/parcels", searchParcels);

  fastify.get("/parcels/nearest", findNearest);

  fastify.get("/parcels/within", findWithin);

  done();
}

module.exports = spatialRoutes;
