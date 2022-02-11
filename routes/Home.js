const { readFileSync } = require("fs");

function Home(fastify, options, done) {
  fastify.get("/", (req, reply) => {
    reply.type("text/html").send(readFileSync("./static/index.html", "utf-8"));
  });

  done();
}

module.exports = Home;
