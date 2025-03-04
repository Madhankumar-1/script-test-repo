module.exports = {
    apps: [
        {
            name: "pm2-node-app",
            script: "./server.js",
            instances: "2",
            // exec_mode: "cluster",
            watch: true,
            env: {
                NODE_ENV: "development",
                PORT: 3000
            },
            env_production: {
                NODE_ENV: "production",
                PORT: 8080
            }
        }
    ]
};
