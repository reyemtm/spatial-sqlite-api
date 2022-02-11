const fastify = require("fastify")({
  logger: {
    level: "info",
  },
});
require("dotenv").config();

fastify.register(require("fastify-rate-limit"), {
  max: 100,
  timeWindow: "1 minute",
});
// fastify.register(require("fastify-swagger"), {
//   exposeRoute: true,
//   routePrefix: "/docs",
//   swagger: {
//     info: { title: "fastify-api" },
//   },
// });

// fastify.register(require("./routes/items"));
fastify.register(require("./routes/Home"));
fastify.register(require("./routes/Spatial"));

const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    await fastify.listen(PORT);
  } catch (error) {
    fastify.log.error(error);
    process.exit(1);
  }
};

start();
