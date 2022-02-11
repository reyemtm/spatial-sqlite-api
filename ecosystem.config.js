module.exports = {
  apps: [
    {
      name: "spatialite_cluster",
      script: "./server.js",
      instances: 2,
      exec_mode: "cluster",
      watch: false,
      increments_var: "PORT",
      env: {
        PORT: 5001,
        NODE_ENV: "production",
      },
    },
  ],
};
