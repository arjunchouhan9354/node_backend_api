const { Client } = require("@elastic/elasticsearch");
const config = require("./default.json");
const configElastic = config.elastic;

// Elastic connection
const elasticClient = new Client({
  node: configElastic.host,
  auth: {
    username: configElastic.username,
    password: configElastic.password,
  },
});

module.exports = elasticClient;
