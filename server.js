require("dotenv").config();
const fastify = require("fastify")({
  logger: {
    level: "warn",
  },
});

const genKeys = (string) => {
  if (!string) return
  const array = (string.includes(",")) ? string.split(",") : null;
  if (!array) return
  const keys = [];
  for (let i = 0; i < array.length; i++) {
    let hasKey = false
    keys.forEach(k => {
      if (k.file === array[i]) {
        k.keys.push(array[i+1])
        hasKey = true
      }
    });
    if (!hasKey) {
      keys.push({
        file: array[i],
        keys: [array[i+1]]
      })
    }
    i++
  }
  return keys
}

const options = {
  keys: genKeys(process.env.KEYS),
  cookieName: "_ssql"
}

fastify.register(require('fastify-cors'), { 
  // put your options here
})

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
fastify.register(require("./routes/SpatialRoute"), options);

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
