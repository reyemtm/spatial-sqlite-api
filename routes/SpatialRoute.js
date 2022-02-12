const {
  GetPropertiesByDistance,
  GetByDistance,
  GetParcels,
  GetNearest,
  GetWithin,
} = require("../controllers/SpatialSQL.js");

function spatialRoutes(fastify, options, done) {

  const {keys, cookieName } = options;

  fastify.register(require("../lib/jwtAuth"), {
    keys: keys,
    cookieName: cookieName
  })

  fastify.get("/:database/geocoder", GetPropertiesByDistance)

  fastify.get("/:database/dist", GetByDistance);

  fastify.get("/:database/parcels", GetParcels);

  fastify.get("/:database/nearest", GetNearest);

  fastify.get("/:database/within", GetWithin);

  done();
}

module.exports = spatialRoutes;
