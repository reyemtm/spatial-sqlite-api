module.exports = {
  apps: [
    {
      name: "spatialite_cluster",
      script: "./server.js",
      instances: 4,
      exec_mode: "cluster",
      watch: false,
      increments_var: "PORT",
      env: {
        PORT: 5000,
        NODE_ENV: "production",
      },
    },
  ],
};
